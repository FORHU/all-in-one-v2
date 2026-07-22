import { fetcher } from "@/shared/lib/http";
import {
  RegisterResponseSchema,
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
