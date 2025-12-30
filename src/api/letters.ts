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
// 실물 편지 상태 관리 API (Admin 전용 API 사용)
export const updateLetterPhysicalStatus = async (data: LetterStatusUpdateRequest): Promise<ApiResponse<LetterPhysicalInfo>> => {
  try {
    console.log("Updating physical letter status:", {
      letterId: data.letterId,
      status: data.status,
      adminNote: data.adminNote,
    });

    // Admin 전용 API 사용 - letterId로 직접 업데이트
    const response = await apiClient
      .patch(`admin/physical-requests/${data.letterId}`, {
        json: {
          status: data.status,
          notes: data.adminNote,
        },
      })
      .json<ApiResponse<any>>();

    console.log("✅ Status update response:", response);

    // 캐시 무효화를 위한 지연
    await new Promise((resolve) => setTimeout(resolve, 500));

    // 응답을 LetterPhysicalInfo 형태로 변환
    const letterInfo: LetterPhysicalInfo = {
      _id: data.letterId,
      requestId: data.requestId,
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

// 개별 편지 상태 확인 함수
export const verifyLetterStatus = async (letterId: string): Promise<any> => {
  try {
    const response = await apiClient.get(`admin/letters/${letterId}`).json<ApiResponse<any>>();

    if (response.success) {
      const letter = response.data;
      console.log(`📋 Letter ${letterId} verification:`, letter);

      // 새로운 구조에서 상태 확인
      if (letter.recipientAddresses && letter.recipientAddresses.length > 0) {
        const physicalRequests = letter.recipientAddresses.filter((addr: any) => addr.isPhysicalRequested);
        console.log(`📋 Letter ${letterId} physical requests:`, physicalRequests);
        return physicalRequests;
      }

      // 기존 구조에서 상태 확인
      if (letter.physicalRequested) {
        console.log(`📋 Letter ${letterId} physical status:`, letter.physicalStatus);
        return [
          {
            status: letter.physicalStatus,
            requestedAt: letter.physicalRequestDate,
          },
        ];
      }

      return [];
    }
    return [];
  } catch (error) {
    console.error("❌ Failed to verify letter status:", error);
    return [];
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
    // 새로운 API 사용: 모든 편지 조회 후 실물 편지 신청 필터링
    const searchParams: Record<string, string> = {};

    // 파라미터를 문자열로 변환
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        searchParams[key] = value.toString();
      }
    });

    // 실물 편지 신청이 있는 편지만 조회
    searchParams.physicalRequested = "true";

    const response = await apiClient.get("admin/letters", { searchParams }).json<ApiResponse<any[]> & { pagination: Pagination }>();

    // 백엔드 응답 구조 확인을 위한 로깅
    console.log("Backend response:", response);
    if (response.data && response.data.length > 0) {
      console.log("First item structure:", response.data[0]);
      console.log("Available fields:", Object.keys(response.data[0]));
    }

    // 실물 편지 신청 데이터 변환
    const letterInfos: LetterPhysicalInfo[] = [];

    response.data.forEach((letter) => {
      console.log("Processing letter:", letter);

      // 새로운 구조: recipientAddresses 확인
      if (letter.recipientAddresses && letter.recipientAddresses.length > 0) {
        letter.recipientAddresses.forEach((addr: any) => {
          if (addr.isPhysicalRequested) {
            // 상태 필터 적용
            const status = mapBackendStatus(addr.physicalStatus);
            const filterStatus = params.physicalStatus as string;
            if (!filterStatus || filterStatus === "" || status === filterStatus) {
              letterInfos.push({
                _id: letter._id,
                requestId: addr.requestId || addr._id,
                title: letter.title || letter.ogTitle || "제목 없음",
                authorName: letter.authorName || "작성자 없음",
                totalRequests: 1,
                currentStatus: status,
                lastUpdatedAt: addr.physicalRequestDate || letter.updatedAt || new Date().toISOString(),
                adminNote: addr.memo || addr.adminNotes || "",
                createdAt: letter.createdAt || new Date().toISOString(),
                updatedAt: letter.updatedAt || new Date().toISOString(),
              });
            }
          }
        });
      }
      // 기존 구조: physicalRequested 확인 (하위 호환성)
      else if (letter.physicalRequested) {
        const status = mapBackendStatus(letter.physicalStatus);
        const filterStatus = params.physicalStatus as string;
        if (!filterStatus || filterStatus === "" || status === filterStatus) {
          letterInfos.push({
            _id: letter._id,
            requestId: letter._id, // 기존 구조에서는 letterId 사용
            title: letter.title || letter.ogTitle || "제목 없음",
            authorName: letter.authorName || "작성자 없음",
            totalRequests: 1,
            currentStatus: status,
            lastUpdatedAt: letter.physicalRequestDate || letter.updatedAt || new Date().toISOString(),
            adminNote: letter.physicalNotes || "",
            createdAt: letter.createdAt || new Date().toISOString(),
            updatedAt: letter.updatedAt || new Date().toISOString(),
          });
        }
      }
    });

    // 최신 순으로 정렬
    letterInfos.sort((a, b) => {
      const dateA = a.lastUpdatedAt ? new Date(a.lastUpdatedAt).getTime() : 0;
      const dateB = b.lastUpdatedAt ? new Date(b.lastUpdatedAt).getTime() : 0;
      return dateB - dateA;
    });

    console.log(`📊 Found ${letterInfos.length} physical requests`);

    return {
      success: true,
      data: letterInfos,
      pagination: {
        page: 1,
        limit: letterInfos.length,
        total: letterInfos.length,
        totalPages: 1,
      },
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
