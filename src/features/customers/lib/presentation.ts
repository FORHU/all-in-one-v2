export const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  active: { bg: "var(--shop-success-bg)", color: "var(--shop-success)" },
  inactive: { bg: "var(--shop-warning-bg)", color: "var(--shop-warning)" },
};

export const VERIFIED_STYLES = {
  verified: { bg: "var(--shop-success-bg)", color: "var(--shop-success)" },
  unverified: { bg: "var(--shop-neutral-bg)", color: "var(--shop-neutral)" },
};

export function initials(name: string): string {
  const words = name
    .trim()
    .split(/\s+/)
    .filter((w) => /[A-Za-z0-9]/.test(w));
  const first = words[0]?.[0] ?? "";
  const second = words[1]?.[0] ?? "";
  return (first + second).toUpperCase();
}

export function formatLastActive(isoDate: string | null): string {
  if (!isoDate) return "Never";
  return new Date(isoDate).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatJoined(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
