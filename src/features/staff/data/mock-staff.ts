// Display-only types for the Staff & Roles table. Real accounts come from
// GET /api/v2/users (see StaffTable) — these just name the values that
// route maps to (backend role enum -> display label, isActive -> status).
export type StaffRole = "Super Admin" | "Admin" | "Developer";
export type StaffStatus = "Active" | "Inactive";
