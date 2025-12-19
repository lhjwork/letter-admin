import { apiClient } from "./client";
import type { ApiResponse, DashboardStats } from "../types";

export const getDashboard = () => apiClient.get("admin/dashboard").json<ApiResponse<DashboardStats>>();
