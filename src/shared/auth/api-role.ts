import { z } from "zod";

/**
 * Single source of truth for the backend's literal account-role enum —
 * distinct from the client-side RBAC `Role` in ./roles.ts (permission
 * tiers, not the raw API value). Lives in shared, not inside the `auth`
 * feature, because more than one feature needs to validate an account's
 * raw role (auth's login/me, users' account list) and features can't
 * import each other. auth's login and users/me previously declared this
 * enum independently and drifted (one was missing DEVELOPER), so this
 * must never be redeclared inside a feature again.
 */
export const ApiRoleSchema = z.enum([
  "USER",
  "ADMIN",
  "SUPER_ADMIN",
  "DEVELOPER",
]);
export type ApiRole = z.infer<typeof ApiRoleSchema>;
