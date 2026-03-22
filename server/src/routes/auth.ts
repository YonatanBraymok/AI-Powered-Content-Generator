import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import prisma from "../lib/prisma";
import { authenticate } from "../middleware/auth";
import logger from "../lib/logger";
import { sendVerificationEmail } from "../lib/email";

const router = Router();

const ACCESS_TOKEN_TTL_MS = 15 * 60 * 1000; // 15 minutes
const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const IS_PROD = process.env.NODE_ENV === "production";

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
    sameSite: "lax",
    maxAge: ACCESS_TOKEN_TTL_MS,
  });

  res.cookie("refresh_token", refreshToken, {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: "lax",
    maxAge: REFRESH_TOKEN_TTL_MS,
    path: "/api/auth",
  });
}

function clearAuthCookies(res: Response) {
  res.clearCookie("access_token");
  res.clearCookie("refresh_token", { path: "/api/auth" });
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
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      res.status(400).json({ error: "Email, password, and name are required" });
      return;
    }

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
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }

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
