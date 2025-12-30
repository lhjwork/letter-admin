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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "letters"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "physical-letters"] });
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
