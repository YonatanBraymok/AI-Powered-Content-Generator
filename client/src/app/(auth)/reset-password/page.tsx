"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import type { ApiError } from "@/lib/api";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Input,
  Label,
} from "@/components/ui";

function ResetPasswordFallback() {
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Loading…</CardTitle>
        <CardDescription>Preparing password reset.</CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center py-6">
        <Loader2 className="size-10 animate-spin text-muted-foreground" />
      </CardContent>
    </Card>
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
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Invalid link</CardTitle>
          <CardDescription>
            This password reset link is missing a token. Request a new one.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <XCircle className="size-10 text-destructive" />
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={() => router.push("/forgot-password")}>
            Request new link
          </Button>
        </CardFooter>
      </Card>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFieldErrors({});

    if (password !== confirm) {
      setFieldErrors({ confirm: "Passwords do not match" });
      return;
    }

    if (password.length < 6) {
      setFieldErrors({ password: "Password must be at least 6 characters" });
      return;
    }

    setIsPending(true);
    try {
      await api.post("/api/auth/reset-password", { token, password });
      setDone(true);
      setTimeout(() => router.replace("/login"), 2500);
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      if (apiErr.fieldErrors) {
        setFieldErrors(apiErr.fieldErrors);
      } else {
        toast.error(apiErr.message ?? "Failed to reset password");
      }
    } finally {
      setIsPending(false);
    }
  }

  if (done) {
    return (
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Password updated!</CardTitle>
          <CardDescription>
            Your password has been reset. Redirecting you to sign in…
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <CheckCircle2 className="size-10 text-green-500" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Reset your password</CardTitle>
        <CardDescription>Enter and confirm your new password.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">New password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              required
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isPending}
            />
            {fieldErrors.password && (
              <p className="text-sm text-destructive">{fieldErrors.password}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm">Confirm new password</Label>
            <Input
              id="confirm"
              type="password"
              placeholder="••••••••"
              required
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              disabled={isPending}
            />
            {fieldErrors.confirm && (
              <p className="text-sm text-destructive">{fieldErrors.confirm}</p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Updating…
              </>
            ) : (
              "Update password"
            )}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Remember your password?{" "}
            <Link
              href="/login"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordFallback />}>
      <ResetPasswordContent />
    </Suspense>
  );
}
