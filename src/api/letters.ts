import { apiClient } from "./client";
import type { ApiResponse, Letter, LetterQueryParams, LetterStatus, Pagination, PhysicalLetterStatus, LetterStatusUpdateRequest, BulkLetterStatusUpdateRequest, LetterPhysicalInfo } from "../types";

export const getLetters = (params: LetterQueryParams) => {
  const searchParams: Record<string, string> = {};

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      searchParams[key] = value.toString();
    }
  });

  return apiClient.get("admin/letters", { searchParams }).json<ApiResponse<Letter[]> & { pagination: Pagination }>();
};

export const getLetterById = (id: string) => apiClient.get(`admin/letters/${id}`).json<ApiResponse<Letter>>();

export const updateLetter = (id: string, data: Partial<{ title: string; content: string; category: string }>) => apiClient.put(`admin/letters/${id}`, { json: data }).json<ApiResponse<Letter>>();

export const updateLetterStatus = (id: string, status: LetterStatus, reason?: string) => apiClient.put(`admin/letters/${id}/status`, { json: { status, reason } }).json<ApiResponse<Letter>>();

export const deleteLetter = (id: string) => apiClient.delete(`admin/letters/${id}`).json<ApiResponse<null>>();

// 실물 편지 상태 관리 API (기존 API 사용)
export const updateLetterPhysicalStatus = async (data: LetterStatusUpdateRequest): Promise<ApiResponse<LetterPhysicalInfo>> => {
  try {
    // 기존 physical-requests API 사용
    await apiClient
      .patch(`admin/physical-requests/${data.letterId}`, {
        json: {
          status: data.status,
          notes: data.adminNote,
        },
      })
      .json<ApiResponse<any>>();

    // 응답을 LetterPhysicalInfo 형태로 변환
    const letterInfo: LetterPhysicalInfo = {
      _id: data.letterId,
      title: "편지 제목", // 실제로는 응답에서 가져와야 함
      authorName: "작성자", // 실제로는 응답에서 가져와야 함
      totalRequests: 1,
      currentStatus: data.status,
      lastUpdatedAt: new Date().toISOString(),
      adminNote: data.adminNote,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return {
      success: true,
      data: letterInfo,
    };
  } catch (error) {
    console.error("Failed to update physical letter status:", error);
    throw error;
  }
};

export const bulkUpdateLetterPhysicalStatus = async (data: BulkLetterStatusUpdateRequest): Promise<ApiResponse<{ updated: number; failed: string[] }>> => {
  try {
    // 개별적으로 업데이트 (기존 API에 일괄 업데이트가 없는 경우)
    const results = await Promise.allSettled(
      data.letterIds.map((letterId) =>
        updateLetterPhysicalStatus({
          letterId,
          status: data.status,
          adminNote: data.adminNote,
        })
      )
    );

    const updated = results.filter((result) => result.status === "fulfilled").length;
    const failed = results.map((result, index) => (result.status === "rejected" ? data.letterIds[index] : null)).filter(Boolean) as string[];

    return {
      success: true,
      data: { updated, failed },
    };
  } catch (error) {
    console.error("Failed to bulk update physical letter status:", error);
    throw error;
  }
};

export const getLettersWithPhysicalStatus = async (params: LetterQueryParams): Promise<ApiResponse<LetterPhysicalInfo[]> & { pagination: Pagination }> => {
  try {
    // 기존 physical-requests API를 사용하여 데이터 가져오기
    const response = await apiClient
      .get("admin/physical-requests", {
        searchParams: params as Record<string, string>,
      })
      .json<ApiResponse<any[]> & { pagination: Pagination }>();

    // 응답을 LetterPhysicalInfo 형태로 변환
    const letterInfos: LetterPhysicalInfo[] = response.data.map((request) => ({
      _id: request.letterId,
      title: request.letterTitle,
      authorName: request.authorName,
      totalRequests: 1, // 개별 요청이므로 1
      currentStatus: mapBackendStatus(request.status),
      lastUpdatedAt: request.requestedAt,
      adminNote: request.memo,
      createdAt: request.requestedAt,
      updatedAt: request.requestedAt,
    }));

    return {
      success: true,
      data: letterInfos,
      pagination: response.pagination,
    };
  } catch (error) {
    console.error("Failed to fetch letters with physical status:", error);
    throw error;
  }
};

// 백엔드 상태를 프론트엔드 상태로 매핑
const mapBackendStatus = (backendStatus: string): PhysicalLetterStatus => {
  switch (backendStatus) {
    case "requested":
      return "requested";
    case "approved":
    case "writing":
      return "writing";
    case "sent":
      return "sent";
    case "delivered":
      return "delivered";
    default:
      return "requested";
  }
};
