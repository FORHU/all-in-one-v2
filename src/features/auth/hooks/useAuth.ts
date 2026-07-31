"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useSafeMutation } from "@/shared/query/useSafeMutation";
import { login } from "../api/auth.client";
import { useAuthStore } from "../stores/auth.store";
import type { LoginInput } from "../contracts/auth.contract";
import type { Role } from "@/shared/auth/roles";

function mapApiRole(apiRole: "USER" | "ADMIN" | "SUPER_ADMIN"): Role {
  return apiRole === "ADMIN" || apiRole === "SUPER_ADMIN" ? "admin" : "viewer";
}

export function useAuth() {
  const setToken = useAuthStore((state) => state.setToken);
  const setUser = useAuthStore((state) => state.setUser);
  const setRole = useAuthStore((state) => state.setRole);
  const queryClient = useQueryClient();

  const loginMutation = useSafeMutation({
    mutationFn: (input: LoginInput) => login(input),
    onSuccess: (data) => {
      setToken(data.accessToken);
      setUser({ id: data.user.id });
      setRole(mapApiRole(data.user.role));
      queryClient.invalidateQueries();
    },
  });

  const clearSession = () => {
    setToken(null);
    setUser(null);
    setRole("viewer");
    queryClient.clear();
  };

  return {
    login: loginMutation.mutateAsync,
    logout: async () => {
      clearSession();
    },
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: false,
  };
}
