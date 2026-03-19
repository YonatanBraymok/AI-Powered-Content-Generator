"use client";

import { FileText } from "lucide-react";
import { usePosts } from "@/hooks/use-posts";
import { PostCard } from "@/components/post-card";
import { EmptyState } from "@/components/empty-state";
import { LoadingSkeleton } from "@/components/loading-skeleton";

export function PostList() {
  const { data: posts, isLoading, isError, refetch } = usePosts();

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

  if (!posts || posts.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="No posts yet"
        description="Generate your first AI-powered post using the form above."
      />
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
