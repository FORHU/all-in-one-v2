import { fetcher } from "@/shared/lib/http";
import {
  AuthMeResponseSchema,
  LoginResponseSchema,
  RefreshTokenResultSchema,
  RegisterResponseSchema,
  type AuthMe,
  type LoginInput,
  type LoginResult,
  type RefreshTokenResult,
  type RegisterInput,
  type RegisterResult,
} from "../contracts/auth.contract";

/**
 * POST /api/v2/auth/register
 * Returns the inner `response` object (tokens + user) after Zod validation.
 */
export async function register(input: RegisterInput): Promise<RegisterResult> {
  const raw = await fetcher<unknown>("/api/v2/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });

  const parsed = RegisterResponseSchema.parse(raw);
  return parsed.data;
}

/**
 * POST /api/v2/auth/login
 */
export async function login(input: LoginInput): Promise<LoginResult> {
  const raw = await fetcher<unknown>("/api/v2/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });

  const parsed = LoginResponseSchema.parse(raw);
  return parsed.data;
}

/**
 * POST /api/v2/auth/refresh-token
 * Rotates the refresh token — the old one is invalidated server-side the
 * moment this call succeeds, so callers must persist the new one returned.
 */
export async function refreshToken(
  refreshToken: string,
): Promise<RefreshTokenResult> {
  const raw = await fetcher<unknown>("/api/v2/auth/refresh-token", {
    method: "POST",
    body: JSON.stringify({ refreshToken }),
  });

  return RefreshTokenResultSchema.parse(raw);
}

/**
 * GET /api/v2/users/me
 */
export async function getMe(): Promise<AuthMe> {
  const raw = await fetcher<unknown>("/api/v2/users/me");
  const parsed = AuthMeResponseSchema.parse(raw);
  return parsed.data;
}
