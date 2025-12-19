import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAdmins, getAdminById, createAdmin, updateAdmin, deleteAdmin } from "../api/admins";
import type { AdminQueryParams, AdminRole, Permission } from "../types";

export const useAdmins = (params: AdminQueryParams) => {
  return useQuery({
    queryKey: ["admins", params],
    queryFn: () => getAdmins(params),
  });
};

export const useAdmin = (id: string) => {
  return useQuery({
    queryKey: ["admins", id],
    queryFn: () => getAdminById(id),
    enabled: !!id,
  });
};

export const useCreateAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { username: string; password: string; name: string; role?: AdminRole; permissions?: Permission[]; department?: string }) => createAdmin(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admins"] });
    },
  });
};

export const useUpdateAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateAdmin>[1] }) => updateAdmin(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admins"] });
    },
  });
};

export const useDeleteAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteAdmin(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admins"] });
    },
  });
};
