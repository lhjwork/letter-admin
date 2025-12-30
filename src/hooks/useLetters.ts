import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as lettersApi from "../api/letters";
import type { LetterQueryParams, LetterStatus, LetterStatusUpdateRequest, BulkLetterStatusUpdateRequest } from "../types";

export const useLetters = (params: LetterQueryParams) => {
  return useQuery({
    queryKey: ["admin", "letters", params],
    queryFn: () => lettersApi.getLetters(params),
  });
};

export const useLetter = (id: string) => {
  return useQuery({
    queryKey: ["admin", "letters", id],
    queryFn: () => lettersApi.getLetterById(id),
    enabled: !!id,
  });
};

export const useUpdateLetter = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof lettersApi.updateLetter>[1] }) => lettersApi.updateLetter(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "letters"] });
    },
  });
};

export const useUpdateLetterStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status, reason }: { id: string; status: LetterStatus; reason?: string }) => lettersApi.updateLetterStatus(id, status, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "letters"] });
    },
  });
};

export const useDeleteLetter = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => lettersApi.deleteLetter(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "letters"] });
    },
  });
};

// 실물 편지 상태 관리 훅들
export const useLettersWithPhysicalStatus = (params: LetterQueryParams) => {
  return useQuery({
    queryKey: ["admin", "letters", "physical", params],
    queryFn: () => lettersApi.getLettersWithPhysicalStatus(params),
  });
};

export const useUpdateLetterPhysicalStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LetterStatusUpdateRequest) => lettersApi.updateLetterPhysicalStatus(data),
    onSuccess: async (_, variables) => {
      console.log("✅ Status update successful, refreshing cache...");

      // 모든 관련 쿼리 무효화
      await queryClient.invalidateQueries({ queryKey: ["admin", "letters"] });
      await queryClient.invalidateQueries({ queryKey: ["admin", "physical-letters"] });

      // 상태 검증
      try {
        const verification = await lettersApi.verifyLetterStatus(variables.letterId);
        if (verification.length === 0) {
          console.warn("⚠️ No physical requests found after update");
        } else {
          const hasMatchingStatus = verification.some((req: any) => req.status === variables.status || req.physicalStatus === variables.status);
          if (!hasMatchingStatus) {
            console.warn(`⚠️ Status mismatch: expected ${variables.status}, but found:`, verification);
          } else {
            console.log("✅ Status verification successful");
          }
        }
      } catch (error) {
        console.error("❌ Status verification failed:", error);
      }
    },
    onError: (error) => {
      console.error("❌ Status update failed:", error);
    },
  });
};

export const useBulkUpdateLetterPhysicalStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BulkLetterStatusUpdateRequest) => lettersApi.bulkUpdateLetterPhysicalStatus(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "letters"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "physical-letters"] });
    },
  });
};
