import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "../api/announcements";
import type { AnnouncementInput } from "../types";

const KEY = ["admin", "announcements"];

export const useAnnouncements = (page: number) => useQuery({ queryKey: [...KEY, page], queryFn: () => api.getAnnouncements(page) });

export const useAnnouncement = (id: string | null) => useQuery({ queryKey: [...KEY, "one", id], queryFn: () => api.getAnnouncement(id!), enabled: !!id });

export const useSaveAnnouncement = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id?: string; data: AnnouncementInput }) => (id ? api.updateAnnouncement(id, data) : api.createAnnouncement(data)),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
};

export const useDeleteAnnouncement = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: api.deleteAnnouncement, onSuccess: () => qc.invalidateQueries({ queryKey: KEY }) });
};
