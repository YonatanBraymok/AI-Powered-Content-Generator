"use client";

import { GenerateForm } from "@/components/generate-form";
import { PostList } from "@/components/post-list";
import { Separator } from "@/components/ui";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Generate and manage your AI-powered content.
        </p>
      </div>

      <GenerateForm />

      <div className="space-y-4">
        <Separator />
        <h2 className="text-lg font-semibold">Your Posts</h2>
        <PostList />
      </div>
    </div>
  );
}
