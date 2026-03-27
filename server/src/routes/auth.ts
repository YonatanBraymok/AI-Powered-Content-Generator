import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { z } from "zod";
import prisma from "../lib/prisma";
import { authenticate } from "../middleware/auth";
import { passwordResetLimiter } from "../middleware/rate-limit";
import logger from "../lib/logger";
import { sendVerificationEmail, sendPasswordResetEmail } from "../lib/email";
import { IS_PROD, zodFieldErrors } from "../lib/utils";

const router = Router();

const strongPassword = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character");

const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: strongPassword,
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  password: strongPassword,
});

const ACCESS_TOKEN_TTL_MS = 15 * 60 * 1000; // 15 minutes
const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function setAuthCookies(
  res: Response,
  accessToken: string,
  refreshToken: string,
) {
  res.cookie("access_token", accessToken, {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: IS_PROD ? "none" : "lax",
    maxAge: ACCESS_TOKEN_TTL_MS,
  });

  res.cookie("refresh_token", refreshToken, {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: IS_PROD ? "none" : "lax",
    maxAge: REFRESH_TOKEN_TTL_MS,
    path: "/api/auth",
  });
}

export function clearAuthCookies(res: Response) {
  res.clearCookie("access_token", {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: IS_PROD ? "none" : "lax",
  });
  res.clearCookie("refresh_token", {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: IS_PROD ? "none" : "lax",
    path: "/api/auth",
  });
}

async function issueTokens(
  res: Response,
  userId: string,
): Promise<{ accessToken: string; refreshToken: string }> {
  const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET!, {
    expiresIn: "15m",
  });

  const refreshToken = crypto.randomBytes(40).toString("hex");
  const tokenHash = hashToken(refreshToken);

  await prisma.refreshToken.create({
    data: {
      tokenHash,
      userId,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
    },
  });

  setAuthCookies(res, accessToken, refreshToken);
  return { accessToken, refreshToken };
}

router.post("/register", async (req: Request, res: Response) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ errors: zodFieldErrors(parsed.error) });
      return;
    }

    const { email, password, name } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({ error: "Email already in use" });
      return;
    }

    const hashed = await bcrypt.hash(password, 12);
    const verificationToken = crypto.randomBytes(32).toString("hex");

    const user = await prisma.user.create({
      data: {
        email,
        password: hashed,
        name,
        emailVerificationToken: verificationToken,
        emailVerificationExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    sendVerificationEmail(user.email, verificationToken).catch((err) => {
      logger.error({ err, userId: user.id }, "Failed to send verification email after register");
    });

    await issueTokens(res, user.id);

    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (error) {
    logger.error({ err: error, route: "POST /register" }, "Register error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/login", async (req: Request, res: Response) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ errors: zodFieldErrors(parsed.error) });
      return;
    }

    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    await issueTokens(res, user.id);

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (error) {
    logger.error({ err: error, route: "POST /login" }, "Login error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/refresh", async (req: Request, res: Response) => {
  try {
    const rawToken = req.cookies?.refresh_token;

    if (!rawToken) {
      res.status(401).json({ error: "Missing refresh token" });
      return;
    }

    const tokenHash = hashToken(rawToken);
    const stored = await prisma.refreshToken.findUnique({
      where: { tokenHash },
    });

    if (!stored || stored.expiresAt < new Date()) {
      clearAuthCookies(res);
      res.status(401).json({ error: "Invalid or expired refresh token" });
      return;
    }

    // Rotate: delete old refresh token and issue new ones
    await prisma.refreshToken.delete({ where: { tokenHash } });
    await issueTokens(res, stored.userId);

    res.json({ ok: true });
  } catch (error) {
    logger.error({ err: error, route: "POST /refresh" }, "Refresh error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/logout", async (req: Request, res: Response) => {
  try {
    const rawToken = req.cookies?.refresh_token;

    if (rawToken) {
      const tokenHash = hashToken(rawToken);
      await prisma.refreshToken
        .delete({ where: { tokenHash } })
        .catch(() => {});
    }

    clearAuthCookies(res);
    res.json({ ok: true });
  } catch (error) {
    logger.error({ err: error, route: "POST /logout" }, "Logout error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/verify-email", async (req: Request, res: Response) => {
  try {
    const { token } = req.query;

    if (!token || typeof token !== "string") {
      res.status(400).json({ error: "Invalid or missing token" });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { emailVerificationToken: token },
    });

    if (
      !user ||
      !user.emailVerificationExpiry ||
      user.emailVerificationExpiry < new Date()
    ) {
      res.status(400).json({ error: "Invalid or expired verification token" });
      return;
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpiry: null,
      },
    });

    logger.info({ userId: user.id }, "Email verified");
    res.json({ ok: true });
  } catch (error) {
    logger.error({ err: error, route: "GET /verify-email" }, "Verify email error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/resend-verification", authenticate, async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
    });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    if (user.isEmailVerified) {
      res.status(400).json({ error: "Email is already verified" });
      return;
    }

    const verificationToken = crypto.randomBytes(32).toString("hex");

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken: verificationToken,
        emailVerificationExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    await sendVerificationEmail(user.email, verificationToken);

    logger.info({ userId: user.id }, "Verification email resent");
    res.json({ ok: true });
  } catch (error) {
    logger.error({ err: error, route: "POST /resend-verification" }, "Resend verification error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/forgot-password", passwordResetLimiter, async (req: Request, res: Response) => {
  try {
    const parsed = forgotPasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ errors: zodFieldErrors(parsed.error) });
      return;
    }

    const { email } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email } });

    // Always respond with the same message to avoid leaking whether the email exists
    if (!user) {
      res.json({ ok: true });
      return;
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: resetToken,
        passwordResetExpiry: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      },
    });

    sendPasswordResetEmail(user.email, resetToken).catch((err) => {
      logger.error({ err, userId: user.id }, "Failed to send password reset email");
    });

    logger.info({ userId: user.id }, "Password reset email requested");
    res.json({ ok: true });
  } catch (error) {
    logger.error({ err: error, route: "POST /forgot-password" }, "Forgot password error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/reset-password", async (req: Request, res: Response) => {
  try {
    const parsed = resetPasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ errors: zodFieldErrors(parsed.error) });
      return;
    }

    const { token, password } = parsed.data;

    const user = await prisma.user.findUnique({
      where: { passwordResetToken: token },
    });

    if (!user || !user.passwordResetExpiry || user.passwordResetExpiry < new Date()) {
      res.status(400).json({ error: "Invalid or expired reset token" });
      return;
    }

    const hashed = await bcrypt.hash(password, 12);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashed,
          passwordResetToken: null,
          passwordResetExpiry: null,
        },
      }),
      prisma.refreshToken.deleteMany({ where: { userId: user.id } }),
    ]);

    clearAuthCookies(res);
    logger.info({ userId: user.id }, "Password reset successful");
    res.json({ ok: true });
  } catch (error) {
    logger.error({ err: error, route: "POST /reset-password" }, "Reset password error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/me", authenticate, async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        isEmailVerified: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json({ user });
  } catch (error) {
    logger.error({ err: error, route: "GET /me" }, "Me error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
