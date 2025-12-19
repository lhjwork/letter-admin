import { apiClient } from "./client";
import type { ApiResponse, Admin } from "../types";
import CryptoJS from "crypto-js";

interface LoginResponse {
  admin: Admin;
  token: string;
}

interface EncryptionKeyResponse {
  encryptionKey: string;
}

// AES 암호화 키 조회
export const getEncryptionKey = () => apiClient.get("admin/auth/encryption-key").json<ApiResponse<EncryptionKeyResponse>>();

// AES 암호화 함수
export const encryptPassword = async (password: string): Promise<string> => {
  const response = await getEncryptionKey();
  const encrypted = CryptoJS.AES.encrypt(password, response.data.encryptionKey).toString();
  return encrypted;
};

// 로그인 (AES 암호화 적용)
export const login = async (username: string, password: string) => {
  const encryptedPassword = await encryptPassword(password);
  return apiClient
    .post("admin/auth/login", {
      json: { username, password: encryptedPassword, encrypted: true },
    })
    .json<ApiResponse<LoginResponse>>();
};

export const logout = () => apiClient.post("admin/auth/logout").json<ApiResponse<null>>();

export const getMe = () => apiClient.get("admin/auth/me").json<ApiResponse<Admin>>();

// 비밀번호 변경 (AES 암호화 적용)
export const changePassword = async (currentPassword: string, newPassword: string) => {
  const [encryptedCurrent, encryptedNew] = await Promise.all([encryptPassword(currentPassword), encryptPassword(newPassword)]);
  return apiClient
    .put("admin/auth/password", {
      json: {
        currentPassword: encryptedCurrent,
        newPassword: encryptedNew,
        encrypted: true,
      },
    })
    .json<ApiResponse<null>>();
};
