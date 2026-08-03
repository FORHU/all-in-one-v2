"use client";

import { useEffect } from "react";
import { useSafeQuery } from "@/shared/query/useSafeQuery";
import { getMe } from "../api/auth.client";
import { authKeys } from "../api/auth.keys";
import { useAuthStore } from "../stores/auth.store";
import { mapApiRole } from "../lib/mapApiRole";

/**
 * Fetches the logged-in user's profile. Disabled while there's no token,
 * so it doesn't fire (and 401) on public pages like the login screen.
 *
 * Also rehydrates the RBAC `role` in auth.store — that store only holds
 * `role` in memory (unlike `token`, which persists in localStorage), so
 * without this a page refresh would otherwise silently drop an ADMIN/
 * SUPER_ADMIN/DEVELOPER session back to "viewer" permissions.
 */
export function useMe() {
  const token = useAuthStore((s) => s.token);
  const setRole = useAuthStore((s) => s.setRole);

  const query = useSafeQuery({
    queryKey: authKeys.me(),
    queryFn: getMe,
    enabled: Boolean(token),
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (query.data) {
      setRole(mapApiRole(query.data.role));
    }
  }, [query.data, setRole]);

  return query;
}
