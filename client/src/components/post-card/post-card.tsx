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
      className="cursor-pointer transition-shadow hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      onClick={navigate}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          navigate();
        }
      }}
    >
      <CardHeader>
        <CardTitle className="line-clamp-1">{post.title}</CardTitle>
        <CardDescription className="line-clamp-1">
          {post.topic}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="line-clamp-3 text-sm text-muted-foreground">
          {post.content}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{post.style}</Badge>
          <Badge variant={post.isPublished ? "default" : "outline"}>
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
          <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="size-3" />
            {formatDate(post.createdAt)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
