import { apiClient } from "./client";
import type { ApiResponse, Pagination } from "../types";
import type { Ad, AdDetail, AdStatsResponse, AdQueryParams, CreateAdRequest, UpdateAdRequest, DisplayControl } from "../types/ads";

export const getAds = (params: AdQueryParams) => {
  const searchParams: Record<string, string> = {};
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      searchParams[key] = value.toString();
    }
  });
  return apiClient.get("ads", { searchParams }).json<ApiResponse<Ad[]> & { pagination: Pagination }>();
};

export const getAdById = (id: string) => 
  apiClient.get(`ads/detail/${id}`).json<ApiResponse<AdDetail>>();

export const createAd = (data: CreateAdRequest) =>
  apiClient.post("ads", { json: data }).json<ApiResponse<Ad>>();

export const updateAd = (id: string, data: UpdateAdRequest) =>
  apiClient.put(`ads/${id}`, { json: data }).json<ApiResponse<Ad>>();

export const deleteAd = (id: string) =>
  apiClient.delete(`ads/${id}`).json<ApiResponse<null>>();

export const getAdStats = (id: string, params?: { startDate?: string; endDate?: string }) => {
  const searchParams: Record<string, string> = {};
  if (params?.startDate) searchParams.startDate = params.startDate;
  if (params?.endDate) searchParams.endDate = params.endDate;
  return apiClient.get(`ads/${id}/stats`, { searchParams }).json<ApiResponse<AdStatsResponse>>();
};

export const linkLetterToAd = (adId: string, letterId: string, letterType: string) =>
  apiClient.post(`ads/${adId}/link-letter`, { json: { letterId, letterType } }).json<ApiResponse<Ad>>();

export const unlinkLetterFromAd = (adId: string, letterId: string) =>
  apiClient.delete(`ads/${adId}/unlink-letter/${letterId}`).json<ApiResponse<Ad>>();

export const updateDisplayControl = (adId: string, displayControl: DisplayControl) =>
  apiClient.put(`ads/${adId}/display-control`, { json: displayControl }).json<ApiResponse<Ad>>();

export const getDisplayableAds = (params?: { placement?: string; limit?: number; theme?: string }) => {
  const searchParams: Record<string, string> = {};
  if (params?.placement) searchParams.placement = params.placement;
  if (params?.limit) searchParams.limit = params.limit.toString();
  if (params?.theme) searchParams.theme = params.theme;
  return apiClient.get("ads/displayable", { searchParams }).json<ApiResponse<Ad[]>>();
};

export const getCarouselAds = (params?: { 
  placement?: "home" | "stories" | "letters"; 
  limit?: number; 
  aspectRatio?: "16:9" | "21:9" | "4:3";
  deviceType?: "mobile" | "tablet" | "desktop";
  autoPlay?: boolean;
}) => {
  const searchParams: Record<string, string> = {};
  if (params?.placement) searchParams.placement = params.placement;
  if (params?.limit) searchParams.limit = params.limit.toString();
  if (params?.aspectRatio) searchParams.aspectRatio = params.aspectRatio;
  if (params?.deviceType) searchParams.deviceType = params.deviceType;
  if (params?.autoPlay !== undefined) searchParams.autoPlay = params.autoPlay.toString();
  return apiClient.get("ads/carousel", { searchParams }).json<ApiResponse<Ad[]>>();
};
