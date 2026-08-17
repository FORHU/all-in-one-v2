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

// ── Return actions (approve/reject/refund) + GET /returns/order/:orderId ───
// This endpoint's include (ReturnRepository.findByOrderId) has no `order`/
// `customer` relation — unlike the paginated list above — so it gets its own,
// slightly slimmer schema rather than reusing ReturnSchema.

export const ReturnByOrderSchema = z.object({
  id: z.string(),
  orderId: z.string(),
  customerId: z.string(),
  reason: z.string(),
  status: z.enum(["PENDING", "APPROVED", "REJECTED", "RECEIVED", "COMPLETED"]),
  notes: z.string().nullable(),
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

// Order fields the returns feature needs on its own — refund-amount prefill,
// whether there's a customer to attach a new return to — fetched from this
// feature's own endpoint (GET /returns/order/:orderId) rather than reaching
// into the orders feature, which FAOS forbids importing directly.
export const ReturnsOrderSummarySchema = z.object({
  id: z.string(),
  customerId: z.string().nullable(),
  totalAmount: z.string(),
  currency: z.string(),
});

export const ReturnsByOrderResponseSchema = z.object({
  status: z.string(),
  statusCode: z.number(),
  data: z.object({
    order: ReturnsOrderSummarySchema,
    returns: z.array(ReturnByOrderSchema),
  }),
});

export const ReturnMutationResponseSchema = z.object({
  status: z.string(),
  statusCode: z.number(),
  data: ReturnByOrderSchema,
});

export const RefundSchema = z.object({
  id: z.string(),
  orderId: z.string(),
  returnId: z.string().nullable(),
  amount: z.string(),
  reason: z.string().nullable(),
  status: z.enum(["PENDING", "PROCESSING", "COMPLETED", "FAILED"]),
  transactionId: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const IssueRefundResponseSchema = z.object({
  status: z.string(),
  statusCode: z.number(),
  data: RefundSchema,
});

export const CreateReturnResponseSchema = z.object({
  status: z.string(),
  statusCode: z.number(),
  data: z.object({
    id: z.string(),
    orderId: z.string(),
    customerId: z.string(),
    reason: z.string(),
    status: z.enum([
      "PENDING",
      "APPROVED",
      "REJECTED",
      "RECEIVED",
      "COMPLETED",
    ]),
    notes: z.string().nullable(),
    createdAt: z.string(),
    updatedAt: z.string(),
  }),
});

export type ReturnByOrder = z.infer<typeof ReturnByOrderSchema>;
export type Refund = z.infer<typeof RefundSchema>;
