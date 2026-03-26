"use client";

import { Chrome, Apple } from "lucide-react";

export function AuthSocial() {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-4">
        <button type="button" className="auth-socialButton" disabled aria-disabled="true">
          <span className="inline-flex items-center gap-2">
            <Chrome className="size-4 text-muted-foreground" />
            Google
          </span>
        </button>
        <button type="button" className="auth-socialButton" disabled aria-disabled="true">
          <span className="inline-flex items-center gap-2">
            <Apple className="size-4 text-muted-foreground" />
            Apple
          </span>
        </button>
      </div>
      <p className="text-center text-xs text-muted-foreground">
        Social sign-in is <span className="font-semibold">coming soon</span>.
      </p>
    </div>
  );
}

