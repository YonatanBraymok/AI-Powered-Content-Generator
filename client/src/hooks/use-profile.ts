import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type { User } from "@/lib/types";

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { name?: string; email?: string }) => {
      const { data } = await api.patch<{ user: User }>("/api/profile", payload);
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["currentUser"], data.user);
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: async (payload: {
      currentPassword: string;
      newPassword: string;
    }) => {
      const { data } = await api.patch<{ ok: boolean }>(
        "/api/profile/password",
        payload,
      );
      return data;
    },
  });
}

export function useDeleteAccount() {
  return useMutation({
    mutationFn: async () => {
      await api.delete("/api/profile");
    },
    onSuccess: () => {
      window.location.href = "/login";
    },
  });
}
