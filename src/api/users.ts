import { apiClient } from "./client";
import type { ApiResponse, User, UserQueryParams, Pagination } from "../types";

export const getUsers = (params: UserQueryParams) => apiClient.get("admin/users", { searchParams: params as Record<string, string> }).json<ApiResponse<User[]> & { pagination: Pagination }>();

export const getUserById = (id: string) => apiClient.get(`admin/users/${id}`).json<ApiResponse<User>>();

export const updateUser = (id: string, data: Partial<{ name: string; email: string }>) => apiClient.put(`admin/users/${id}`, { json: data }).json<ApiResponse<User>>();

export const banUser = (id: string, reason: string) => apiClient.post(`admin/users/${id}/ban`, { json: { reason } }).json<ApiResponse<User>>();

export const unbanUser = (id: string) => apiClient.post(`admin/users/${id}/unban`).json<ApiResponse<User>>();

export const deleteUser = (id: string) => apiClient.delete(`admin/users/${id}`).json<ApiResponse<null>>();
