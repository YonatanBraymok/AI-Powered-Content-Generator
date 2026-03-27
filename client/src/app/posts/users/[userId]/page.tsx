"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  AlertCircle,
  Calendar,
  FileText,
  Sparkles,
  User,
} from "lucide-react";
import { usePublishedPostsByUser } from "@/hooks/use-posts";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Separator,
  Skeleton,
} from "@/components/ui";
import { APP_NAME } from "@/lib/constants";

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function PublisherPostsPage() {
  const { userId } = useParams<{ userId: string }>();
  const { data, isLoading, isError, refetch } = usePublishedPostsByUser(userId);

  if (isLoading) {
    return (
      <PublisherPostsShell>
        <div className="space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-8 w-60" />
            <Skeleton className="h-4 w-40" />
          </div>
          <Separator />
          <div className="grid gap-4 sm:grid-cols-2">
            <Skeleton className="h-44 w-full" />
            <Skeleton className="h-44 w-full" />
            <Skeleton className="h-44 w-full" />
            <Skeleton className="h-44 w-full" />
          </div>
        </div>
      </PublisherPostsShell>
    );
  }

  if (isError || !data) {
    return (
      <PublisherPostsShell>
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <div className="rounded-full bg-destructive/10 p-4">
            <AlertCircle className="size-8 text-destructive" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">Publisher page unavailable</h2>
            <p className="max-w-sm text-sm text-muted-foreground">
              We could not load this publisher&apos;s public posts. It may not
              exist or no longer have published content.
            </p>
          </div>
          <Button variant="outline" className="mt-2" onClick={() => refetch()}>
            Try again
          </Button>
        </div>
      </PublisherPostsShell>
    );
  }

  if (data.posts.length === 0) {
    return (
      <PublisherPostsShell>
        <div className="postview-article space-y-6 p-8 sm:p-10">
          <div aria-hidden="true" className="postview-grain" />
          <header className="space-y-3">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {data.user.name}&apos;s Published Posts
            </h1>
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="size-4" />
              {data.user.name}
            </p>
          </header>
          <Separator />
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <div className="rounded-full bg-muted p-3">
              <FileText className="size-6 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-semibold">No published posts yet</h2>
            <p className="max-w-md text-sm text-muted-foreground">
              This publisher has not shared any public posts.
            </p>
          </div>
        </div>
      </PublisherPostsShell>
    );
  }

  return (
    <PublisherPostsShell>
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="space-y-3">
          <p className="postview-titleLabel">Publisher</p>
          <h1 className="text-3xl font-heading font-extrabold tracking-tight sm:text-4xl">
            {data.user.name}&apos;s Published Posts
          </h1>
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="size-4" />
            {data.posts.length} public{" "}
            {data.posts.length === 1 ? "post" : "posts"}
          </p>
        </header>

        <Separator />

        <div className="grid gap-5 sm:grid-cols-2">
          {data.posts.map((post) => (
            <Link key={post.id} href={`/posts/${post.shareId}`} className="group">
              <Card className="h-full rounded-[1.75rem] border-white/18 bg-card/78 backdrop-blur-xl transition-all duration-300 group-hover:-translate-y-0.5 group-hover:shadow-[0_3px_8px_rgba(0,_0,_0,_0.14),0_20px_38px_rgba(0,_0,_0,_0.2)]">
                <CardHeader>
                  <CardTitle className="line-clamp-2 font-heading text-xl tracking-tight">
                    {post.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-1">
                    {post.topic}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="line-clamp-3 text-sm text-muted-foreground">
                    {post.content}
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary" className="font-bold tracking-wide">
                      {post.style}
                    </Badge>
                    <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="size-3" />
                      {formatDate(post.createdAt)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </PublisherPostsShell>
  );
}

function PublisherPostsShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="postview-shell flex min-h-screen flex-col">
      <header className="postview-header">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
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

      <main className="postview-main">
        {children}
      </main>

      <footer className="postview-footer">
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
