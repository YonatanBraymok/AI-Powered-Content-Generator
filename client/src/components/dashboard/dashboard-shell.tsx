"use client";

import { cn } from "@/lib/utils";

export function DashboardShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("dash-shell", className)}>
      <div aria-hidden="true" className="dash-blob dash-blobTopRight" />
      <div aria-hidden="true" className="dash-blob dash-blobBottomLeft" />
      {children}
    </div>
  );
}

