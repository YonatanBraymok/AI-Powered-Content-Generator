"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/hooks/use-auth";
import { isAuthenticated } from "@/lib/auth";
import { LoadingSkeleton } from "@/components/loading-skeleton";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: user, isLoading, isError } = useCurrentUser();
  const hasToken = isAuthenticated();

  useEffect(() => {
    if (!hasToken || (!isLoading && (isError || !user))) {
      router.replace("/login");
    }
  }, [hasToken, isLoading, isError, user, router]);

  if (!hasToken || isLoading) {
    return <LoadingSkeleton count={3} />;
  }

  if (isError || !user) {
    return null;
  }

  return <>{children}</>;
}
