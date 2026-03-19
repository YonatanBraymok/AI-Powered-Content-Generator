import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type { Post, GenerateInput } from "@/lib/types";

export function useGenerateContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: GenerateInput) => {
      const { data } = await api.post<{ post: Post }>("/api/generate", input);
      return data.post;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}
