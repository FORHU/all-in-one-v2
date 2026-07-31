"use client";

import { useSafeQuery } from "@/shared/query/useSafeQuery";
import { getMe } from "../api/auth.client";
import { authKeys } from "../api/auth.keys";
import { useAuthStore } from "../stores/auth.store";

/**
 * Fetches the logged-in user's profile. Disabled while there's no token,
 * so it doesn't fire (and 401) on public pages like the login screen.
 */
export function useMe() {
  const token = useAuthStore((s) => s.token);

  return useSafeQuery({
    queryKey: authKeys.me(),
    queryFn: getMe,
    enabled: Boolean(token),
    staleTime: 5 * 60 * 1000,
  });
}
