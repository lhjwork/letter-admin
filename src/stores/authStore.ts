import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Admin, Permission, AdminRole } from "../types";
import { ROLE_PERMISSIONS } from "../types";

interface AuthState {
  token: string | null;
  admin: Admin | null;
  isAuthenticated: boolean;
  setAuth: (token: string, admin: Admin) => void;
  logout: () => void;
  hasPermission: (permission: Permission) => boolean;
  isSuperAdmin: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      admin: null,
      isAuthenticated: false,

      setAuth: (token, admin) =>
        set({
          token,
          admin,
          isAuthenticated: true,
        }),

      logout: () =>
        set({
          token: null,
          admin: null,
          isAuthenticated: false,
        }),

      hasPermission: (permission: Permission) => {
        const { admin } = get();
        if (!admin) return false;
        if (admin.role === "super_admin") return true;
        const rolePermissions = ROLE_PERMISSIONS[admin.role as AdminRole];
        if (rolePermissions.includes(permission)) return true;
        return admin.permissions.includes(permission);
      },

      isSuperAdmin: () => {
        const { admin } = get();
        return admin?.role === "super_admin";
      },
    }),
    {
      name: "admin-auth",
    }
  )
);
