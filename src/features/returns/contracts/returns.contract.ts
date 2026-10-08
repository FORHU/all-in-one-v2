import { z } from "zod";

/**
 * Full backend lifecycle (return-status.util.ts's ALLOWED_RETURN_TRANSITIONS)
 * — supersedes the old 5-value set. Shared by the list, by-order, and detail
 * schemas below so there's exactly one place this has to stay in sync with
 * the API's ReturnStatus enum.
 */
export const RETURN_STATUS_ENUM = [
  "PENDING",
  "UNDER_REVIEW",
  "EVIDENCE_REQUIRED",
  "APPROVED",
  "REJECTED",
  "CJ_DISPUTE_SUBMITTED",
  "CJ_DISPUTE_UNDER_REVIEW",
  "CJ_APPROVED",
  "CJ_REJECTED",
  "REFUND_PROCESSING",
  "REPLACEMENT_PROCESSING",
  "RETURN_PROCESSING",
  "COMPLETED",
  "CANCELLED",
] as const;

export const ReturnRequestTypeSchema = z.enum([
  "REFUND",
  "REPLACEMENT",
  "RETURN",
]);

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
  status: z.enum(RETURN_STATUS_ENUM),
  requestType: ReturnRequestTypeSchema,
  notes: z.string().nullable(),
  // True when the most recent status-history entry shows the customer
  // resubmitting evidence in response to an admin's EVIDENCE_REQUIRED
  // request (ReturnService.listReturns) — lets the queue table flag these
  // rows distinctly from a generic "Under Review".
  hasNewCustomerEvidence: z.boolean(),
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
  status: z.enum(RETURN_STATUS_ENUM),
  requestType: ReturnRequestTypeSchema,
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
    status: z.enum(RETURN_STATUS_ENUM),
    notes: z.string().nullable(),
    createdAt: z.string(),
    updatedAt: z.string(),
  }),
});

export type ReturnByOrder = z.infer<typeof ReturnByOrderSchema>;
export type Refund = z.infer<typeof RefundSchema>;

// ── Admin review detail (GET /api/v2/returns/:id/detail) ───────────────────
// Matches ReturnRepository.findByIdWithDetail's include exactly. Money
// fields stay strings, same convention as every other schema in this file —
// formatMoney in lib/presentation.ts does the display conversion.

export const ReturnDetailItemSchema = z.object({
  id: z.string(),
  orderItemId: z.string(),
  quantity: z.number(),
  unitPriceSnapshot: z.string(),
  supplierCostSnapshot: z.string().nullable(),
  orderItem: z.object({
    id: z.string(),
    productTitle: z.string(),
    variantTitle: z.string().nullable(),
    sku: z.string().nullable(),
    imageUrl: z.string().nullable(),
    quantity: z.number(),
    unitPrice: z.string(),
  }),
});

export const ReturnEvidenceSchema = z.object({
  id: z.string(),
  url: z.string(),
  mimeType: z.string().nullable(),
  uploadedByRole: z.enum(["CUSTOMER", "ADMIN"]),
  createdAt: z.string(),
});

