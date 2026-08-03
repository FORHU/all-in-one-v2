"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../stores/auth.store";
import { useQueryClient } from "@tanstack/react-query";
import { clearRefreshToken } from "@/shared/lib/token";

export function AuthListener() {
  const router = useRouter();
  const setToken = useAuthStore((state) => state.setToken);
  const setUser = useAuthStore((state) => state.setUser);
  const setRole = useAuthStore((state) => state.setRole);
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleUnauthorized = () => {
      // Clear token, role, and query cache on 401 — mirrors handleLogout in
      // app/(admin)/layout.tsx so a session that expires on its own doesn't
      // leave a stale elevated role sitting in the store after logout.
      setToken(null);
      clearRefreshToken();
      setUser(null);
      setRole("viewer");
      queryClient.clear();
      router.push("/");
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized);

    return () => {
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
    };
  }, [router, setToken, setUser, setRole, queryClient]);

  return null;
}
