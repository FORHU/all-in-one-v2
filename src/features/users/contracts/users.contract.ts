import { z } from "zod";

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
 *
 * `role` is a plain string, not the shared `ApiRoleSchema` enum: this list
 * spans every account on the platform, including roles outside the
 * admin-tier enum (e.g. plain customers). Unlike login/me — where an
 * unrecognized role must hard-fail because it drives RBAC — a stray value
 * here should just degrade to "unrecognized" for that one row (handled by
 * features/staff's displayRole()) rather than take down the whole list.
 *
 * No tenant field exists anywhere on this record — confirmed against the
 * live response. Accounts (staff and customers alike) are platform-wide,
 * not scoped to a single store.
 */
export const UserSchema = z.object({
  id: z.string(),
  name: z.string().nullable(),
  email: z.string().email(),
  username: z.string(),
  role: z.string(),
  isActive: z.boolean(),
  isEmailVerified: z.boolean(),
  lastLoginAt: z.string().nullable(),
  createdAt: z.string(),
});

/**
 * GET /api/v2/users — { status, statusCode, data: { items, total, page, limit, totalPages } }.
 * Matches the backend's generic PageResult wrapper (confirmed via its
 * Swagger component schema), so page/limit are expected to work as
 * standard pagination query params.
 */
export const UsersResponseSchema = z.object({
  status: z.string(),
  statusCode: z.number(),
  data: z.object({
    items: z.array(UserSchema),
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number(),
  }),
});

export type User = z.infer<typeof UserSchema>;
export type UsersPage = z.infer<typeof UsersResponseSchema>["data"];
