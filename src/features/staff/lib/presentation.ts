import type { StaffRole } from "../data/mock-staff";

export const ROLE_STYLES: Record<StaffRole, { bg: string; color: string }> = {
  "Super Admin": { bg: "var(--shop-danger-bg)", color: "var(--shop-accent)" },
  Admin: { bg: "var(--shop-success-bg)", color: "var(--shop-success)" },
  Developer: { bg: "var(--shop-neutral-bg)", color: "var(--shop-neutral)" },
};

export const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  active: { bg: "var(--shop-success-bg)", color: "var(--shop-success)" },
  invited: { bg: "var(--shop-warning-bg)", color: "var(--shop-warning)" },
};

const ROLE_AVATAR_COLOR: Record<StaffRole, string> = {
  "Super Admin": "var(--shop-accent)",
  Admin: "var(--shop-success)",
  Developer: "var(--shop-neutral)",
};

export function avatarColorForRole(role: StaffRole): string {
  return ROLE_AVATAR_COLOR[role];
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
