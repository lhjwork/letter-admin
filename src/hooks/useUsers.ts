import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as usersApi from "../api/users";
import type { UserQueryParams } from "../types";

export const useUsers = (params: UserQueryParams) => {
  return useQuery({
    queryKey: ["admin", "users", params],
    queryFn: () => usersApi.getUsers(params),
  });
};

export const useUser = (id: string) => {
  return useQuery({
    queryKey: ["admin", "users", id],
    queryFn: () => usersApi.getUserById(id),
    enabled: !!id,
  });
};

export const useUserDetail = (id: string) => {
  return useQuery({
    queryKey: ["admin", "users", id, "detail"],
    queryFn: () => usersApi.getUserDetail(id),
    enabled: !!id,
  });
};

export const useUserStats = (id: string) => {
  return useQuery({
    queryKey: ["admin", "users", id, "stats"],
    queryFn: () => usersApi.getUserStats(id),
    enabled: !!id,
  });
};

export const useUserLetters = (id: string, params: { page?: number; limit?: number; status?: string }) => {
  return useQuery({
    queryKey: ["admin", "users", id, "letters", params],
    queryFn: () => usersApi.getUserLetters(id, params),
    enabled: !!id,
  });
};

export const useSearchUsers = (query: string, params: { limit?: number; status?: string } = {}) => {
  return useQuery({
    queryKey: ["admin", "users", "search", query, params],
    queryFn: () => usersApi.searchUsers(query, params),
    enabled: query.length > 0,
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof usersApi.updateUser>[1] }) => usersApi.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
};

export const useBanUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => usersApi.banUser(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
};

export const useUnbanUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => usersApi.unbanUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => usersApi.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
};
