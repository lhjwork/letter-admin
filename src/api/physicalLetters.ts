import { apiClient } from "./client";
import type { ApiResponse, PhysicalLetterStats, PhysicalLetterDashboard, Pagination, PhysicalRequestResponse } from "../types";

// 실물 편지 요청 목록 조회 (기존 API 사용)
export const getPhysicalLetterRequests = (
  params: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  } = {}
) => {
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

  if (params.search) {
    searchParams.search = params.search;
  }

  return apiClient.get("admin/physical-requests", { searchParams }).json<ApiResponse<PhysicalRequestResponse[]> & { pagination: Pagination }>();
};

// 클라이언트 사이드에서 통계 계산
export const calculatePhysicalLetterStats = (requests: PhysicalRequestResponse[]): PhysicalLetterStats => {
  const stats: PhysicalLetterStats = {
    total: requests.length,
    none: 0,
    requested: 0,
    writing: 0,
    sent: 0,
    delivered: 0,
  };

  requests.forEach((request) => {
    switch (request.physicalStatus) {
      case "requested":
        stats.requested++;
        break;
      case "writing":
        stats.writing++;
        break;
      case "sent":
        stats.sent++;
        break;
      case "delivered":
        stats.delivered++;
        break;
      default:
        // Handle any other status as requested
        stats.requested++;
        break;
    }
  });

  return stats;
};

// 날짜 범위로 필터링
export const filterByDateRange = (requests: PhysicalRequestResponse[], range: string): PhysicalRequestResponse[] => {
  if (range === "all") return requests;

  const now = new Date();
  let startDate: Date;

  switch (range) {
    case "7d":
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case "30d":
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case "90d":
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    default:
      return requests;
  }

  return requests.filter((request) => new Date(request.physicalRequestDate) >= startDate);
};

// 실물 편지 통계 조회 (기존 API 기반)
export const getPhysicalLetterStats = async (): Promise<ApiResponse<PhysicalLetterStats>> => {
  try {
    const response = await getPhysicalLetterRequests({ limit: 1000 }); // 모든 데이터 가져오기
    const stats = calculatePhysicalLetterStats(response.data);

    return {
      success: true,
      data: stats,
    };
  } catch (error) {
    console.error("Failed to fetch physical letter stats:", error);
    return {
      success: false,
      data: {
        total: 0,
        none: 0,
        requested: 0,
        writing: 0,
        sent: 0,
        delivered: 0,
      },
    };
  }
};

// 실물 편지 대시보드 데이터 조회 (기존 API 기반)
export const getPhysicalLetterDashboard = async (range: string = "7d"): Promise<ApiResponse<PhysicalLetterDashboard>> => {
  try {
    const response = await getPhysicalLetterRequests({ limit: 1000 });
    const filteredRequests = filterByDateRange(response.data, range);
    const stats = calculatePhysicalLetterStats(filteredRequests);

    // 최근 업데이트 (최근 10개)
    const recentUpdates = filteredRequests
      .sort((a, b) => new Date(b.physicalRequestDate).getTime() - new Date(a.physicalRequestDate).getTime())
      .slice(0, 10)
      .map((request) => ({
        _id: request.requestId,
        title: request.title,
        authorName: request.authorName,
        totalRequests: 1, // 개별 요청이므로 1
        currentStatus: request.physicalStatus,
        lastUpdatedAt: request.physicalRequestDate,
        adminNote: request.physicalNotes,
        createdAt: request.physicalRequestDate,
        updatedAt: request.physicalRequestDate,
      }));

    // 대기 중인 편지 (requested 상태)
    const pendingLetters = filteredRequests
      .filter((request) => request.physicalStatus === "requested")
      .slice(0, 10)
      .map((request) => ({
        _id: request.requestId,
        title: request.title,
        authorName: request.authorName,
        totalRequests: 1,
        currentStatus: "requested" as const,
        lastUpdatedAt: request.physicalRequestDate,
        adminNote: request.physicalNotes,
        createdAt: request.physicalRequestDate,
        updatedAt: request.physicalRequestDate,
      }));

    const dashboard: PhysicalLetterDashboard = {
      stats,
      recentUpdates,
      pendingLetters,
      processingTimeStats: {
        averageRequestToWriting: 2.5,
        averageWritingToSent: 3.0,
        averageSentToDelivered: 2.0,
      },
    };

    return {
      success: true,
      data: dashboard,
    };
  } catch (error) {
    console.error("Failed to fetch dashboard data:", error);
    throw error;
  }
};
