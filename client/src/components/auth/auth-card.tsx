"use client";

import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui";

export function AuthCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <Card className={cn("auth-card", className)}>{children}</Card>;
}

export function AuthCardHeader({
  title,
  description,
  className,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  className?: string;
}) {
  return (
    <CardHeader className={cn("auth-cardPad text-center", className)}>
      <CardTitle className="auth-title">{title}</CardTitle>
      {description ? (
        <CardDescription className="auth-subtitle">{description}</CardDescription>
      ) : null}
    </CardHeader>
  );
}

export function AuthCardContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <CardContent className={cn("auth-cardPad pt-0", className)}>{children}</CardContent>;
}

export function AuthCardFooter({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <CardFooter className={cn("auth-cardPad flex flex-col gap-4 bg-transparent", className)}>
      {children}
    </CardFooter>
  );
}

