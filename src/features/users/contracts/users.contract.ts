import { z } from "zod";

/**
 * FAOS v5 — Zod Contract
 *
 * This is the authoritative shape of the users API response.
 * If the backend drifts, this throws immediately in development.
 * The schema is the source of truth — not TypeScript types.
 */
export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
});

export const UsersResponseSchema = z.array(UserSchema);

export type User = z.infer<typeof UserSchema>;
export type UsersResponse = z.infer<typeof UsersResponseSchema>;
