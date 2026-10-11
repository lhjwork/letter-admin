import { apiClient } from "./client";
import type { Announcement, AnnouncementInput, ApiResponse, PagedItems } from "../types";

export const getAnnouncements = (page: number) => apiClient.get("admin/notices", { searchParams: { page, limit: 20 } }).json<ApiResponse<PagedItems<Announcement>>>();

export const getAnnouncement = (id: string) => apiClient.get(`admin/notices/${id}`).json<ApiResponse<Announcement>>();

export const createAnnouncement = (data: AnnouncementInput) => apiClient.post("admin/notices", { json: data }).json<ApiResponse<Announcement>>();

export const updateAnnouncement = (id: string, data: Partial<AnnouncementInput>) => apiClient.put(`admin/notices/${id}`, { json: data }).json<ApiResponse<Announcement>>();

export const deleteAnnouncement = (id: string) => apiClient.delete(`admin/notices/${id}`).json<ApiResponse<null>>();
