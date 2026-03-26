"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2, MailOpen, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Button } from "@/components/ui";
import {
  AuthCard,
  AuthCardContent,
  AuthCardFooter,
  AuthCardHeader,
} from "@/components/auth/auth-card";

type Status = "verifying" | "success" | "error" | "pending";

function VerifyEmailFallback() {
  return (
    <AuthCard>
      <AuthCardHeader title="Loading…" description="Preparing verification." />
      <AuthCardContent className="flex justify-center py-6">
        <Loader2 className="size-10 animate-spin text-muted-foreground" />
      </AuthCardContent>
    </AuthCard>
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
      <AuthCard>
        <AuthCardHeader title="Verifying your email…" description="Please wait a moment." />
        <AuthCardContent className="flex justify-center py-6">
          <Loader2 className="size-10 animate-spin text-muted-foreground" />
        </AuthCardContent>
      </AuthCard>
    );
  }

  if (status === "success") {
    return (
      <AuthCard>
        <AuthCardHeader title="Email verified!" description="Redirecting you to the dashboard…" />
        <AuthCardContent className="flex justify-center py-6">
          <CheckCircle2 className="size-10 text-green-500" />
        </AuthCardContent>
      </AuthCard>
    );
  }

  if (status === "error") {
    return (
      <AuthCard>
        <AuthCardHeader
          title="Verification failed"
          description="This link is invalid or has expired. Request a new one below."
        />
        <AuthCardContent className="flex justify-center py-6">
          <XCircle className="size-10 text-destructive" />
        </AuthCardContent>
        <AuthCardContent className="pt-0">
          <Button
            className="auth-primaryButton w-full"
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
        </AuthCardContent>
      </AuthCard>
    );
  }

  // status === "pending" — user has no token, redirected from AuthGuard
  return (
    <AuthCard>
      <AuthCardHeader
        title="Check your inbox"
        description="We sent a verification link to your email address. Click the link to activate your account."
      />
      <AuthCardContent className="flex justify-center py-6">
        <MailOpen className="size-10 text-muted-foreground" />
      </AuthCardContent>
      <AuthCardContent className="pt-0">
        <Button
          className="auth-primaryButton w-full"
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
      </AuthCardContent>
      <AuthCardFooter className="gap-3">
        <p className="text-center text-sm text-muted-foreground">
          Wrong account?{" "}
          <button
            type="button"
            onClick={() => router.replace("/login")}
            className="font-semibold text-foreground underline-offset-4 hover:underline"
          >
            Sign out
          </button>
        </p>
      </AuthCardFooter>
    </AuthCard>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<VerifyEmailFallback />}>
      <VerifyEmailContent />
    </Suspense>
  );
}
