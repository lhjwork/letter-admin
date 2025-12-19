import { apiClient } from "./client";
import type { ApiResponse, Letter, LetterQueryParams, LetterStatus, Pagination } from "../types";

export const getLetters = (params: LetterQueryParams) => apiClient.get("admin/letters", { searchParams: params as Record<string, string> }).json<ApiResponse<Letter[]> & { pagination: Pagination }>();

export const getLetterById = (id: string) => apiClient.get(`admin/letters/${id}`).json<ApiResponse<Letter>>();

export const updateLetter = (id: string, data: Partial<{ title: string; content: string; category: string }>) => apiClient.put(`admin/letters/${id}`, { json: data }).json<ApiResponse<Letter>>();

export const updateLetterStatus = (id: string, status: LetterStatus, reason?: string) => apiClient.put(`admin/letters/${id}/status`, { json: { status, reason } }).json<ApiResponse<Letter>>();

export const deleteLetter = (id: string) => apiClient.delete(`admin/letters/${id}`).json<ApiResponse<null>>();
