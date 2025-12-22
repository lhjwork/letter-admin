import { apiClient } from "./client";
import type { ApiResponse, User, UserDetail, UserStats, UserLettersResponse, UserQueryParams, Pagination } from "../types";

export const getUsers = (params: UserQueryParams) => {
  const searchParams: Record<string, string> = {};

  if (params.page !== undefined) {
    searchParams.page = params.page.toString();
  }

  if (params.limit !== undefined) {
    searchParams.limit = params.limit.toString();
  }

  if (params.search) {
    searchParams.search = params.search;
  }

  if (params.status) {
    searchParams.status = params.status;
  }

  if (params.sort) {
    searchParams.sort = params.sort;
  }

  if (params.order) {
    searchParams.order = params.order;
  }

  return apiClient.get("admin/users", { searchParams }).json<ApiResponse<User[]> & { pagination: Pagination }>();
};

export const getUserById = (id: string) => apiClient.get(`admin/users/${id}`).json<ApiResponse<User>>();

export const getUserDetail = (id: string) => apiClient.get(`admin/users/${id}/detail`).json<ApiResponse<UserDetail>>();

export const getUserStats = (id: string) => apiClient.get(`admin/users/${id}/stats`).json<ApiResponse<UserStats>>();

export const getUserLetters = (id: string, params: { page?: number; limit?: number; status?: string }) => {
  const searchParams: Record<string, string> = {};

  if (params.page !== undefined) {
    searchParams.page = params.page.toString();
  }

  if (params.limit !== undefined) {
    searchParams.limit = params.limit.toString();
  }

  if (params.status) {
    searchParams.status = params.status;
  }

  return apiClient.get(`admin/users/${id}/letters`, { searchParams }).json<UserLettersResponse>();
};

export const searchUsers = (query: string, params: { limit?: number; status?: string } = {}) => {
  const searchParams: Record<string, string> = { query };

  if (params.limit !== undefined) {
    searchParams.limit = params.limit.toString();
  }

  if (params.status) {
    searchParams.status = params.status;
  }

  return apiClient.get("admin/users/search", { searchParams }).json<ApiResponse<User[]>>();
};

export const updateUser = (id: string, data: Partial<{ name: string; email: string }>) => apiClient.put(`admin/users/${id}`, { json: data }).json<ApiResponse<User>>();

export const banUser = (id: string, reason: string) => apiClient.post(`admin/users/${id}/ban`, { json: { reason } }).json<ApiResponse<User>>();

export const unbanUser = (id: string) => apiClient.post(`admin/users/${id}/unban`).json<ApiResponse<User>>();

export const deleteUser = (id: string) => apiClient.delete(`admin/users/${id}`).json<ApiResponse<null>>();
