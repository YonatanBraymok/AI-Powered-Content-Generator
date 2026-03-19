"use client";

import { Sparkles, LogOut } from "lucide-react";
import { useCurrentUser, useLogout } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, Button, Separator } from "@/components/ui";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function AppHeader() {
  const { data: user } = useCurrentUser();
  const logout = useLogout();

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <Sparkles className="size-5 text-primary" />
          <span className="text-lg font-semibold tracking-tight">
            AI Content Generator
          </span>
        </div>

        {user && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Avatar size="sm">
                <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
              </Avatar>
              <span className="hidden text-sm font-medium sm:inline-block">
                {user.name}
              </span>
            </div>
            <Separator orientation="vertical" className="!h-6" />
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="size-4" />
              <span className="hidden sm:inline-block">Log out</span>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
