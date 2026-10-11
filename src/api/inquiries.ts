import { apiClient } from "./client";
import type { ApiResponse, InquiryDetail, InquiryItem, InquiryStatus, PagedItems } from "../types";

export const getInquiries = (page: number, status: InquiryStatus | "") =>
  apiClient.get("admin/inquiries", { searchParams: { page, limit: 20, ...(status && { status }) } }).json<ApiResponse<PagedItems<InquiryItem>>>();

export const getInquiry = (id: string) => apiClient.get(`admin/inquiries/${id}`).json<ApiResponse<InquiryDetail>>();

export const answerInquiry = (id: string, answer: string) => apiClient.patch(`admin/inquiries/${id}/answer`, { json: { answer } }).json<ApiResponse<{ _id: string; status: InquiryStatus; answeredAt: string }>>();
