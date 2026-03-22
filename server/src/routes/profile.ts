import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import prisma from "../lib/prisma";
import { authenticate } from "../middleware/auth";
import { sendVerificationEmail } from "../lib/email";
import logger from "../lib/logger";

const router = Router();
const IS_PROD = process.env.NODE_ENV === "production";

router.use(authenticate);

router.patch("/", async (req: Request, res: Response) => {
  try {
    const { name, email } = req.body;
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

    if (name && typeof name === "string" && name.trim()) {
      updates.name = name.trim();
    }

    const emailChanged =
      email && typeof email === "string" && email !== current.email;

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
    const { currentPassword, newPassword } = req.body;
    const userId = req.user!.userId;

    if (!currentPassword || !newPassword) {
      res.status(400).json({ error: "Current and new password are required" });
      return;
    }

    if (typeof newPassword !== "string" || newPassword.length < 6) {
      res
        .status(400)
        .json({ error: "New password must be at least 6 characters" });
      return;
    }

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
