import { ApiError } from "@/shared/errors/api-error";

function classify(status: number): "AUTH" | "FORBIDDEN" | "VALIDATION" | "NOT_FOUND" | "SERVER" | "NETWORK" | "UNKNOWN" {
  if (status === 401) return "AUTH";
  if (status === 403) return "FORBIDDEN";
  if (status === 404) return "NOT_FOUND";
  if (status === 422) return "VALIDATION";
  if (status >= 500) return "SERVER";
  return "UNKNOWN";
}

export async function fetcher<T>(url: string, options?: RequestInit): Promise<T> {
  try {
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}${url}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options?.headers || {}),
      },
    });

    if (!res.ok) {
      let payload: any = null;

      try {
        payload = await res.json();
      } catch {}

      const category = classify(res.status);

      throw new ApiError(
        payload?.message || "Request failed",
        category,
        {
          status: res.status,
          code: payload?.code,
          details: payload?.details,
        }
      );
    }

    return res.json();
  } catch (err: any) {
    if (err instanceof TypeError) {
      throw new ApiError("Network error", "NETWORK");
    }
    throw err;
  }
}
