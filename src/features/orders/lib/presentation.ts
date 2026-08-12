import { SHIPMENT_STATUS_VALUES } from "../contracts/orders.contract";
import type {
  OrderStatus,
  ShipmentStatus,
  SupplierOrderStatus,
  PaymentStatus,
} from "../contracts/orders.contract";
import type { DropdownOption } from "@/shared/components/Dropdown";

type StatusStyle = { bg: string; color: string };

const neutral: StatusStyle = {
  bg: "var(--shop-neutral-bg)",
  color: "var(--shop-neutral)",
};
const warning: StatusStyle = {
  bg: "var(--shop-warning-bg)",
  color: "var(--shop-warning)",
};
const success: StatusStyle = {
  bg: "var(--shop-success-bg)",
  color: "var(--shop-success)",
};
const danger: StatusStyle = {
  bg: "var(--shop-danger-bg)",
  color: "var(--shop-danger)",
};

// Only tokens that actually exist in theme.css: success/warning/danger/neutral.
export const STATUS_STYLES: Record<OrderStatus, StatusStyle> = {
  PENDING: neutral,
  PROCESSING: warning,
  PARTIALLY_FULFILLED: warning,
  FULFILLED: success,
  CANCELLED: danger,
  REFUNDED: neutral,
};

export const SHIPMENT_STATUS_STYLES: Record<ShipmentStatus, StatusStyle> = {
  PENDING: neutral,
  LABEL_CREATED: neutral,
  PICKED_UP: warning,
  IN_TRANSIT: warning,
  OUT_FOR_DELIVERY: warning,
  DELIVERED: success,
  FAILED: danger,
  RETURNED: danger,
};

/** "PARTIALLY_FULFILLED" -> "Partially Fulfilled" — for selects and detail-page badges. */
export function formatStatusLabel(status: string): string {
  return status
    .toLowerCase()
    .split("_")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

export const SHIPMENT_STATUS_OPTIONS: DropdownOption[] =
  SHIPMENT_STATUS_VALUES.map((s) => ({
    value: s,
    label: formatStatusLabel(s),
    indicatorColor: SHIPMENT_STATUS_STYLES[s].color,
  }));

export const SUPPLIER_ORDER_STATUS_STYLES: Record<
  SupplierOrderStatus,
  StatusStyle
> = {
  PENDING: neutral,
  PLACED: warning,
  CONFIRMED: warning,
  SHIPPED: warning,
  DELIVERED: success,
  FAILED: danger,
  CANCELLED: danger,
};

export const PAYMENT_STATUS_STYLES: Record<PaymentStatus, StatusStyle> = {
  CREATED: neutral,
  PENDING: neutral,
  PROCESSING: warning,
  WAITING_CONFIRMATION: warning,
  PAID: success,
  FAILED: danger,
  CANCELLED: danger,
  REFUNDED: neutral,
  VOID: neutral,
  EXPIRED: danger,
};

export function formatOrderDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatOrderDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
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
