import { fetcher } from "@/shared/lib/http";
import {
  LoginResultSchema,
  RegisterResponseSchema,
  type LoginInput,
  type LoginResult,
  type RegisterInput,
  type RegisterResult,
} from "../contracts/auth.contract";

/**
 * POST /api/v1/auth/register
 * Returns the inner `response` object (tokens + user) after Zod validation.
 */
export async function register(input: RegisterInput): Promise<RegisterResult> {
  const raw = await fetcher<unknown>("/api/v1/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });

  const parsed = RegisterResponseSchema.parse(raw);
  return parsed.response;
}

/**
 * POST /api/v1/auth/login
 */
export async function login(input: LoginInput): Promise<LoginResult> {
  const raw = await fetcher<unknown>("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });

  return LoginResultSchema.parse(raw);
}
