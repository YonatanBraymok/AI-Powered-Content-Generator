"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Loader2, XCircle, Lock, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import type { ApiError } from "@/lib/api";
import { validatePassword } from "@/lib/validation";
import { Button } from "@/components/ui";
import {
  AuthCard,
  AuthCardContent,
  AuthCardFooter,
  AuthCardHeader,
} from "@/components/auth/auth-card";
import { AuthField } from "@/components/auth/auth-field";

function ResetPasswordFallback() {
  return (
    <AuthCard>
      <AuthCardHeader title="Loading…" description="Preparing password reset." />
      <AuthCardContent className="flex justify-center py-6">
        <Loader2 className="size-10 animate-spin text-muted-foreground" />
      </AuthCardContent>
    </AuthCard>
  );
}

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [done, setDone] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  if (!token) {
    return (
      <AuthCard>
        <AuthCardHeader
          title="Invalid link"
          description="This password reset link is missing a token. Request a new one."
        />
        <AuthCardContent className="flex justify-center py-6">
          <XCircle className="size-10 text-destructive" />
        </AuthCardContent>
        <AuthCardContent className="pt-0">
          <Button
            className="auth-primaryButton w-full"
            onClick={() => router.push("/forgot-password")}
          >
            Request new link
          </Button>
        </AuthCardContent>
      </AuthCard>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFieldErrors({});

    const errors: Record<string, string> = {};
    const passwordErr = validatePassword(password);
    if (passwordErr) errors.password = passwordErr;
    if (!confirm) {
      errors.confirm = "Please confirm your password";
    } else if (password !== confirm) {
      errors.confirm = "Passwords do not match";
    }

    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      toast.error("Please fix the errors below.");
      return;
    }

    setIsPending(true);
    try {
      await api.post("/api/auth/reset-password", { token, password });
      toast.success("Password updated! Redirecting…");
      setDone(true);
      setTimeout(() => router.replace("/login"), 2500);
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      if (apiErr.fieldErrors) {
        setFieldErrors(apiErr.fieldErrors);
        toast.error("Please fix the errors below.");
      } else {
        toast.error(apiErr.message ?? "Failed to reset password");
      }
    } finally {
      setIsPending(false);
    }
  }

  if (done) {
    return (
      <AuthCard>
        <AuthCardHeader
          title="Password updated!"
          description="Your password has been reset. Redirecting you to sign in…"
        />
        <AuthCardContent className="flex justify-center py-6">
          <CheckCircle2 className="size-10 text-green-500" />
        </AuthCardContent>
      </AuthCard>
    );
  }

  return (
    <AuthCard>
      <AuthCardHeader
        title="Reset your password"
        description="Enter and confirm your new password."
      />
      <form onSubmit={handleSubmit} noValidate>
        <AuthCardContent className="space-y-5">
          <AuthField
            id="password"
            label="New password"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isPending}
            icon={<Lock className="size-4" />}
            error={fieldErrors.password}
            helper={
              fieldErrors.password
                ? undefined
                : "Min 8 characters — include uppercase, lowercase, number, and special character (e.g. !@#$)"
            }
          />
          <AuthField
            id="confirm"
            label="Confirm new password"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            disabled={isPending}
            icon={<ShieldCheck className="size-4" />}
            error={fieldErrors.confirm}
          />
        </AuthCardContent>

        <AuthCardContent className="pt-0">
          <Button
            type="submit"
            className="auth-primaryButton w-full"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Updating…
              </>
            ) : (
              "Update password"
            )}
          </Button>
        </AuthCardContent>

        <AuthCardFooter>
          <p className="text-center text-sm text-muted-foreground">
            Remember your password?{" "}
            <Link
              href="/login"
              className="font-semibold text-foreground underline-offset-4 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </AuthCardFooter>
      </form>
    </AuthCard>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordFallback />}>
      <ResetPasswordContent />
    </Suspense>
  );
}
