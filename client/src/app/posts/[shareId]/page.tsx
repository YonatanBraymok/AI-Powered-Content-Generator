"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { AlertCircle, Calendar, Sparkles, User } from "lucide-react";
import { useSharedPost } from "@/hooks/use-posts";
import { Badge, Button, Separator, Skeleton } from "@/components/ui";
import { APP_NAME } from "@/lib/constants";

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function SharedPostPage() {
  const { shareId } = useParams<{ shareId: string }>();
  const { data: post, isLoading, isError } = useSharedPost(shareId);

  if (isLoading) {
    return (
      <SharedPostShell>
        <div className="space-y-6">
          <Skeleton className="h-10 w-3/4" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-36" />
          </div>
          <Skeleton className="h-px w-full" />
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/6" />
          </div>
        </div>
      </SharedPostShell>
    );
  }

  if (isError || !post) {
    return (
      <SharedPostShell>
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <div className="rounded-full bg-destructive/10 p-4">
            <AlertCircle className="size-8 text-destructive" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">Post not found</h2>
            <p className="max-w-sm text-sm text-muted-foreground">
              This post may have been removed or is no longer publicly
              available.
            </p>
          </div>
          <Button
            variant="outline"
            className="mt-2"
            render={<Link href="/register" />}
          >
            Create your own content
          </Button>
        </div>
      </SharedPostShell>
    );
  }

  return (
    <SharedPostShell>
      <article className="space-y-6">
        <header className="space-y-4">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
            {post.title}
          </h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
            {post.user?.name && (
              <span className="flex items-center gap-1.5">
                <User className="size-3.5" />
                {post.user.name}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Calendar className="size-3.5" />
              {formatDate(post.createdAt)}
            </span>
            <Badge variant="secondary">{post.style}</Badge>
          </div>
        </header>

        <Separator />

        <div className="prose-custom whitespace-pre-wrap text-base leading-relaxed">
          {post.content}
        </div>
      </article>
    </SharedPostShell>
  );
}

function SharedPostShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4 sm:px-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
          >
            <Sparkles className="size-4" />
            <span className="text-sm font-medium">{APP_NAME}</span>
          </Link>
          <Button variant="outline" size="sm" render={<Link href="/register" />}>
            Get Started
          </Button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
        {children}
      </main>

      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        Powered by{" "}
        <Link
          href="/register"
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          {APP_NAME}
        </Link>
      </footer>
    </div>
  );
}
