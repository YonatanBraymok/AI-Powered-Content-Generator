"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Copy, Loader2, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { usePost, useUpdatePost, useDeletePost } from "@/hooks/use-posts";
import {
  Badge,
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Label,
  Separator,
  Skeleton,
  Switch,
  Textarea,
} from "@/components/ui";

interface PostEditorProps {
  postId: string;
}

export function PostEditor({ postId }: PostEditorProps) {
  const router = useRouter();
  const { data: post, isLoading, isError } = usePost(postId);
  const updatePost = useUpdatePost();
  const deletePost = useDeletePost();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (post) {
      setTitle(post.title);
      setContent(post.content);
      setIsPublished(post.isPublished);
      setHasChanges(false);
    }
  }, [post]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [content]);

  function handlePublishToggle(checked: boolean) {
    setIsPublished(checked);
    updatePost.mutate(
      { id: postId, isPublished: checked },
      {
        onSuccess: () => {
          toast.success(checked ? "Post published!" : "Post unpublished");
        },
        onError: (error: Error) => {
          setIsPublished(!checked);
          toast.error(error.message || "Failed to update publish status");
        },
      },
    );
  }

  function handleSave() {
    updatePost.mutate(
      { id: postId, title: title.trim(), content },
      {
        onSuccess: () => {
          setHasChanges(false);
          toast.success("Post saved!");
        },
        onError: (error: Error) => {
          toast.error(error.message || "Failed to save post");
        },
      },
    );
  }

  function handleDelete() {
    deletePost.mutate(postId, {
      onSuccess: () => {
        toast.success("Post deleted");
        router.push("/dashboard");
      },
      onError: (error: Error) => {
        toast.error(error.message || "Failed to delete post");
      },
    });
  }

  function handleCopyShareLink() {
    if (!post) return;
    const url = `${window.location.origin}/posts/${post.shareId}`;
    navigator.clipboard.writeText(url).then(() => {
      toast.success("Share link copied to clipboard!");
    });
  }

  if (isLoading) {
    return <PostEditorSkeleton />;
  }

  if (isError || !post) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <h2 className="text-lg font-semibold">Post not found</h2>
        <p className="text-sm text-muted-foreground">
          The post you&apos;re looking for doesn&apos;t exist or has been
          deleted.
        </p>
        <Button variant="outline" onClick={() => router.push("/dashboard")}>
          <ArrowLeft className="size-4" />
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/dashboard")}
        >
          <ArrowLeft className="size-4" />
          Back
        </Button>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{post.style}</Badge>
          <Badge variant="outline">{post.topic}</Badge>
        </div>
      </div>

      <Separator />

      <div className="space-y-2">
        <Label htmlFor="post-title">Title</Label>
        <Input
          id="post-title"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setHasChanges(true);
          }}
          placeholder="Post title"
          className="text-lg font-semibold"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="post-content">Content</Label>
        <Textarea
          ref={textareaRef}
          id="post-content"
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            setHasChanges(true);
          }}
          placeholder="Write your content here..."
          className="min-h-[300px] resize-none leading-relaxed"
        />
      </div>

      <Separator />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Switch
            id="publish-toggle"
            checked={isPublished}
            onCheckedChange={handlePublishToggle}
          />
          <Label htmlFor="publish-toggle" className="cursor-pointer">
            {isPublished ? "Published" : "Draft"}
          </Label>
        </div>

        {isPublished && (
          <Button variant="outline" size="sm" onClick={handleCopyShareLink}>
            <Copy className="size-4" />
            Copy Share Link
          </Button>
        )}
      </div>

      <Separator />

      <div className="flex items-center justify-between">
        <Dialog>
          <DialogTrigger render={<Button variant="destructive" size="sm" />}>
            <Trash2 className="size-4" />
            Delete
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Post</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this post? This action cannot be
                undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose render={<Button variant="outline" />}>
                Cancel
              </DialogClose>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deletePost.isPending}
              >
                {deletePost.isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Deleting…
                  </>
                ) : (
                  "Delete"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Button
          onClick={handleSave}
          disabled={!hasChanges || updatePost.isPending || !title.trim()}
        >
          {updatePost.isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Saving…
            </>
          ) : (
            <>
              <Save className="size-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

function PostEditorSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-9 w-20" />
        <div className="flex gap-2">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
      </div>
      <Skeleton className="h-px w-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-10" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-14" />
        <Skeleton className="h-[300px] w-full" />
      </div>
      <Skeleton className="h-px w-full" />
      <div className="flex items-center justify-between">
        <Skeleton className="h-9 w-20" />
        <Skeleton className="h-9 w-32" />
      </div>
    </div>
  );
}
