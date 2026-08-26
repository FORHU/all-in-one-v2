import type { Role } from "@/shared/auth/roles";
import type { ApiRole } from "../contracts/auth.contract";

export function mapApiRole(apiRole: ApiRole): Role {
  switch (apiRole) {
    case "SUPER_ADMIN":
      return "super_admin";
    case "DEVELOPER":
      return "developer";
    case "ADMIN":
      return "admin";
    default:
      return "viewer";
  }
}
