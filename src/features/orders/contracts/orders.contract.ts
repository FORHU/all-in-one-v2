import { z } from "zod";

/**
 * FAOS v5 — Zod Contract
 *
 * Authoritative shape of the admin orders list response
 * (GET /api/v2/orders). Matches OrderRepository.findAll's include:
 * a flattened customer summary (null for guest orders) + item count.
 */
export const OrderSchema = z.object({
  id: z.string(),
  orderNumber: z.string(),
  status: z.enum([
    "PENDING",
    "PROCESSING",
    "PARTIALLY_FULFILLED",
    "FULFILLED",
    "CANCELLED",
    "REFUNDED",
  ]),
  subtotal: z.string(),
  discountAmount: z.string(),
  taxAmount: z.string(),
  shippingAmount: z.string(),
  totalAmount: z.string(),
  currency: z.string(),
  customer: z
    .object({
      email: z.string().email(),
      firstName: z.string().nullable(),
      lastName: z.string().nullable(),
    })
    .nullable(),
  _count: z.object({
    items: z.number(),
  }),
  createdAt: z.string(),
  updatedAt: z.string(),
});

/**
 * GET /api/v2/orders — { status, statusCode, data: { items, total, page, limit, totalPages } }.
 * Matches the backend's generic PageResult wrapper, same as customers.contract.ts.
 */
export const OrdersResponseSchema = z.object({
  status: z.string(),
  statusCode: z.number(),
  data: z.object({
    items: z.array(OrderSchema),
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number(),
  }),
});

export type Order = z.infer<typeof OrderSchema>;
export type OrderStatus = Order["status"];
export type OrdersPage = z.infer<typeof OrdersResponseSchema>["data"];

export const ORDER_STATUS_VALUES = OrderSchema.shape.status.options;

// ── Order detail (GET /api/v2/orders/:id) ──────────────────────────────────
// Matches OrderRepository.findById's include: full customer + shipping
// address + line items + supplier fulfillments (with shipments) + payments.

export const OrderItemSchema = z.object({
  id: z.string(),
  productVariantId: z.string(),
  quantity: z.number(),
  unitPrice: z.string(),
  productTitle: z.string(),
  variantTitle: z.string().nullable(),
  sku: z.string().nullable(),
  imageUrl: z.string().nullable(),
  supplierCost: z.string().nullable(),
});

export const ShippingAddressSchema = z.object({
  id: z.string(),
  fullName: z.string(),
  addressLine1: z.string(),
  addressLine2: z.string().nullable(),
  city: z.string(),
  state: z.string().nullable(),
  postalCode: z.string(),
  country: z.string(),
  phone: z.string().nullable(),
});

export const OrderCustomerDetailSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  phone: z.string().nullable(),
});

export const ShipmentStatusSchema = z.enum([
  "PENDING",
  "LABEL_CREATED",
  "PICKED_UP",
  "IN_TRANSIT",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "FAILED",
  "RETURNED",
]);

export const ShipmentSchema = z.object({
  id: z.string(),
  supplierOrderId: z.string(),
  trackingNumber: z.string().nullable(),
  carrier: z.string().nullable(),
  status: ShipmentStatusSchema,
  shippedAt: z.string().nullable(),
  estimatedDelivery: z.string().nullable(),
  deliveredAt: z.string().nullable(),
});

export const SupplierOrderStatusSchema = z.enum([
  "PENDING",
  "PLACED",
  "CONFIRMED",
  "SHIPPED",
  "DELIVERED",
  "FAILED",
  "CANCELLED",
]);

export const SupplierOrderSchema = z.object({
  id: z.string(),
  supplierId: z.string(),
  externalId: z.string().nullable(),
  status: SupplierOrderStatusSchema,
  trackingNum: z.string().nullable(),
  placedAt: z.string().nullable(),
  supplier: z.object({
    id: z.string(),
    name: z.string(),
    displayName: z.string(),
  }),
  shipments: z.array(ShipmentSchema),
});

export const PaymentStatusSchema = z.enum([
  "CREATED",
  "PENDING",
  "PROCESSING",
  "WAITING_CONFIRMATION",
  "PAID",
  "FAILED",
  "CANCELLED",
  "REFUNDED",
  "VOID",
  "EXPIRED",
]);

export const PaymentSchema = z.object({
  id: z.string(),
  gateway: z.string().nullable(),
  channel: z.string().nullable(),
  instrument: z.string().nullable(),
  expectedAmount: z.string(),
  amount: z.string(),
  currency: z.string(),
  status: PaymentStatusSchema,
  createdAt: z.string(),
});

export const OrderDetailSchema = OrderSchema.omit({
  customer: true,
  _count: true,
}).extend({
  customer: OrderCustomerDetailSchema.nullable(),
  shippingAddress: ShippingAddressSchema.nullable(),
  items: z.array(OrderItemSchema),
  supplierOrders: z.array(SupplierOrderSchema),
  payments: z.array(PaymentSchema),
});

export const OrderDetailResponseSchema = z.object({
  status: z.string(),
  statusCode: z.number(),
  data: OrderDetailSchema,
});

export const SupplierOrdersResponseSchema = z.object({
  status: z.string(),
  statusCode: z.number(),
  data: z.array(SupplierOrderSchema),
});

export const ShipmentResponseSchema = z.object({
  status: z.string(),
  statusCode: z.number(),
  data: ShipmentSchema,
});

export type OrderDetail = z.infer<typeof OrderDetailSchema>;
export type OrderItem = z.infer<typeof OrderItemSchema>;
export type SupplierOrder = z.infer<typeof SupplierOrderSchema>;
export type SupplierOrderStatus = z.infer<typeof SupplierOrderStatusSchema>;
export type Shipment = z.infer<typeof ShipmentSchema>;
export type ShipmentStatus = z.infer<typeof ShipmentStatusSchema>;
export type Payment = z.infer<typeof PaymentSchema>;
export type PaymentStatus = z.infer<typeof PaymentStatusSchema>;

export const SHIPMENT_STATUS_VALUES = ShipmentStatusSchema.options;
