import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type { Post } from "@/lib/types";

export function usePosts() {
  return useQuery<Post[]>({
    queryKey: ["posts"],
    queryFn: async () => {
      const { data } = await api.get<{ posts: Post[] }>("/api/posts");
      return data.posts;
    },
  });
}

export function usePost(id: string) {
  return useQuery<Post>({
    queryKey: ["posts", id],
    queryFn: async () => {
      const { data } = await api.get<{ post: Post }>(`/api/posts/${id}`);
      return data.post;
    },
    enabled: !!id,
  });
}

export function useSharedPost(shareId: string) {
  return useQuery<Post>({
    queryKey: ["sharedPost", shareId],
    queryFn: async () => {
      const { data } = await api.get<{ post: Post }>(
        `/api/posts/shared/${shareId}`,
      );
      return data.post;
    },
    enabled: !!shareId,
  });
}

export function useUpdatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: {
      id: string;
      title?: string;
      content?: string;
      isPublished?: boolean;
    }) => {
      const { data } = await api.patch<{ post: Post }>(
        `/api/posts/${id}`,
        updates,
      );
      return data.post;
    },
    onSuccess: (post) => {
      queryClient.setQueryData(["posts", post.id], post);
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/api/posts/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}
