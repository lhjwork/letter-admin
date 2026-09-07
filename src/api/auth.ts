import { apiClient } from "./client";
import type { ApiResponse, Admin } from "../types";

interface LoginResponse {
  admin: Admin;
  token: string;
}

export const login = (username: string, password: string) =>
  apiClient.post("admin/auth/login", { json: { username, password } }).json<ApiResponse<LoginResponse>>();

export const logout = () => apiClient.post("admin/auth/logout").json<ApiResponse<null>>();

export const getMe = () => apiClient.get("admin/auth/me").json<ApiResponse<Admin>>();

export const changePassword = (currentPassword: string, newPassword: string) =>
  apiClient.put("admin/auth/password", { json: { currentPassword, newPassword } }).json<ApiResponse<null>>();
