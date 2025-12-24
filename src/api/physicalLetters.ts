import { apiClient } from "./client";
import type { ApiResponse, PhysicalLetterRequest, PhysicalLetterStats, DashboardStats, StatisticsData, BulkActionRequest, PhysicalLetterQueryParams, Pagination } from "../types";

export const getPhysicalLetters = (params: PhysicalLetterQueryParams) => {
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

  if (params.dateFrom) {
    searchParams.dateFrom = params.dateFrom;
  }

  if (params.dateTo) {
    searchParams.dateTo = params.dateTo;
  }

  if (params.region) {
    searchParams.region = params.region;
  }

  return apiClient.get("admin/physical-requests", { searchParams }).json<ApiResponse<PhysicalLetterRequest[]> & { pagination: Pagination }>();
};

export const getPhysicalLetterById = (id: string) => apiClient.get(`admin/physical-requests/${id}`).json<ApiResponse<PhysicalLetterRequest>>();

export const getPhysicalLetterStats = () => apiClient.get("admin/physical-requests/stats").json<ApiResponse<PhysicalLetterStats>>();

export const getDashboardStats = () => apiClient.get("admin/dashboard/stats").json<ApiResponse<DashboardStats>>();

export const getStatistics = (params: { start: string; end: string }) => {
  const searchParams: Record<string, string> = {
    start: params.start,
    end: params.end,
  };

  return apiClient.get("admin/statistics", { searchParams }).json<ApiResponse<StatisticsData>>();
};

export const updatePhysicalLetterStatus = (id: string, data: { status: string; notes?: string }) =>
  apiClient.patch(`admin/physical-requests/${id}`, { json: data }).json<ApiResponse<PhysicalLetterRequest>>();

export const updateShippingInfo = (
  id: string,
  data: {
    trackingNumber: string;
    shippingCompany: string;
    estimatedDelivery?: string;
    adminNotes?: string;
  }
) => apiClient.patch(`admin/physical-requests/${id}/shipping`, { json: data }).json<ApiResponse<PhysicalLetterRequest>>();

export const bulkUpdateRequests = (data: BulkActionRequest) => apiClient.post("admin/physical-requests/bulk", { json: data }).json<ApiResponse<{ updated: number; failed: string[] }>>();

export const exportPhysicalLetters = (params: PhysicalLetterQueryParams) => {
  const searchParams: Record<string, string> = {};

  if (params.search) {
    searchParams.search = params.search;
  }

  if (params.status) {
    searchParams.status = params.status;
  }

  if (params.dateFrom) {
    searchParams.dateFrom = params.dateFrom;
  }

  if (params.dateTo) {
    searchParams.dateTo = params.dateTo;
  }

  return apiClient.get("admin/physical-requests/export", { searchParams }).json<ApiResponse<PhysicalLetterRequest[]>>();
};

// Dashboard specific API for cumulative system
export const getDashboardData = (range: string = "7d") => {
  const searchParams: Record<string, string> = { range };
  return apiClient.get("admin/physical-letters/dashboard", { searchParams }).json<
    ApiResponse<{
      totalRequests: number;
      pendingRequests: number;
      completedRequests: number;
      totalRevenue: number;
      popularLetters: Array<{
        letterId: string;
        title: string;
        requestCount: number;
        totalRevenue: number;
      }>;
      recentRequests: Array<{
        id: string;
        letterId: string;
        letterTitle: string;
        recipientName: string;
        status: string;
        cost: number;
        createdAt: string;
      }>;
    }>
  >();
};

// Analytics API
export const getAnalyticsData = () =>
  apiClient.get("admin/physical-letters/analytics").json<
    ApiResponse<{
      dailyStats: Array<{
        date: string;
        requests: number;
        revenue: number;
      }>;
      regionStats: Array<{
        region: string;
        count: number;
        percentage: number;
      }>;
      statusDistribution: Array<{
        status: string;
        count: number;
        percentage: number;
      }>;
      averageProcessingTime: number;
      topPerformingLetters: Array<{
        letterId: string;
        title: string;
        requestCount: number;
        conversionRate: number;
      }>;
    }>
  >();
