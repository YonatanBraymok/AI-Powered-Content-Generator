"use client";

export function AuthDivider({ text = "or continue with" }: { text?: string }) {
  return (
    <div className="auth-dividerWrap">
      <div className="auth-dividerLine" aria-hidden="true">
        <div className="w-full border-t border-foreground/10" />
      </div>
      <div className="relative flex justify-center">
        <span className="auth-dividerText">{text}</span>
      </div>
    </div>
  );
}

