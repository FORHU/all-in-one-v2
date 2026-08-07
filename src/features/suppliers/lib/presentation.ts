// Deterministic per-supplier color so a given supplier always gets the same
// tile — same approach AppSidebar uses for tenant avatar chips. Dedicated
// --shop-avatar-* tokens (identity colors), not the semantic status
// palette, so a supplier's tile is never mistaken for a status badge.
const SUPPLIER_AVATAR_PALETTE = [
  "var(--shop-avatar-1)",
  "var(--shop-avatar-2)",
  "var(--shop-avatar-3)",
  "var(--shop-avatar-4)",
  "var(--shop-avatar-5)",
];

export function supplierAvatarColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return SUPPLIER_AVATAR_PALETTE[hash % SUPPLIER_AVATAR_PALETTE.length];
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

// The API only exposes the supplier's kebab-case id (e.g. "cj-dropshipping")
// — no display name field exists on the backend. Derive one for the UI.
export function formatSupplierName(id: string): string {
  return id
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
