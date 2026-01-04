import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as adsApi from "../api/ads";
import type { AdQueryParams, CreateAdRequest, UpdateAdRequest } from "../types/ads";

export const useAds = (params: AdQueryParams) => {
  return useQuery({
    queryKey: ["admin", "ads", params],
    queryFn: () => adsApi.getAds(params),
  });
};

export const useAd = (id: string) => {
  return useQuery({
    queryKey: ["admin", "ads", id],
    queryFn: () => adsApi.getAdById(id),
    enabled: !!id,
  });
};

export const useAdStats = (id: string, params?: { startDate?: string; endDate?: string }) => {
  return useQuery({
    queryKey: ["admin", "ads", id, "stats", params],
    queryFn: () => adsApi.getAdStats(id, params),
    enabled: !!id,
  });
};

export const useCreateAd = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAdRequest) => adsApi.createAd(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "ads"] });
    },
  });
};

export const useUpdateAd = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAdRequest }) => adsApi.updateAd(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "ads"] });
    },
  });
};

export const useDeleteAd = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adsApi.deleteAd(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "ads"] });
    },
  });
};

export const useLinkLetter = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ adId, letterId, letterType }: { adId: string; letterId: string; letterType: string }) =>
      adsApi.linkLetterToAd(adId, letterId, letterType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "ads"] });
    },
  });
};

export const useUnlinkLetter = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ adId, letterId }: { adId: string; letterId: string }) =>
      adsApi.unlinkLetterFromAd(adId, letterId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "ads"] });
    },
  });
};

export const useUpdateDisplayControl = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ adId, displayControl }: { adId: string; displayControl: any }) =>
      adsApi.updateDisplayControl(adId, displayControl),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "ads"] });
    },
  });
};

export const useDisplayableAds = (params?: { placement?: string; limit?: number; theme?: string }) => {
  return useQuery({
    queryKey: ["admin", "ads", "displayable", params],
    queryFn: () => adsApi.getDisplayableAds(params),
  });
};

export const useCarouselAds = (params?: { 
  placement?: "home" | "stories" | "letters"; 
  limit?: number; 
  aspectRatio?: "16:9" | "21:9" | "4:3";
  deviceType?: "mobile" | "tablet" | "desktop";
  autoPlay?: boolean;
}) => {
  return useQuery({
    queryKey: ["admin", "ads", "carousel", params],
    queryFn: () => adsApi.getCarouselAds(params),
    staleTime: 5 * 60 * 1000, // 5분
    refetchInterval: 10 * 60 * 1000, // 10분마다 자동 갱신
  });
};
