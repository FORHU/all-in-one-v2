# Frontend integration guide — `GET /api/v2/orders`

Mirrors the `customers` feature exactly (same paginated-admin-list shape). Create these files in `all-in-one-v2`, in order.

---

## 1. `src/features/orders/contracts/orders.contract.ts`

```ts
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
```

> Prisma's `Decimal` fields (`subtotal`, `totalAmount`, etc.) serialize as JSON strings, not numbers — same reason `products.contract.ts` treats `price` as a string. Parse with `Number(...)` only at render time.

---

## 2. `src/features/orders/api/orders.client.ts`

```ts
import { fetcher } from "@/shared/lib/http";
import {
  OrdersResponseSchema,
  type OrderStatus,
} from "../contracts/orders.contract";

export type GetOrdersParams = {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: "createdAt" | "updatedAt" | "orderNumber" | "totalAmount" | "status";
  sortOrder?: "asc" | "desc";
  status?: OrderStatus;
};

/** GET /api/v2/orders — admin-only, requires x-tenant-slug (attached by http.ts). */
export const getOrders = async (params: GetOrdersParams = {}) => {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if (params.search) query.set("search", params.search);
  if (params.sortBy) query.set("sortBy", params.sortBy);
  if (params.sortOrder) query.set("sortOrder", params.sortOrder);
  if (params.status) query.set("status", params.status);

  const qs = query.toString();
  const raw = await fetcher<unknown>(`/api/v2/orders${qs ? `?${qs}` : ""}`);
  return OrdersResponseSchema.parse(raw).data; // throws ZodError if backend drifts
};
```

---

## 3. `src/features/orders/api/orders.keys.ts`

```ts
import type { GetOrdersParams } from "./orders.client";

export const ordersKeys = {
  all: ["orders"] as const,
  lists: () => [...ordersKeys.all, "list"] as const,
  // Tenant slug is part of the key — switching stores must not read another
  // store's cached orders out of react-query's cache.
  list: (tenantSlug: string | null, params: GetOrdersParams) =>
    [...ordersKeys.lists(), tenantSlug, params] as const,
  details: () => [...ordersKeys.all, "detail"] as const,
  detail: (id: string) => [...ordersKeys.details(), id] as const,
};
```

---

## 4. `src/features/orders/hooks/useOrders.ts`

```ts
import { useSafeQuery } from "@/shared/query/useSafeQuery";
import { useTenantStore } from "@/shared/tenant/tenant.store";
import { getOrders, type GetOrdersParams } from "../api/orders.client";
import { ordersKeys } from "../api/orders.keys";

export function useOrders(params: GetOrdersParams = {}) {
  const tenantSlug = useTenantStore((s) => s.tenantSlug);

  return useSafeQuery({
    queryKey: ordersKeys.list(tenantSlug, params),
    queryFn: () => getOrders(params),
    enabled: Boolean(tenantSlug),
    // Keep showing the previous page's rows while the next page loads,
    // instead of flashing back to the loading skeleton on every filter change.
    placeholderData: (prev) => prev,
  });
}
```

---

## 5. `src/features/orders/lib/presentation.ts`

```ts
import type { OrderStatus } from "../contracts/orders.contract";

// Only tokens that actually exist in theme.css: success/warning/danger/neutral.
export const STATUS_STYLES: Record<OrderStatus, { bg: string; color: string }> =
  {
    PENDING: { bg: "var(--shop-neutral-bg)", color: "var(--shop-neutral)" },
    PROCESSING: { bg: "var(--shop-warning-bg)", color: "var(--shop-warning)" },
    PARTIALLY_FULFILLED: {
      bg: "var(--shop-warning-bg)",
      color: "var(--shop-warning)",
    },
    FULFILLED: { bg: "var(--shop-success-bg)", color: "var(--shop-success)" },
    CANCELLED: { bg: "var(--shop-danger-bg)", color: "var(--shop-danger)" },
    REFUNDED: { bg: "var(--shop-neutral-bg)", color: "var(--shop-neutral)" },
  };

export function formatOrderDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatMoney(amount: string, currency: string): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(
    Number(amount),
  );
}

export function customerLabel(
  customer: {
    email: string;
    firstName: string | null;
    lastName: string | null;
  } | null,
): string {
  if (!customer) return "Guest";
  const name = [customer.firstName, customer.lastName]
    .filter(Boolean)
    .join(" ");
  return name || customer.email;
}
```

Verified against `theme.css` — only `--shop-success`, `--shop-warning`, `--shop-danger`, `--shop-neutral` (+ `-bg` variants) exist, so `PROCESSING`/`PARTIALLY_FULFILLED` reuse the warning tokens rather than a nonexistent "info" color.

---

## 6. `src/features/orders/components/OrdersTable.tsx`

