import type { InventoryTransactionType } from "../contracts/inventory.contract";
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
export const TRANSACTION_TYPE_STYLES: Record<
  InventoryTransactionType,
  StatusStyle
> = {
  PURCHASE: success,
  SUPPLIER_SYNC: success,
  RETURN: warning,
  MANUAL_ADJUSTMENT: warning,
  SALE: danger,
};

/** "MANUAL_ADJUSTMENT" -> "Manual Adjustment" — for selects and badges. */
export function formatEnumLabel(value: string): string {
  return value
    .toLowerCase()
    .split("_")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

export const TRANSACTION_TYPE_OPTIONS: DropdownOption[] = (
  Object.keys(TRANSACTION_TYPE_STYLES) as InventoryTransactionType[]
).map((t) => ({
  value: t,
  label: formatEnumLabel(t),
  indicatorColor: TRANSACTION_TYPE_STYLES[t].color,
}));

export function locationTypeLabel(type: string): string {
  return formatEnumLabel(type);
}

export function formatInventoryDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatInventoryDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** Signed quantity delta, e.g. "+120" for a restock or "-3" for a sale. */
export function formatQuantityDelta(quantity: number): string {
  return quantity > 0 ? `+${quantity}` : String(quantity);
}

/** Stock badge tone: at/under reorder point reads as a warning, zero as danger, healthy as success. */
export function stockLevelStyle(
  available: number,
  reorderPoint: number,
): StatusStyle {
  if (available <= 0) return danger;
  if (available <= reorderPoint) return warning;
  return success;
}
