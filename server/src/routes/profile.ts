import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { z } from "zod";
import prisma from "../lib/prisma";
import { authenticate } from "../middleware/auth";
import { sendVerificationEmail } from "../lib/email";
import logger from "../lib/logger";

const router = Router();
const IS_PROD = process.env.NODE_ENV === "production";

function zodFieldErrors(error: z.ZodError): Record<string, string> {
  const result: Record<string, string> = {};
  for (const issue of error.issues) {
    const field = issue.path[0];
    if (field !== undefined && !result[String(field)]) {
      result[String(field)] = issue.message;
    }
  }
  return result;
}

const updateProfileSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  email: z.string().email("Invalid email address").optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
});

router.use(authenticate);

router.patch("/", async (req: Request, res: Response) => {
  try {
    const parsed = updateProfileSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ errors: zodFieldErrors(parsed.error) });
      return;
    }

    const { name, email } = parsed.data;
    const userId = req.user!.userId;

    if (!name && !email) {
      res.status(400).json({ error: "Nothing to update" });
      return;
    }

    const current = await prisma.user.findUnique({ where: { id: userId } });
    if (!current) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const updates: Record<string, unknown> = {};

    if (name && name.trim()) {
      updates.name = name.trim();
    }

    const emailChanged = email && email !== current.email;

    if (emailChanged) {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        res.status(409).json({ error: "Email already in use" });
        return;
      }
      const verificationToken = crypto.randomBytes(32).toString("hex");
      updates.email = email;
      updates.isEmailVerified = false;
      updates.emailVerificationToken = verificationToken;
      updates.emailVerificationExpiry = new Date(
        Date.now() + 24 * 60 * 60 * 1000,
      );
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: updates,
      select: { id: true, email: true, name: true, isEmailVerified: true },
    });

    if (emailChanged) {
      sendVerificationEmail(
        updated.email,
        updates.emailVerificationToken as string,
      ).catch((err) => {
        logger.error(
          { err, userId },
          "Failed to send verification email after email change",
        );
      });
    }

    logger.info({ userId }, "Profile updated");
    res.json({ user: updated });
  } catch (error) {
    logger.error({ err: error, route: "PATCH /profile" }, "Update profile error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/password", async (req: Request, res: Response) => {
  try {
    const parsed = changePasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ errors: zodFieldErrors(parsed.error) });
      return;
    }

    const { currentPassword, newPassword } = parsed.data;
    const userId = req.user!.userId;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) {
      res.status(400).json({ error: "Current password is incorrect" });
      return;
    }

    const hashed = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashed },
    });

    logger.info({ userId }, "Password changed");
    res.json({ ok: true });
  } catch (error) {
    logger.error(
      { err: error, route: "PATCH /profile/password" },
      "Change password error",
    );
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/", async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;

    await prisma.user.delete({ where: { id: userId } });

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

    logger.info({ userId }, "Account deleted");
    res.json({ ok: true });
  } catch (error) {
    logger.error(
      { err: error, route: "DELETE /profile" },
      "Delete account error",
    );
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
