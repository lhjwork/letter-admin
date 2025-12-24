import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as physicalLettersApi from "../api/physicalLetters";
import type { PhysicalLetterQueryParams, BulkActionRequest } from "../types";

export const usePhysicalLetters = (params: PhysicalLetterQueryParams) => {
  return useQuery({
    queryKey: ["admin", "physical-letters", params],
    queryFn: () => physicalLettersApi.getPhysicalLetters(params),
  });
};

export const usePhysicalLetter = (id: string) => {
  return useQuery({
    queryKey: ["admin", "physical-letters", id],
    queryFn: () => physicalLettersApi.getPhysicalLetterById(id),
    enabled: !!id,
  });
};

export const usePhysicalLetterStats = () => {
  return useQuery({
    queryKey: ["admin", "physical-letters", "stats"],
    queryFn: () => physicalLettersApi.getPhysicalLetterStats(),
  });
};

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ["admin", "dashboard", "stats"],
    queryFn: () => physicalLettersApi.getDashboardStats(),
    refetchInterval: 30000, // 30초마다 자동 새로고침
  });
};

export const useStatistics = (params: { start: string; end: string }) => {
  return useQuery({
    queryKey: ["admin", "statistics", params],
    queryFn: () => physicalLettersApi.getStatistics(params),
    enabled: !!params.start && !!params.end,
  });
};

export const useUpdatePhysicalLetterStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { status: string; notes?: string } }) => physicalLettersApi.updatePhysicalLetterStatus(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "physical-letters"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    },
  });
};

export const useUpdateShippingInfo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: {
        trackingNumber: string;
        shippingCompany: string;
        estimatedDelivery?: string;
        adminNotes?: string;
      };
    }) => physicalLettersApi.updateShippingInfo(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "physical-letters"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    },
  });
};

export const useBulkUpdateRequests = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BulkActionRequest) => physicalLettersApi.bulkUpdateRequests(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "physical-letters"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    },
  });
};

export const useExportPhysicalLetters = () => {
  return useMutation({
    mutationFn: (params: PhysicalLetterQueryParams) => physicalLettersApi.exportPhysicalLetters(params),
  });
};

// New hooks for cumulative system
export const useDashboardData = (range: string = "7d") => {
  return useQuery({
    queryKey: ["admin", "physical-letters", "dashboard", range],
    queryFn: () => physicalLettersApi.getDashboardData(range),
    refetchInterval: 30000, // 30초마다 자동 새로고침
  });
};

export const useAnalyticsData = () => {
  return useQuery({
    queryKey: ["admin", "physical-letters", "analytics"],
    queryFn: () => physicalLettersApi.getAnalyticsData(),
  });
};
