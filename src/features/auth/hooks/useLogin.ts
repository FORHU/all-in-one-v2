"use client";

import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useSafeMutation } from "@/shared/query/useSafeMutation";
import { notify } from "@/shared/lib/notify";
import { login } from "../api/auth.client";
import { useAuthStore } from "../stores/auth.store";
import type { LoginInput } from "../contracts/auth.contract";
import type { Role } from "@/shared/auth/roles";

function mapApiRole(apiRole: "USER" | "ADMIN"): Role {
  return apiRole === "ADMIN" ? "admin" : "viewer";
}

export function useLogin() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const setToken = useAuthStore((s) => s.setToken);
  const setUser = useAuthStore((s) => s.setUser);
  const setRole = useAuthStore((s) => s.setRole);

  return useSafeMutation({
    meta: { skipAuthLogout: true },
    mutationFn: async (input: LoginInput) => {
      // Clear any previous session before signing in as a different user
      setToken(null);
      setUser(null);
      setRole("viewer");
      return login(input);
    },
    onSuccess: (data) => {
      setToken(data.accessToken);
      setUser({ id: data.user.id });
      setRole(mapApiRole(data.user.role));
      queryClient.invalidateQueries();
      notify.success("Signed in successfully.");
      router.push("/dashboard");
    },
  });
}
