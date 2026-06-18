import { fetcher } from "@/shared/lib/http";

export const login = async (credentials: Record<string, string>) => {
  return fetcher<{ token: string }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
};

export const logout = async () => {
  return fetcher("/api/auth/logout", {
    method: "POST",
  });
};
