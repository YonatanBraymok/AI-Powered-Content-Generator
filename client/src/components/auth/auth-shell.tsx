"use client";

import { cn } from "@/lib/utils";
import { AuthBrand } from "@/components/auth/auth-brand";
import { AuthFooter } from "@/components/auth/auth-footer";

export function AuthShell({
  children,
  className,
  showFooter = true,
}: {
  children: React.ReactNode;
  className?: string;
  showFooter?: boolean;
}) {
  return (
    <div className={cn("auth-shell", className)}>
      <div aria-hidden="true" className="auth-blob auth-blobTopRight" />
      <div aria-hidden="true" className="auth-blob auth-blobBottomLeft" />

      <div className="auth-shellInner">
        <AuthBrand className="auth-brand" />

        <main className="auth-main">
          <div className="auth-enter">{children}</div>
        </main>

        {showFooter ? <AuthFooter /> : null}
      </div>
    </div>
  );
}

