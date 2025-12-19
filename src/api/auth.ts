import { apiClient } from "./client";
import type { ApiResponse, Admin } from "../types";
import JSEncrypt from "jsencrypt";

interface LoginResponse {
  admin: Admin;
  token: string;
}

interface PublicKeyResponse {
  publicKey: string;
}

// RSA 공개키 조회
export const getPublicKey = () => apiClient.get("admin/auth/public-key").json<ApiResponse<PublicKeyResponse>>();

// RSA 암호화 함수
export const encryptPassword = async (password: string): Promise<string> => {
  const response = await getPublicKey();
  const encrypt = new JSEncrypt();
  encrypt.setPublicKey(response.data.publicKey);
  const encrypted = encrypt.encrypt(password);
  if (!encrypted) {
    throw new Error("비밀번호 암호화에 실패했습니다");
  }
  return encrypted;
};

// 로그인 (RSA 암호화 적용)
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

// 비밀번호 변경 (RSA 암호화 적용)
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
