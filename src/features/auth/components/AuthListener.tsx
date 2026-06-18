"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../stores/auth.store";
import { useQueryClient } from "@tanstack/react-query";

export function AuthListener() {
  const router = useRouter();
  const setToken = useAuthStore((state) => state.setToken);
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleUnauthorized = () => {
      // Clear token and query cache on 401
      setToken(null);
      queryClient.clear();
      router.push("/login");
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized);

    return () => {
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
    };
  }, [router, setToken, queryClient]);

  return null;
}
