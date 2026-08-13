export const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  active: { bg: "var(--shop-success-bg)", color: "var(--shop-success)" },
  onboarding: { bg: "var(--shop-warning-bg)", color: "var(--shop-warning)" },
  suspended: { bg: "var(--shop-danger-bg)", color: "var(--shop-danger)" },
};

export function statusStyle(status: string) {
  return (
    STATUS_STYLES[status.toLowerCase()] ?? {
      bg: "var(--shop-bg-soft)",
      color: "var(--shop-text-muted)",
    }
  );
}

const AVATAR_PALETTE = [
  "var(--shop-accent)",
  "var(--shop-ink)",
  "var(--shop-neutral)",
  "var(--shop-success)",
];

export function avatarColor(index: number): string {
  return AVATAR_PALETTE[index % AVATAR_PALETTE.length];
}

export function initials(name: string): string {
  const words = name
    .trim()
    .split(/\s+/)
    .filter((w) => /[A-Za-z0-9]/.test(w));
  const first = words[0]?.[0] ?? "";
  const second = words[1]?.[0] ?? "";
  return (first + second).toUpperCase();
}
