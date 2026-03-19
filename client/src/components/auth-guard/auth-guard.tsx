"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { useCurrentUser } from "@/hooks/use-auth";
import { isAuthenticated } from "@/lib/auth";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: user, isLoading, isError, error } = useCurrentUser();
  const hasToken = isAuthenticated();

  useEffect(() => {
    if (!hasToken) {
      toast.error("Please sign in to continue");
      router.replace("/login");
    } else if (!isLoading && (isError || !user)) {
      const status = error instanceof AxiosError ? error.response?.status : undefined;
      if (status !== 401) {
        toast.error("Please sign in to continue");
      }
      router.replace("/login");
    }
  }, [hasToken, isLoading, isError, error, user, router]);

  if (!hasToken || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !user) {
    return null;
  }

  return <>{children}</>;
}
