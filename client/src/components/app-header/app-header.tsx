"use client";

import Link from "next/link";
import { Sparkles, LogOut, Settings } from "lucide-react";
import { useCurrentUser, useLogout } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, Button, Separator } from "@/components/ui";
import { APP_NAME } from "@/lib/constants";

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
            {APP_NAME}
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
            <Button variant="ghost" size="sm" render={<Link href="/settings" />}>
              <Settings className="size-4" />
              <span className="hidden sm:inline-block">Settings</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={logout.isPending}
              onClick={() => logout.mutate()}
            >
              <LogOut className="size-4" />
              <span className="hidden sm:inline-block">Log out</span>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
