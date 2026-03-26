"use client";

import { cn } from "@/lib/utils";

export function SectionHeader({
  title,
  description,
  right,
  className,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  right?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("dash-sectionHeader", className)}>
      <div className="space-y-1">
        <h1 className="dash-sectionTitle">{title}</h1>
        {description ? <p className="dash-sectionDesc">{description}</p> : null}
      </div>
      {right ? <div className="dash-sectionRight">{right}</div> : null}
    </div>
  );
}

