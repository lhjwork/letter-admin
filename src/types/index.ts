// ===== Admin 관련 =====
export type AdminRole = "super_admin" | "admin" | "manager";
export type AdminStatus = "active" | "inactive";

export const PERMISSIONS = {
  USERS_READ: "users.read",
  USERS_WRITE: "users.write",
  USERS_DELETE: "users.delete",
  LETTERS_READ: "letters.read",
  LETTERS_WRITE: "letters.write",
  LETTERS_DELETE: "letters.delete",
  ADMINS_READ: "admins.read",
  ADMINS_WRITE: "admins.write",
  ADMINS_DELETE: "admins.delete",
  DASHBOARD_READ: "dashboard.read",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const ROLE_PERMISSIONS: Record<AdminRole, Permission[]> = {
  super_admin: Object.values(PERMISSIONS),
  admin: [PERMISSIONS.USERS_READ, PERMISSIONS.USERS_WRITE, PERMISSIONS.LETTERS_READ, PERMISSIONS.LETTERS_WRITE, PERMISSIONS.LETTERS_DELETE, PERMISSIONS.DASHBOARD_READ],
  manager: [PERMISSIONS.USERS_READ, PERMISSIONS.LETTERS_READ, PERMISSIONS.DASHBOARD_READ],
};

export interface Admin {
  _id: string;
  username: string;
  name: string;
  role: AdminRole;
  permissions: Permission[];
  department?: string;
  status: AdminStatus;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ===== User 관련 =====
export type UserStatus = "active" | "banned" | "deleted";

export interface OAuthAccount {
  provider: "instagram" | "naver" | "kakao";
  providerId: string;
}

export interface Address {
  _id: string;
  addressName: string;
  recipientName: string;
  zipCode: string;
  address: string;
  addressDetail?: string;
  phone: string;
  isDefault: boolean;
}

export interface User {
  _id: string;
  email: string;
  name: string;
  image?: string;
  status: UserStatus;
  oauthAccounts: OAuthAccount[];
  addresses: Address[];
  bannedAt?: string;
  bannedReason?: string;
  deletedAt?: string;
  createdAt: string;
  updatedAt: string;
  letterCount?: number;
  lastActiveAt?: string;
}

// 사용자 통계 정보
export interface UserStats {
  totalLetters: number;
  totalStories: number;
  totalViews: number;
  totalLikes: number;
  joinedAt: string;
  lastActiveAt?: string;
}

// 사용자 상세 정보 (통계 포함)
export interface UserDetail extends User {
  stats: UserStats;
}

// 사용자 편지 목록 응답
export interface UserLettersResponse {
  success: boolean;
  data: Letter[];
  pagination: Pagination;
}

// ===== Letter 관련 =====
export type LetterType = "story" | "letter";
export type LetterStatus = "created" | "published" | "hidden" | "deleted";
export type LetterCategory = "가족" | "사랑" | "우정" | "성장" | "위로" | "추억" | "감사" | "기타";

export interface Letter {
  _id: string;
  type: LetterType;
  userId?: string;
  title: string;
  content: string;
  authorName: string;
  category: LetterCategory;
  status: LetterStatus;
  viewCount: number;
  likeCount: number;
  hiddenAt?: string;
  hiddenReason?: string;
  deletedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ===== 대시보드 =====
export interface DashboardStats {
  users: {
    total: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
    byStatus: {
      active: number;
      banned: number;
      deleted: number;
    };
  };
  letters: {
    total: number;
    stories: number;
    letters: number;
    today: number;
    byStatus: {
      created: number;
      published: number;
      hidden: number;
    };
  };
  categories: { name: string; count: number }[];
  recentUsers: User[];
  recentLetters: Letter[];
}

// ===== 공통 =====
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: Pagination;
}

export interface AdminQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: AdminRole | "";
  status?: AdminStatus | "";
  department?: string;
}

export interface UserQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: UserStatus | "";
  sort?: string;
  order?: "asc" | "desc";
}

export interface LetterQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: LetterType | "";
  category?: LetterCategory | "";
  status?: LetterStatus | "";
  sort?: string;
  order?: "asc" | "desc";
}

// ===== 실물 편지 관련 =====
export type PhysicalLetterStatus = "requested" | "confirmed" | "processing" | "writing" | "sent" | "delivered" | "failed" | "cancelled";

export interface ShippingAddress {
  name: string;
  phone: string;
  zipCode: string;
  address1: string;
  address2?: string;
  requestedAt: string;
}

export interface RecipientInfo {
  name: string;
  phone: string;
  zipCode: string;
  address1: string;
  address2?: string;
  memo?: string;
}

export interface ShippingInfo {
  trackingNumber?: string;
  shippingCompany?: string;
  estimatedDelivery?: string;
  actualDelivery?: string;
  shippingCost?: number;
}

export interface PhysicalLetterRequest {
  _id: string;
  letterId:
    | string
    | {
        _id: string;
        title?: string;
        ogTitle?: string;
        content?: string;
      };
  title: string;
  physicalStatus: PhysicalLetterStatus;
  physicalRequestDate: string;
  shippingAddress: ShippingAddress;
  recipientInfo: RecipientInfo;
  shippingInfo?: ShippingInfo;
  totalCost?: number;
  letterCost?: number;
  shippingCost?: number;
  physicalNotes?: string;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PhysicalLetterStats {
  total: number;
  requested: number;
  confirmed: number;
  processing: number;
  writing: number;
  sent: number;
  delivered: number;
  failed: number;
  cancelled: number;
  totalRevenue?: number;
  averageProcessingTime?: number;
}

export interface DashboardStats extends PhysicalLetterStats {
  pendingRequests: number;
  inProgressRequests: number;
  completedRequests: number;
  todayRequests: number;
  thisWeekRequests: number;
  thisMonthRequests: number;
}

export interface BulkActionRequest {
  requestIds: string[];
  action: "confirm" | "writing" | "sent" | "cancel" | "updateShipping";
  data?: any;
}

export interface StatisticsData {
  statusDistribution: { status: string; count: number; percentage: number }[];
  dailyRequests: { date: string; count: number }[];
  regionDistribution: { region: string; count: number }[];
  revenue: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    growth: number;
  };
  averageProcessingTime?: number;
  topPerformingLetters?: Array<{
    letterId: string;
    title: string;
    requestCount: number;
    conversionRate: number;
  }>;
}

export interface PhysicalLetterQueryParams {
  page?: number;
  limit?: number;
  status?: PhysicalLetterStatus | "";
  search?: string;
  sort?: string;
  order?: "asc" | "desc";
  dateFrom?: string;
  dateTo?: string;
  region?: string;
}
