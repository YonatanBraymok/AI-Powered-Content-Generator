"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Loader2, Mail } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import type { ApiError } from "@/lib/api";
import { validateEmail } from "@/lib/validation";
import { Button } from "@/components/ui";
import {
  AuthCard,
  AuthCardContent,
  AuthCardFooter,
  AuthCardHeader,
} from "@/components/auth/auth-card";
import { AuthField } from "@/components/auth/auth-field";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [sent, setSent] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFieldErrors({});

    const emailErr = validateEmail(email);
    if (emailErr) {
      setFieldErrors({ email: emailErr });
      toast.error(emailErr);
      return;
    }

    setIsPending(true);
    try {
      await api.post("/api/auth/forgot-password", { email });
      setSent(true);
      toast.success("Reset link sent — check your inbox.");
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      if (apiErr.fieldErrors) {
        setFieldErrors(apiErr.fieldErrors);
        toast.error("Please fix the errors below.");
      } else {
        toast.error(apiErr.message ?? "Something went wrong");
      }
    } finally {
      setIsPending(false);
    }
  }

  if (sent) {
    return (
      <AuthCard>
        <AuthCardHeader
          title="Check your email"
          description={
            If an account exists for <strong>{email}</strong>, we&apos;ve sent a
            password reset link. It expires in 1 hour.
          }
        />
        <AuthCardContent className="flex justify-center py-4">
          <CheckCircle2 className="size-10 text-green-500" />
        </AuthCardContent>
        <AuthCardFooter>
          <p className="w-full text-center text-sm text-muted-foreground">
            Back to{" "}
            <Link
              href="/login"
              className="font-semibold text-foreground underline-offset-4 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </AuthCardFooter>
      </AuthCard>
    );
  }

  return (
    <AuthCard>
      <AuthCardHeader
        title="Forgot your password?"
        description="Enter your email and we’ll send you a reset link."
      />
      <form onSubmit={handleSubmit} noValidate>
        <AuthCardContent className="space-y-5">
          <AuthField
            id="email"
            label="Email address"
            type="email"
            placeholder="name@company.com"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isPending}
            icon={<Mail className="size-4" />}
            error={fieldErrors.email}
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
                Sending…
              </>
            ) : (
              "Send reset link"
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
