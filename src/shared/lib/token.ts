/**
 * FAOS — Auth token storage (single source of truth)
 *
 * Both the HTTP layer (`shared/lib/http.ts`) and the auth store
 * (`features/auth/stores/auth.store.ts`) read/write the token through here,
 * so the two can never drift out of sync.
 *
 * ⚠️ SECURITY NOTE
 * This template persists the JWT in `localStorage` for portability with any
 * backend. `localStorage` is readable by any script on the page, so it is
 * vulnerable to XSS token theft. For production, prefer an httpOnly, Secure,
 * SameSite cookie set by your backend and drop this module. Swapping the four
 * functions below is the only change needed if you keep a client-side store.
 */

const TOKEN_KEY = "auth_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
}
