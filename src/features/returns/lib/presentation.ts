import type { ReturnStatus } from "../contracts/returns.contract";

type StatusStyle = { bg: string; color: string };

// Only tokens that actually exist in theme.css: success/warning/danger/neutral.
export const RETURN_STATUS_STYLES: Record<ReturnStatus, StatusStyle> = {
  PENDING: { bg: "var(--shop-neutral-bg)", color: "var(--shop-neutral)" },
  APPROVED: { bg: "var(--shop-warning-bg)", color: "var(--shop-warning)" },
  REJECTED: { bg: "var(--shop-danger-bg)", color: "var(--shop-danger)" },
  RECEIVED: { bg: "var(--shop-warning-bg)", color: "var(--shop-warning)" },
  COMPLETED: { bg: "var(--shop-success-bg)", color: "var(--shop-success)" },
};

/** "PARTIALLY_FULFILLED"-style enum -> "Partially Fulfilled" — for badges. */
export function formatStatusLabel(status: string): string {
  return status
    .toLowerCase()
    .split("_")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

export function formatReturnDate(iso: string): string {
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

export function customerLabel(customer: {
  email: string;
  firstName: string | null;
  lastName: string | null;
}): string {
  const name = [customer.firstName, customer.lastName]
    .filter(Boolean)
    .join(" ");
  return name || customer.email;
}
