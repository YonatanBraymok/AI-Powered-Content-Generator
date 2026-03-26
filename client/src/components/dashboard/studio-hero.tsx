"use client";

import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function StudioHero({
  title = "Creator Studio",
  description = "Harness the power of AI to craft your next masterpiece.",
  children,
  className,
}: {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("dash-hero", className)}>
      <div aria-hidden="true" className="dash-heroAccent" />
      <div aria-hidden="true" className="dash-heroBlob" />

      <div className="dash-heroInner">
        <div className="dash-heroHeader">
          <span className="dash-heroIcon">
            <Sparkles className="size-5 text-primary-foreground" />
          </span>
          <div>
            <h2 className="dash-heroTitle">{title}</h2>
            <p className="dash-heroDesc">{description}</p>
          </div>
        </div>

        {children}
      </div>
    </section>
  );
}

