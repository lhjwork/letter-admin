import { apiClient } from "./client";
import type { ApiResponse, Admin, AdminQueryParams, AdminRole, Permission, Pagination } from "../types";

export const getAdmins = (params: AdminQueryParams) => apiClient.get("admin/admins", { searchParams: params as Record<string, string> }).json<ApiResponse<Admin[]> & { pagination: Pagination }>();

export const getAdminById = (id: string) => apiClient.get(`admin/admins/${id}`).json<ApiResponse<Admin>>();

export const createAdmin = (data: { username: string; password: string; name: string; role?: AdminRole; permissions?: Permission[]; department?: string }) =>
  apiClient.post("admin/admins", { json: data }).json<ApiResponse<Admin>>();

export const updateAdmin = (
  id: string,
  data: Partial<{
    name: string;
    role: AdminRole;
    permissions: Permission[];
    department: string;
    status: "active" | "inactive";
  }>
) => apiClient.put(`admin/admins/${id}`, { json: data }).json<ApiResponse<Admin>>();

export const deleteAdmin = (id: string) => apiClient.delete(`admin/admins/${id}`).json<ApiResponse<null>>();
