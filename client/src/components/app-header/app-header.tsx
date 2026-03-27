"use client";

import Link from "next/link";
import { LogOut, Settings, Search, Bell } from "lucide-react";
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
    <header className="dash-glassHeader">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-10">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <span className="dash-brandMark">
              <span className="text-sm font-extrabold">O</span>
            </span>
            <span className="font-heading text-lg font-extrabold tracking-tight text-foreground">
              {APP_NAME}
            </span>
          </Link>

          <nav className="hidden items-center gap-7 md:flex">
            <Link href="/dashboard" className="dash-navLink dash-navLinkActive">
              Dashboard
            </Link>
            <span className="dash-navLink opacity-60">Library</span>
            <span className="dash-navLink opacity-60">Templates</span>
            <span className="dash-navLink opacity-60">Analytics</span>
          </nav>
        </div>

        {user && (
          <div className="flex items-center gap-3">
            <button type="button" className="dash-iconButton" aria-label="Search (coming soon)">
              <Search className="size-5" />
            </button>
            <button
              type="button"
              className="dash-iconButton relative"
              aria-label="Notifications (coming soon)"
            >
              <Bell className="size-5" />
              <span className="absolute right-3 top-3 size-2 rounded-full bg-destructive ring-2 ring-background" />
            </button>
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
