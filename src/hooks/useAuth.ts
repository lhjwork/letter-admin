import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import * as authApi from "../api/auth";
import { useAuthStore } from "../stores/authStore";

export const useLogin = () => {
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: ({ username, password }: { username: string; password: string }) => authApi.login(username, password),
    onSuccess: (response) => {
      if (response.success) {
        setAuth(response.data.token, response.data.admin);
        navigate("/dashboard");
      }
    },
  });
};

export const useLogout = () => {
  const { logout } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.logout,
    onSettled: () => {
      logout();
      queryClient.clear();
    },
  });
};

export const useMe = () => {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: ["admin", "me"],
    queryFn: authApi.getMe,
    enabled: isAuthenticated,
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) => authApi.changePassword(currentPassword, newPassword),
  });
};
