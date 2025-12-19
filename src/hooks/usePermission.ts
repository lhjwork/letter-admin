import { useAuthStore } from "../stores/authStore";
import type { Permission } from "../types";

export const usePermission = () => {
  const { admin, hasPermission } = useAuthStore();
  const isSuperAdmin = admin?.role === "super_admin";
  const isAdmin = admin?.role === "admin" || isSuperAdmin;
  const isManager = admin?.role === "manager" || isAdmin;

  return {
    admin,
    isSuperAdmin,
    isAdmin,
    isManager,
    hasPermission,
    can: (permission: Permission) => hasPermission(permission),
  };
};
