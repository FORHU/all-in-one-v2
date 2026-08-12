/** Mirrors the backend's own Decimal->number coercion (product.mapper.ts's toNumber). */
export function toNumber(value: string | number | null | undefined): number {
  if (value == null) return 0;
  const num = typeof value === "number" ? value : Number(value);
  return Number.isNaN(num) ? 0 : num;
}

export function formatMoney(value: string | number | null | undefined): string {
  return `$${toNumber(value).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatCompactMoney(
  value: string | number | null | undefined,
): string {
  const num = toNumber(value);
  return num >= 1000 ? `$${(num / 1000).toFixed(1)}k` : `$${num.toFixed(0)}`;
}

export function formatChartDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export function formatCustomerName(customer: {
  firstName: string | null;
  lastName: string | null;
  email: string;
}): string {
  const name = [customer.firstName, customer.lastName]
    .filter(Boolean)
    .join(" ");
  return name || customer.email;
}