export const ReturnDisputeSchema = z.object({
  id: z.string(),
  cjOrderExternalId: z.string(),
  cjDisputeId: z.string().nullable(),
  expectType: z.number(),
  refundType: z.number().nullable(),
  status: z.enum([
    "SUBMITTED",
    "UNDER_REVIEW",
    "APPROVED",
    "REJECTED",
    "CANCELLED",
    "FAILED_TO_SUBMIT",
  ]),
  cjRawStatus: z.string().nullable(),
  cjRefundAmount: z.string().nullable(),
  replacementTrackingNumber: z.string().nullable(),
  replacementCarrier: z.string().nullable(),
  notes: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const ReturnFinancialsSchema = z.object({
  originalProductCost: z.string().nullable(),
  customerRefundAmount: z.string().nullable(),
  cjReimbursementAmount: z.string().nullable(),
  replacementProductCost: z.string().nullable(),
  replacementShippingCost: z.string().nullable(),
  costCoveredBy: z
    .enum(["CJ", "ADDICTSTYLE", "CUSTOMER_NOT_REFUNDED", "SPLIT"])
    .nullable(),
  outcomeNotes: z.string().nullable(),
});

export const ReturnPhysicalShipmentSchema = z.object({
  carrier: z.string().nullable(),
  trackingNumber: z.string().nullable(),
  instructions: z.string().nullable(),
  shippedAt: z.string().nullable(),
  receivedAt: z.string().nullable(),
  receivedConditionNotes: z.string().nullable(),
});

export const ReturnStatusHistoryEntrySchema = z.object({
  id: z.string(),
  fromStatus: z.enum(RETURN_STATUS_ENUM).nullable(),
  toStatus: z.enum(RETURN_STATUS_ENUM),
  actorUserId: z.string().nullable(),
  actorRole: z.string().nullable(),
  note: z.string().nullable(),
  createdAt: z.string(),
});

export const ReturnDetailSchema = z.object({
  id: z.string(),
  orderId: z.string(),
  customerId: z.string(),
  reason: z.string(),
  status: z.enum(RETURN_STATUS_ENUM),
  requestType: ReturnRequestTypeSchema,
  description: z.string().nullable(),
  preferredResolution: z.enum(["REFUND", "REPLACEMENT"]).nullable(),
  requiresPhysicalReturn: z.boolean(),
  notes: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  order: z.object({
    id: z.string(),
    orderNumber: z.string(),
    totalAmount: z.string(),
    currency: z.string(),
  }),
  customer: z.object({
    id: z.string(),
    email: z.string().email(),
    firstName: z.string().nullable(),
    lastName: z.string().nullable(),
  }),
  items: z.array(ReturnDetailItemSchema),
  evidence: z.array(ReturnEvidenceSchema),
  disputes: z.array(ReturnDisputeSchema),
  financials: ReturnFinancialsSchema.nullable(),
  physicalShipment: ReturnPhysicalShipmentSchema.nullable(),
  statusHistory: z.array(ReturnStatusHistoryEntrySchema),
  refund: z
    .object({
      id: z.string(),
      amount: z.string(),
      status: z.enum(["PENDING", "PROCESSING", "COMPLETED", "FAILED"]),
    })
    .nullable(),
});

export const ReturnDetailResponseSchema = z.object({
  status: z.string(),
  statusCode: z.number(),
  data: ReturnDetailSchema,
});

// Every status-transition mutation shares this response shape — the
// updated Return row, no nested relations (matches ReturnRepository.
// transitionStatus's plain `prisma.return.update` return value).
export const ReturnTransitionResponseSchema = z.object({
  status: z.string(),
  statusCode: z.number(),
  data: z.object({
    id: z.string(),
    status: z.enum(RETURN_STATUS_ENUM),
    notes: z.string().nullable(),
    updatedAt: z.string(),
  }),
});

export type ReturnDetail = z.infer<typeof ReturnDetailSchema>;
export type ReturnDetailItem = z.infer<typeof ReturnDetailItemSchema>;
export type ReturnEvidence = z.infer<typeof ReturnEvidenceSchema>;
export type ReturnDispute = z.infer<typeof ReturnDisputeSchema>;
export type ReturnStatusHistoryEntry = z.infer<
  typeof ReturnStatusHistoryEntrySchema
>;

// ── CJ dispute round trip (file / refresh / confirm-outcome) ───────────────

export const FileCjDisputeResponseSchema = z.object({
  status: z.string(),
  statusCode: z.number(),
  data: z.discriminatedUnion("filed", [
    z.object({ filed: z.literal(false), reason: z.string() }),
    z.object({
      filed: z.literal(true),
      return: z.object({
        id: z.string(),
        status: z.enum(RETURN_STATUS_ENUM),
        notes: z.string().nullable(),
        updatedAt: z.string(),
      }),
    }),
  ]),
});

export const RefreshCjDisputeResponseSchema = z.object({
  status: z.string(),
  statusCode: z.number(),
  data: z.object({
    hasCjDisputeId: z.boolean(),
    cjRawStatus: z.string().nullable().optional(),
    cjRefundAmount: z.string().nullable().optional(),
    stale: z.boolean(),
  }),
});
