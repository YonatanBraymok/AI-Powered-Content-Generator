"use client";

import { useParams } from "next/navigation";
import { PostEditor } from "@/components/post-editor";

export default function PostEditorPage() {
  const { id } = useParams<{ id: string }>();

  return <PostEditor postId={id} />;
}