```tsx
"use client";

import { useMemo } from "react";
import {
  AlertTriangle as AlertTriangleIcon,
  RotateCw as RotateCwIcon,
} from "lucide-react";
import { Pagination } from "@/shared/components/Pagination";
import type { Order } from "../contracts/orders.contract";
import {
  STATUS_STYLES,
  formatOrderDate,
  formatMoney,
  customerLabel,
} from "../lib/presentation";

type OrdersTableProps = {
  orders: Order[] | undefined;
  isLoading: boolean;
  isError: boolean;
  error?: unknown;
  onRetry: () => void;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export function OrdersTable({
  orders,
  isLoading,
  isError,
  error,
  onRetry,
  page,
  totalPages,
  onPageChange,
}: OrdersTableProps) {
  // The API already applies search/status/pagination — no client-side filtering left to do.
  const rows = useMemo(() => orders ?? [], [orders]);

  return (
    <div>
      <div className="overflow-hidden rounded-xl border border-[var(--shop-border)] bg-[var(--shop-surface)]">
        <div className="grid grid-cols-[1.2fr_1.6fr_1fr_0.8fr_1fr_1fr] items-center gap-3 border-b border-[var(--shop-border)] bg-[var(--shop-bg-soft)] px-[18px] py-3 text-[11px] font-bold uppercase tracking-wide text-[var(--shop-text-muted)]">
          <span>Order</span>
          <span>Customer</span>
          <span>Status</span>
          <span>Items</span>
          <span>Total</span>
          <span>Placed</span>
        </div>

        {isLoading ? (
          <div className="space-y-2 p-[18px]">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-11 animate-pulse rounded-lg bg-[var(--shop-bg-soft)]"
              />
            ))}
          </div>
        ) : isError ? (
          <div role="alert" className="flex flex-col items-start gap-3 p-6">
            <div className="flex items-center gap-2.5">
              <AlertTriangleIcon
                className="h-5 w-5 flex-shrink-0"
                style={{ color: "var(--shop-danger)" }}
                strokeWidth={2.25}
              />
              <p className="text-sm font-semibold text-[var(--shop-text)]">
                Couldn&apos;t load orders
              </p>
            </div>
            <p className="text-sm text-[var(--shop-text-muted)]">
              {error instanceof Error
                ? error.message
                : "Something went wrong while fetching orders."}
            </p>
            <button
              type="button"
              onClick={onRetry}
              className="flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-bold uppercase tracking-wide text-white transition hover:brightness-90"
              style={{ backgroundColor: "var(--shop-accent-dark)" }}
            >
              <RotateCwIcon className="h-3.5 w-3.5" strokeWidth={2.5} />
              Try again
            </button>
          </div>
        ) : rows.length === 0 ? (
          <p className="px-[18px] py-8 text-center text-sm text-[var(--shop-text-muted)]">
            No orders match your search.
          </p>
        ) : (
          rows.map((o) => {
            const statusStyle = STATUS_STYLES[o.status];
            return (
              <div
                key={o.id}
                className="grid grid-cols-[1.2fr_1.6fr_1fr_0.8fr_1fr_1fr] items-center gap-3 border-b border-[var(--shop-border)] px-[18px] py-3.5 last:border-b-0"
              >
                <span className="truncate text-sm font-semibold text-[var(--shop-text)]">
                  {o.orderNumber}
                </span>
                <span className="truncate text-xs text-[var(--shop-text-muted)]">
                  {customerLabel(o.customer)}
                </span>
                <span
                  className="inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-bold"
                  style={{
                    background: statusStyle.bg,
                    color: statusStyle.color,
                  }}
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: statusStyle.color }}
                  />
                  {o.status}
                </span>
                <span className="text-xs text-[var(--shop-text-muted)]">
                  {o._count.items}
                </span>
                <span className="text-xs font-semibold text-[var(--shop-text)]">
                  {formatMoney(o.totalAmount, o.currency)}
                </span>
                <span className="text-xs text-[var(--shop-text-muted)]">
                  {formatOrderDate(o.createdAt)}
                </span>
              </div>
            );
          })
        )}
      </div>

      {!isLoading && !isError && (
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
}
```

---

## 7. `src/features/orders/feature.manifest.ts`

```ts
/**
 * FAOS v5 — Feature Manifest
 *
 * CI-ONLY: This file is never imported into the React tree.
 * It is a static declaration consumed by tools/validate-architecture.ts.
 */
export const featureManifest = {
  name: "orders",
  dependsOn: [] as const,
  exposes: ["OrdersTable", "useOrders"] as const,
} as const;

export type OrdersManifest = typeof featureManifest;
```

---

## 8. Wire the existing page — `src/app/(admin)/orders/page.tsx`

Currently just a `PagePlaceholder`. Replace it:

```tsx
"use client";

import { useEffect, useState } from "react";
import { OrdersTable } from "@/features/orders/components/OrdersTable";
import { useOrders } from "@/features/orders/hooks/useOrders";

const PAGE_SIZE = 20;

export default function OrdersPage() {
  const [page, setPage] = useState(1);

  // tenantSlug (read inside useOrders) comes from localStorage, which the
  // server always sees as empty — gate on `mounted` so the first client
  // render matches the server's, same pattern CustomersPage uses.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { data, isLoading, isError, error, refetch } = useOrders({
    page,
    limit: PAGE_SIZE,
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="shop-display text-2xl font-bold uppercase tracking-tight text-[var(--shop-text)]">
            Orders
          </h2>
          <p className="mt-1 text-sm text-[var(--shop-text-muted)]">
            View and manage all customer orders for this store.
          </p>
        </div>
      </div>
      <OrdersTable
        orders={data?.items}
        isLoading={!mounted || isLoading}
        isError={isError}
        error={error}
        onRetry={refetch}
        page={page}
        totalPages={data?.totalPages ?? 1}
        onPageChange={setPage}
      />
    </div>
  );
}
```

---

## After pasting all 8 files

```bash
npx pnpm run lint
npx pnpm run build
```

Then hit `/orders` in the browser (logged in as an admin/staff role — the endpoint 403s otherwise) and confirm the table loads real data.

**Not covered here, follow-ups if you want them:**

- `orders/completed`, `orders/processing`, `orders/returns` sub-pages — same `useOrders({ status: "FULFILLED" })` / `"PROCESSING"` pattern; `returns` needs the separate `/v2/returns` endpoint instead (`Return` model, not `OrderStatus`), still unintegrated.
- Search/status filter bar (`OrdersFilterBar`, mirroring `CustomersFilterBar`) — the client/hook already accept `search` and `status`, just not wired to any UI yet.
- Order detail view (`GET /v2/orders/:id`) — separate endpoint, already exists on the backend, not part of this list integration.
