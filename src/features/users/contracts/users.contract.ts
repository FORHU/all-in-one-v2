import { z } from "zod";
import { ApiRoleSchema } from "@/shared/auth/api-role";

/**
 * FAOS v5 — Zod Contract
 *
 * This is the authoritative shape of the users API response.
 * If the backend drifts, this throws immediately in development.
 * The schema is the source of truth — not TypeScript types.
 *
 * The live response includes a bcrypt `password` hash per record —
 * deliberately not declared here. Zod strips unrecognized keys by default,
 * so it's dropped at parse time and never reaches app state.
 */
export const UserSchema = z.object({
  id: z.string(),
  name: z.string().nullable(),
  email: z.string().email(),
  username: z.string(),
  role: ApiRoleSchema,
  isActive: z.boolean(),
  lastLoginAt: z.string().nullable(),
});

/** GET /api/v2/users — { status, statusCode, data: { items, total } }. */
export const UsersResponseSchema = z.object({
  status: z.string(),
  statusCode: z.number(),
  data: z.object({
    items: z.array(UserSchema),
    total: z.number(),
  }),
});

export type User = z.infer<typeof UserSchema>;
export type UsersResponse = User[];
