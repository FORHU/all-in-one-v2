import { ApiError } from "@/shared/errors/api-error";
import { env } from "@/shared/lib/env";
import {
  clearRefreshToken,
  clearToken,
  getRefreshToken,
  getToken,
  setRefreshToken,
  setToken,
} from "@/shared/lib/token";
import { getTenantSlug } from "@/shared/tenant/tenant-storage";

function classify(
  status: number,
):
  | "AUTH"
  | "FORBIDDEN"
  | "VALIDATION"
  | "NOT_FOUND"
  | "SERVER"
  | "NETWORK"
  | "UNKNOWN" {
  if (status === 401) return "AUTH";
  if (status === 403) return "FORBIDDEN";
  if (status === 404) return "NOT_FOUND";
  // 400 (malformed input) and 409 (conflict, e.g. duplicate email on
  // register) both resolve to a per-field message the same way 422 does —
  // see api-guide.md's Error Code Troubleshooting Matrix.
  if (status === 400 || status === 409 || status === 422) return "VALIDATION";
  if (status >= 500) return "SERVER";
  return "UNKNOWN";
}

// Dedupes concurrent 401s during a refresh: everyone piggybacks on one
// in-flight refresh call instead of each firing their own.
let refreshPromise: Promise<string | null> | null = null;

/**
 * Raw fetch — deliberately bypasses `fetcher()` so a failed refresh can
 * never itself trigger another refresh attempt (which would recurse).
 */
async function refreshAccessToken(): Promise<string | null> {
  const currentRefreshToken = getRefreshToken();
  if (!currentRefreshToken) return null;

  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const res = await fetch(
          `${env.NEXT_PUBLIC_API_URL}/api/v2/auth/refresh-token`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken: currentRefreshToken }),
          },
        );

        if (!res.ok) {
          clearToken();
          clearRefreshToken();
          return null;
        }

        const data = await res.json();
        if (
          typeof data?.accessToken !== "string" ||
          typeof data?.refreshToken !== "string"
        ) {
          clearToken();
          clearRefreshToken();
          return null;
        }

        setToken(data.accessToken);
        setRefreshToken(data.refreshToken);
        return data.accessToken;
      } catch {
        return null;
      } finally {
        refreshPromise = null;
      }
    })();
  }

  return refreshPromise;
}

export async function fetcher<T>(
  url: string,
  options?: RequestInit,
  isRetry = false,
): Promise<T> {
  try {
    const token = getToken();
    const tenantSlug = getTenantSlug();
    const res = await fetch(`${env.NEXT_PUBLIC_API_URL}${url}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(tenantSlug ? { "x-tenant-slug": tenantSlug } : {}),
        ...(options?.headers || {}),
      },
    });

    if (!res.ok) {
      // A stale access token is recoverable — try a silent refresh and
      // replay the request once before surfacing an auth error. Auth
      // endpoints are excluded: a 401 there means bad credentials/token,
      // not an expired session.
      if (res.status === 401 && !isRetry && !url.startsWith("/api/v2/auth/")) {
        const newToken = await refreshAccessToken();
        if (newToken) {
          return fetcher<T>(url, options, true);
        }
      }

      let payload: any = null;

      try {
        payload = await res.json();
      } catch {}

      const category = classify(res.status);

      throw new ApiError(payload?.message || "Request failed", category, {
        status: res.status,
        code: payload?.code,
        details: payload?.details,
      });
    }

    // 204 No Content / empty bodies (e.g. DELETE) have nothing to parse —
    // calling res.json() on them throws. Resolve to undefined instead.
    if (res.status === 204 || res.headers.get("content-length") === "0") {
      return undefined as T;
    }

    return res.json();
  } catch (err: any) {
    if (err instanceof TypeError) {
      throw new ApiError("Network error", "NETWORK");
    }
    throw err;
  }
}
