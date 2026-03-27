"use client";

import { cn } from "@/lib/utils";

function FooterLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a href={href} className="auth-footerLink">
      {children}
    </a>
  );
}

export function AuthFooter({ className }: { className?: string }) {
  return (
    <footer className={cn("auth-footer", className)}>
      <div className="auth-footerInner">
        <div className="auth-footerCopy">© {new Date().getFullYear()}.</div>
        <div className="flex items-center gap-6">
          <FooterLink href="#">Privacy</FooterLink>
          <FooterLink href="#">Terms</FooterLink>
          <FooterLink href="#">Support</FooterLink>
        </div>
      </div>
    </footer>
  );
}

