// Display-only label for a staff-tier account, derived from the backend's
// role enum via displayRole() below — not sourced from any mock/fixture data.
export type StaffRole = "Super Admin" | "Admin" | "Developer";

export const ROLE_STYLES: Record<StaffRole, { bg: string; color: string }> = {
  "Super Admin": { bg: "var(--shop-danger-bg)", color: "var(--shop-accent)" },
  Admin: { bg: "var(--shop-success-bg)", color: "var(--shop-success)" },
  Developer: { bg: "var(--shop-neutral-bg)", color: "var(--shop-neutral)" },
};

export const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  active: { bg: "var(--shop-success-bg)", color: "var(--shop-success)" },
  inactive: { bg: "var(--shop-warning-bg)", color: "var(--shop-warning)" },
};

// Used for an account whose role doesn't map to a staff tier (shouldn't
// normally reach this table — staff/page.tsx filters those out already,
// this is just a safe fallback rather than a crash).
export const UNKNOWN_STYLE = {
  bg: "var(--shop-neutral-bg)",
  color: "var(--shop-text-muted)",
};

const ROLE_AVATAR_COLOR: Record<StaffRole, string> = {
  "Super Admin": "var(--shop-accent)",
  Admin: "var(--shop-success)",
  Developer: "var(--shop-neutral)",
};

export function avatarColorForRole(role: StaffRole | null): string {
  return role ? ROLE_AVATAR_COLOR[role] : "var(--shop-text-muted)";
}

// Mirrors the backend's ApiRole enum (see shared/auth/api-role.ts) by value,
// not by import — features/staff can't depend on features/users directly.
// Kept a plain string param (not that enum's type) on purpose: an
// unrecognized value degrades to `null` here instead of throwing, unlike
// the Zod schema that already validated it upstream.
export function displayRole(apiRole: string): StaffRole | null {
  switch (apiRole) {
    case "SUPER_ADMIN":
      return "Super Admin";
    case "ADMIN":
      return "Admin";
    case "DEVELOPER":
      return "Developer";
    default:
      return null;
  }
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

export function formatLastActive(isoDate: string | null): string {
  if (!isoDate) return "Never";
  return new Date(isoDate).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
