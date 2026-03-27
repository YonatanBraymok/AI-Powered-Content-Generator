"use client";

export function AuthDivider({ text = "or continue with" }: { text?: string }) {
  return (
    <div className="auth-dividerWrap">
      <div className="auth-dividerLine" aria-hidden="true">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/25 to-transparent" />
      </div>
      <div className="relative flex justify-center">
        <span className="auth-dividerText">{text}</span>
      </div>
    </div>
  );
}

