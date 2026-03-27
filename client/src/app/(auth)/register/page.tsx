"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Mail, User, Lock } from "lucide-react";
import { toast } from "sonner";
import { useRegister } from "@/hooks/use-auth";
import type { ApiError } from "@/lib/api";
import { validateEmail, validatePassword } from "@/lib/validation";
import { Button } from "@/components/ui";
import {
  AuthCard,
  AuthCardContent,
  AuthCardFooter,
  AuthCardHeader,
} from "@/components/auth/auth-card";
import { AuthField } from "@/components/auth/auth-field";

export default function RegisterPage() {
  const router = useRouter();
  const register = useRegister();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFieldErrors({});

    const errors: Record<string, string> = {};
    if (!name.trim()) errors.name = "Name is required";
    const emailErr = validateEmail(email);
    if (emailErr) errors.email = emailErr;
    const passwordErr = validatePassword(password);
    if (passwordErr) errors.password = passwordErr;

    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      toast.error("Please fix the errors below.");
      return;
    }

    register.mutate(
      { name, email, password },
      {
        onSuccess: () => {
          toast.success("Account created! Please verify your email.");
          router.replace("/verify-email");
        },
        onError: (error: Error) => {
          const apiErr = error as ApiError;
          if (apiErr.fieldErrors) {
            setFieldErrors(apiErr.fieldErrors);
            toast.error("Please fix the errors below.");
          } else {
            toast.error(error.message || "Registration failed");
          }
        },
      },
    );
  }

  return (
    <AuthCard>
      <AuthCardHeader
        title="Create an account"
        description="Get started with AI-powered content generation."
      />
      <form onSubmit={handleSubmit} noValidate>
        <AuthCardContent className="space-y-5">
          <AuthField
            id="name"
            label="Name"
            type="text"
            placeholder="Your name"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={register.isPending}
            icon={<User className="size-4" />}
            error={fieldErrors.name}
          />
          <AuthField
            id="email"
            label="Email address"
            type="email"
            placeholder="name@company.com"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={register.isPending}
            icon={<Mail className="size-4" />}
            error={fieldErrors.email}
          />
          <AuthField
            id="password"
            label="Password"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={register.isPending}
            icon={<Lock className="size-4" />}
            error={fieldErrors.password}
            helper={
              fieldErrors.password
                ? undefined
                : "Min 8 characters — include uppercase, lowercase, number, and special character (e.g. !@#$)"
            }
          />
        </AuthCardContent>

        <AuthCardContent className="pt-0">
          <Button
            type="submit"
            className="auth-primaryButton w-full"
            disabled={register.isPending}
          >
            {register.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Creating account…
              </>
            ) : (
              "Create account"
            )}
          </Button>
        </AuthCardContent>

        <AuthCardFooter>
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
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
