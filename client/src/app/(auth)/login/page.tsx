"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Mail, Lock } from "lucide-react";
import { toast } from "sonner";
import { useLogin } from "@/hooks/use-auth";
import type { ApiError } from "@/lib/api";
import { validateEmail } from "@/lib/validation";
import { Button } from "@/components/ui";
import {
  AuthCard,
  AuthCardContent,
  AuthCardFooter,
  AuthCardHeader,
} from "@/components/auth/auth-card";
import { AuthDivider } from "@/components/auth/auth-divider";
import { AuthField } from "@/components/auth/auth-field";
import { AuthSocial } from "@/components/auth/auth-social";

export default function LoginPage() {
  const router = useRouter();
  const login = useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFieldErrors({});

    const errors: Record<string, string> = {};
    const emailErr = validateEmail(email);
    if (emailErr) errors.email = emailErr;
    if (!password) errors.password = "Password is required";
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      toast.error("Please fix the errors below.");
      return;
    }

    login.mutate(
      { email, password },
      {
        onSuccess: () => {
          toast.success("Welcome back!");
          router.replace("/dashboard");
        },
        onError: (error: Error) => {
          const apiErr = error as ApiError;
          if (apiErr.fieldErrors) {
            setFieldErrors(apiErr.fieldErrors);
            toast.error("Please fix the errors below.");
          } else {
            toast.error(error.message || "Invalid email or password");
          }
        },
      },
    );
  }

  return (
    <AuthCard>
      <AuthCardHeader
        title="Welcome back"
        description="Enter your credentials to access your creator studio."
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
            disabled={login.isPending}
            icon={<Mail className="size-4" />}
            error={fieldErrors.email}
          />

          <AuthField
            id="password"
            label="Password"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={login.isPending}
            icon={<Lock className="size-4" />}
            rightAccessory={
              <Link href="/forgot-password" className="hover:underline underline-offset-4">
                Forgot password?
              </Link>
            }
            error={fieldErrors.password}
          />
        </AuthCardContent>

        <AuthCardContent className="pt-0">
          <Button
            type="submit"
            className="auth-primaryButton w-full"
            disabled={login.isPending}
          >
            {login.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Signing in…
              </>
            ) : (
              "Sign in"
            )}
          </Button>

          <AuthDivider />
          <AuthSocial />
        </AuthCardContent>

        <AuthCardFooter>
          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-semibold text-foreground underline-offset-4 hover:underline"
            >
              Create one
            </Link>
          </p>
        </AuthCardFooter>
      </form>
    </AuthCard>
  );
}
