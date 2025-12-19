import type { Permission, AdminRole } from "../types";
import { ROLE_PERMISSIONS } from "../types";

export const hasRolePermission = (role: AdminRole, permission: Permission): boolean => {
  return ROLE_PERMISSIONS[role].includes(permission);
};

export const getAllPermissionsForRole = (role: AdminRole): Permission[] => {
  return ROLE_PERMISSIONS[role];
};

export const canAccessResource = (role: AdminRole, additionalPermissions: Permission[], requiredPermission: Permission): boolean => {
  if (role === "super_admin") return true;
  if (hasRolePermission(role, requiredPermission)) return true;
  return additionalPermissions.includes(requiredPermission);
};
