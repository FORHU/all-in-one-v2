import type { Role } from "@/shared/auth/roles";
import type { ApiRole } from "../contracts/auth.contract";

export function mapApiRole(apiRole: ApiRole): Role {
  return apiRole === "ADMIN" ||
    apiRole === "SUPER_ADMIN" ||
    apiRole === "DEVELOPER"
    ? "admin"
    : "viewer";
}
