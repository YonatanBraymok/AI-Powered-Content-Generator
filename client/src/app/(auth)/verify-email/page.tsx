"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2, MailOpen, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui";

type Status = "verifying" | "success" | "error" | "pending";

function VerifyEmailFallback() {
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Loading…</CardTitle>
        <CardDescription>Preparing verification.</CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center py-6">
        <Loader2 className="size-10 animate-spin text-muted-foreground" />
      </CardContent>
    </Card>
  );
}

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<Status>(token ? "verifying" : "pending");
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (!token) return;

    async function verify() {
      try {
        await api.get(`/api/auth/verify-email?token=${token}`);
        await queryClient.invalidateQueries({ queryKey: ["currentUser"] });
        toast.success("Email verified! Redirecting to your dashboard…");
        setStatus("success");
        setTimeout(() => router.replace("/dashboard"), 2000);
      } catch {
        toast.error("Verification failed — this link may be invalid or expired.");
        setStatus("error");
      }
    }

    verify();
  }, [token, queryClient, router]);

  async function handleResend() {
    setIsResending(true);
    try {
      await api.post("/api/auth/resend-verification");
      toast.success("Verification email sent. Check your inbox.");
    } catch (err: unknown) {
      const msg =
        (err as { message?: string })?.message ?? "Failed to resend email";
      toast.error(msg);
    } finally {
      setIsResending(false);
    }
  }

  if (status === "verifying") {
    return (
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Verifying your email…</CardTitle>
          <CardDescription>Please wait a moment.</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <Loader2 className="size-10 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (status === "success") {
    return (
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Email verified!</CardTitle>
          <CardDescription>Redirecting you to the dashboard…</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <CheckCircle2 className="size-10 text-green-500" />
        </CardContent>
      </Card>
    );
  }

  if (status === "error") {
    return (
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Verification failed</CardTitle>
          <CardDescription>
            This link is invalid or has expired. Request a new one below.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <XCircle className="size-10 text-destructive" />
        </CardContent>
        <CardFooter>
          <Button
            className="w-full"
            onClick={handleResend}
            disabled={isResending}
          >
            {isResending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Sending…
              </>
            ) : (
              "Resend verification email"
            )}
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // status === "pending" — user has no token, redirected from AuthGuard
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Check your inbox</CardTitle>
        <CardDescription>
          We sent a verification link to your email address. Click the link to
          activate your account.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center py-6">
        <MailOpen className="size-10 text-muted-foreground" />
      </CardContent>
      <CardFooter className="flex flex-col gap-3">
        <Button
          className="w-full"
          onClick={handleResend}
          disabled={isResending}
        >
          {isResending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Sending…
            </>
          ) : (
            "Resend verification email"
          )}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          Wrong account?{" "}
          <button
            type="button"
            onClick={() => router.replace("/login")}
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Sign out
          </button>
        </p>
      </CardFooter>
    </Card>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<VerifyEmailFallback />}>
      <VerifyEmailContent />
    </Suspense>
  );
}
