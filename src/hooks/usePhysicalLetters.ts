import { useQuery } from "@tanstack/react-query";
import * as physicalLettersApi from "../api/physicalLetters";

export const usePhysicalLetterStats = () => {
  return useQuery({
    queryKey: ["admin", "physical-letters", "stats"],
    queryFn: () => physicalLettersApi.getPhysicalLetterStats(),
  });
};

export const usePhysicalLetterDashboard = (range: string = "7d") => {
  return useQuery({
    queryKey: ["admin", "physical-letters", "dashboard", range],
    queryFn: () => physicalLettersApi.getPhysicalLetterDashboard(range),
    refetchInterval: 30000, // 30초마다 자동 새로고침
  });
};

// 기존 API를 사용한 실물 편지 요청 목록 조회
export const usePhysicalLetterRequests = (
  params: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  } = {}
) => {
  return useQuery({
    queryKey: ["admin", "physical-requests", params],
    queryFn: () => physicalLettersApi.getPhysicalLetterRequests(params),
  });
};

// Legacy aliases for backward compatibility
export const useStatistics = usePhysicalLetterStats;
export const useDashboardStats = usePhysicalLetterDashboard;
export const usePhysicalLetters = usePhysicalLetterRequests;

// Placeholder hooks for missing functionality
export const useUpdatePhysicalLetterStatus = () => {
  return {
    mutate: () => console.warn("useUpdatePhysicalLetterStatus not implemented"),
    isLoading: false,
  };
};

export const useUpdateShippingInfo = () => {
  return {
    mutate: () => console.warn("useUpdateShippingInfo not implemented"),
    isLoading: false,
  };
};
