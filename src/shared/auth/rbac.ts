import { Permission } from "./permissions";
import { Role } from "./roles";

export interface PermissionContext {
  resourceOwnerId?: string;
  tenantId?: string;
  [key: string]: any;
}

type PermissionEvaluator = boolean | ((context: PermissionContext, user: any) => boolean);

const rolePermissions: Record<Role, Partial<Record<Permission, PermissionEvaluator>>> = {
  admin: {
    "posts:create": true,
    "posts:edit": true,
    "posts:delete": true,
    "users:read": true,
    "users:manage": true,
  },
  editor: {
    "posts:create": true,
    "posts:edit": (context, user) => context.resourceOwnerId === user?.id,
    "users:read": true,
  },
  viewer: {
    "users:read": true,
  },
};

export function hasPermission(
  role: Role,
  permission: Permission,
  context?: PermissionContext,
  user?: any
): boolean {
  const evaluator = rolePermissions[role]?.[permission];
  if (typeof evaluator === "function") {
    return evaluator(context ?? {}, user);
  }
  return evaluator ?? false;
}
