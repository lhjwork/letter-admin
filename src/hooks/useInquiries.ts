import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "../api/inquiries";
import type { InquiryStatus } from "../types";

const KEY = ["admin", "inquiries"];

export const useInquiries = (page: number, status: InquiryStatus | "") => useQuery({ queryKey: [...KEY, page, status], queryFn: () => api.getInquiries(page, status) });

export const useInquiry = (id: string) => useQuery({ queryKey: [...KEY, "one", id], queryFn: () => api.getInquiry(id), enabled: !!id });

export const useAnswerInquiry = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, answer }: { id: string; answer: string }) => api.answerInquiry(id, answer), onSuccess: () => qc.invalidateQueries({ queryKey: KEY }) });
};
