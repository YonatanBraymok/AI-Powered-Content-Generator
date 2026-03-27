"use client";

import { useEffect } from "react";
import { FileText } from "lucide-react";
import { toast } from "sonner";
import { usePosts } from "@/hooks/use-posts";
import { PostCard } from "@/components/post-card";
import { EmptyState } from "@/components/empty-state";
import { LoadingSkeleton } from "@/components/loading-skeleton";

interface PostListProps {
  filter?: "drafts" | "published";
}

export function PostList({ filter }: PostListProps) {
  const { data: posts, isLoading, isError, refetch } = usePosts();

  useEffect(() => {
    if (isError) {
      toast.error("Failed to load posts");
    }
  }, [isError]);

  if (isLoading) {
    return <LoadingSkeleton count={6} />;
  }

  if (isError) {
    return (
      <EmptyState
        icon={FileText}
        title="Failed to load posts"
        description="Something went wrong while fetching your posts. Please try again."
        actionLabel="Retry"
        onAction={() => refetch()}
      />
    );
  }

  const filtered =
    filter === "published"
      ? (posts ?? []).filter((p) => p.isPublished)
      : (posts ?? []).filter((p) => !p.isPublished);

  if (filtered.length === 0) {
    const isEmpty = !posts || posts.length === 0;
    return (
      <EmptyState
        icon={FileText}
        title={
          isEmpty
            ? "No posts yet"
            : filter === "published"
              ? "No published posts yet"
              : "No drafts yet"
        }
        description={
          isEmpty
            ? "Generate your first AI-powered post using the form above."
            : filter === "published"
              ? "Publish a draft to see it here."
              : "All your posts have been published."
        }
      />
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {filtered.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
