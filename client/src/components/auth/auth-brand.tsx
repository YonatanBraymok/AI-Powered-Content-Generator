"use client";

import { Sparkles } from "lucide-react";
import { APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function AuthBrand({ className }: { className?: string }) {
  return (
    <div className={cn("text-center", className)}>
      <div className="flex items-center justify-center gap-2.5">
        <span className="auth-brandMark">
          <Sparkles className="size-5" />
        </span>
        <span className="auth-brandName">{APP_NAME}</span>
      </div>
    </div>
  );
}

