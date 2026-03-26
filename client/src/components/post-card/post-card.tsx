"use client";

import { useRouter } from "next/navigation";
import { Calendar, Globe, Lock } from "lucide-react";
import type { Post } from "@/lib/types";
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui";

interface PostCardProps {
  post: Post;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function PostCard({ post }: PostCardProps) {
  const router = useRouter();

  function navigate() {
    router.push(`/dashboard/posts/${post.id}`);
  }

  return (
    <Card
      role="link"
      tabIndex={0}
      className="group cursor-pointer overflow-hidden rounded-3xl border-foreground/10 bg-card/80 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-foreground/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transform-none"
      onClick={navigate}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          navigate();
        }
      }}
    >
      <CardHeader className="pb-3">
        <div className="mb-3 flex items-center justify-between">
          <Badge variant="secondary" className="text-[10px] font-bold tracking-widest uppercase">
            {post.style}
          </Badge>
          <span className="text-[11px] font-medium text-muted-foreground">
            {formatDate(post.createdAt)}
          </span>
        </div>
        <CardTitle className="line-clamp-2 font-heading text-xl font-bold leading-snug tracking-tight transition-colors group-hover:text-primary">
          {post.title}
        </CardTitle>
        <CardDescription className="line-clamp-1 text-sm">
          {post.topic}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="line-clamp-3 text-[14px] leading-relaxed text-muted-foreground">
          {post.content}
        </p>
        <div className="flex items-center justify-between border-t border-foreground/10 pt-5">
          <Badge
            variant={post.isPublished ? "default" : "outline"}
            className="gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold tracking-widest uppercase"
          >
            {post.isPublished ? (
              <>
                <Globe className="size-3" />
                Published
              </>
            ) : (
              <>
                <Lock className="size-3" />
                Draft
              </>
            )}
          </Badge>
          <span className="inline-flex size-10 items-center justify-center rounded-full text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
            <Calendar className="size-4" />
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
