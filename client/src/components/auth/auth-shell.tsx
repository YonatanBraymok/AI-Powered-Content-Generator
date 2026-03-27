"use client";

import { cn } from "@/lib/utils";
import { AuthBrand } from "@/components/auth/auth-brand";
import { AuthFooter } from "@/components/auth/auth-footer";
import { APP_NAME } from "@/lib/constants";

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
      <div aria-hidden="true" className="auth-grainOverlay" />

      <div className="auth-shellInner">
        <section className="auth-visualPane">
          <div aria-hidden="true" className="auth-visualMesh auth-visualMeshPrimary" />
          <div aria-hidden="true" className="auth-visualMesh auth-visualMeshSecondary" />
          <div className="auth-visualCopy">
            <h1 className="auth-visualTitle">PromptPost</h1>
            <p className="auth-visualSubtitle">
              Write and publish better content, faster.
            </p>
            <div className="auth-visualProtocol">
              <span className="auth-visualProtocolLine" />
              <span>For creators and teams</span>
            </div>
          </div>
          <div className="auth-visualWatermark">{APP_NAME}</div>
        </section>

        <section className="auth-actionPane">
          <AuthBrand className="auth-brand lg:hidden" />
          <main className="auth-main">
            <div className="auth-enter">{children}</div>
          </main>
        </section>

        {showFooter ? <AuthFooter className="lg:col-span-2" /> : null}
      </div>
    </div>
  );
}

