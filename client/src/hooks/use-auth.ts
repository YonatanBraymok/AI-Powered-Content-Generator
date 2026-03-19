import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { setToken, removeToken, isAuthenticated } from "@/lib/auth";
import type { User, AuthResponse } from "@/lib/types";

export function useCurrentUser() {
  return useQuery<User>({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const { data } = await api.get<{ user: User }>("/api/auth/me");
      return data.user;
    },
    enabled: isAuthenticated(),
  });
}

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const { data } = await api.post<AuthResponse>(
        "/api/auth/login",
        credentials,
      );
      return data;
    },
    onSuccess: (data) => {
      setToken(data.token);
      queryClient.setQueryData(["currentUser"], data.user);
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      email: string;
      password: string;
      name: string;
    }) => {
      const { data } = await api.post<AuthResponse>(
        "/api/auth/register",
        payload,
      );
      return data;
    },
    onSuccess: (data) => {
      setToken(data.token);
      queryClient.setQueryData(["currentUser"], data.user);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return () => {
    removeToken();
    queryClient.clear();
    window.location.href = "/login";
  };
}
