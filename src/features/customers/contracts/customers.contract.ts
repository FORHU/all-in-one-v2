import { z } from "zod";

/**
 * FAOS v5 — Zod Contract
 *
 * This is the authoritative shape of the customers API response.
 * If the backend drifts, this throws immediately in development.
 * The schema is the source of truth — not TypeScript types.
 *
 * Unlike features/users' `UserSchema`, this record is already flattened
 * server-side: no nested `customer` object, no `role`/`username`. `name`
 * is whatever the backend resolved (commerce name if set, else auth
 * name/username), and `orderCount` is pre-scoped to the requesting tenant.
 */
export const CustomerSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  phone: z.string().nullable(),
  orderCount: z.number(),
  isActive: z.boolean(),
  isEmailVerified: z.boolean(),
  lastLoginAt: z.string().nullable(),
  createdAt: z.string(),
});

/**
 * GET /api/v2/customers — { status, statusCode, data: { items, total, page, limit, totalPages } }.
 * Matches the backend's generic PageResult wrapper, same as
 * users.contract.ts, so page/limit are expected to work as standard
 * pagination query params.
 */
export const CustomersResponseSchema = z.object({
  status: z.string(),
  statusCode: z.number(),
  data: z.object({
    items: z.array(CustomerSchema),
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number(),
  }),
});

export type Customer = z.infer<typeof CustomerSchema>;
export type CustomersPage = z.infer<typeof CustomersResponseSchema>["data"];
