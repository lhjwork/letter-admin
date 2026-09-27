import { apiClient } from "./client";
import type { ApiResponse } from "../types";

export type DiaryPhysicalStatus = "none" | "requested" | "approved" | "printing" | "sent" | "delivered" | "rejected";

export interface DiaryPhysicalRequest {
  _id: string;
  title: string;
  month: string;
  paper: string;
  font: string;
  userId: { _id: string; name?: string; realName?: string; email?: string } | string;
  physical: {
    status: DiaryPhysicalStatus;
    binding: "spring" | "perfect";
    copies: number;
    address?: { name: string; phone: string; zipCode: string; address1: string; address2?: string; memo?: string };
    requestedAt?: string;
    updatedAt?: string;
    notes?: string;
  };
}

export const DIARY_STATUS_LABEL: Record<DiaryPhysicalStatus, string> = {
  none: "미신청",
  requested: "신청됨",
  approved: "승인됨",
  printing: "인쇄중",
  sent: "발송됨",
  delivered: "배송완료",
  rejected: "반려",
};

export const getDiaryPhysicalRequests = (status?: string) =>
  apiClient.get("admin/diaries/physical-requests", { searchParams: status ? { status } : {} }).json<ApiResponse<DiaryPhysicalRequest[]>>();

export const updateDiaryPhysical = (diaryId: string, data: { status?: DiaryPhysicalStatus; notes?: string }) =>
  apiClient.patch(`admin/diaries/${diaryId}/physical`, { json: data }).json<ApiResponse<DiaryPhysicalRequest["physical"]>>();

/** 커뮤니티 인쇄 뷰를 소유자 세션 없이 열기 위한 15분 토큰 */
export const getDiaryPrintLink = (diaryId: string) => apiClient.post(`admin/diaries/${diaryId}/print-link`).json<ApiResponse<{ token: string; expiresIn: number }>>();
