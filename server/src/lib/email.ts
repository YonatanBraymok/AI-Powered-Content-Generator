import { Resend } from "resend";
import logger from "./logger";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_ADDRESS =
  process.env.EMAIL_FROM ?? "noreply@yourdomain.com";

const APP_URL = process.env.APP_URL ?? "http://localhost:3000";

export async function sendVerificationEmail(
  to: string,
  token: string
): Promise<void> {
  const link = `${APP_URL}/verify-email?token=${token}`;

  const { error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject: "Verify your email address",
    html: `
      <p>Thanks for signing up! Please verify your email address by clicking the link below.</p>
      <p><a href="${link}">Verify Email</a></p>
      <p>This link expires in 24 hours.</p>
      <p>If you did not create an account, you can safely ignore this email.</p>
    `,
  });

  if (error) {
    logger.error({ err: error, to }, "Failed to send verification email");
    throw new Error("Failed to send verification email");
  }

  logger.info({ to }, "Verification email sent");
}

export async function sendPasswordResetEmail(
  to: string,
  token: string
): Promise<void> {
  const link = `${APP_URL}/reset-password?token=${token}`;

  const { error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject: "Reset your password",
    html: `
      <p>You requested a password reset. Click the link below to set a new password.</p>
      <p><a href="${link}">Reset Password</a></p>
      <p>This link expires in 1 hour.</p>
      <p>If you did not request a password reset, you can safely ignore this email.</p>
    `,
  });

  if (error) {
    logger.error({ err: error, to }, "Failed to send password reset email");
    throw new Error("Failed to send password reset email");
  }

  logger.info({ to }, "Password reset email sent");
}
