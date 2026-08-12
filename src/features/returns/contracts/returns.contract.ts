import { z } from "zod";

/**
 * FAOS v5 — Zod Contract
 *
 * Authoritative shape of the admin returns list response (GET /api/v2/returns).
 * Matches ReturnRepository.findAll's include: the parent order's number/total,
 * the requesting customer, and the linked refund (null until one is issued).
 */
export const ReturnSchema = z.object({
  id: z.string(),
  orderId: z.string(),
  reason: z.string(),
  status: z.enum(["PENDING", "APPROVED", "REJECTED", "RECEIVED", "COMPLETED"]),
  notes: z.string().nullable(),
  order: z.object({
    id: z.string(),
    orderNumber: z.string(),
    totalAmount: z.string(),
    currency: z.string(),
  }),
  customer: z.object({
    email: z.string().email(),
    firstName: z.string().nullable(),
    lastName: z.string().nullable(),
  }),
  refund: z
    .object({
      id: z.string(),
      amount: z.string(),
      status: z.enum(["PENDING", "PROCESSING", "COMPLETED", "FAILED"]),
    })
    .nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

/**
 * GET /api/v2/returns — { status, statusCode, data: { items, total, page, limit, totalPages } }.
 * Matches the backend's generic PageResult wrapper, same as orders.contract.ts.
 */
export const ReturnsResponseSchema = z.object({
  status: z.string(),
  statusCode: z.number(),
  data: z.object({
    items: z.array(ReturnSchema),
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number(),
  }),
});

export type Return = z.infer<typeof ReturnSchema>;
export type ReturnStatus = Return["status"];
export type RefundStatus = NonNullable<Return["refund"]>["status"];
export type ReturnsPage = z.infer<typeof ReturnsResponseSchema>["data"];

export const RETURN_STATUS_VALUES = ReturnSchema.shape.status.options;
