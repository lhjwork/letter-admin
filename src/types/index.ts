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

// 실물 편지 상태 (단순화된 편지별 상태)
export type PhysicalLetterStatus = "none" | "requested" | "writing" | "sent" | "delivered";

// 실물 편지 요약 정보 (편지별 통합 상태)
export interface PhysicalLetterSummary {
  totalRequests: number;
  currentStatus: PhysicalLetterStatus;
  lastUpdatedAt?: string;
  adminNote?: string;
}

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
  // 실물 편지 관련 필드 (단순화)
  physicalLetter?: PhysicalLetterSummary;
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
  physicalLetters: PhysicalLetterStats;
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

// ===== 실물 편지 관련 (단순화된 편지 중심 관리) =====
// 편지별 실물 편지 관리 정보
export interface LetterPhysicalInfo {
  _id: string; // letterId
  requestId?: string; // 실물 편지 요청 ID (API 호출용)
  title: string;
  authorName: string;
  totalRequests: number;
  currentStatus: PhysicalLetterStatus;
  lastUpdatedAt?: string;
  adminNote?: string;
  createdAt: string;
  updatedAt: string;
}

// 실물 편지 통계 (단순화)
export interface PhysicalLetterStats {
  total: number;
  none: number;
  requested: number;
  writing: number;
  sent: number;
  delivered: number;
  totalRevenue?: number;
  averageProcessingTime?: number;
}

// 편지별 상태 변경 요청
export interface LetterStatusUpdateRequest {
  letterId: string;
  requestId?: string; // 실물 편지 요청 ID
  status: PhysicalLetterStatus;
  adminNote?: string;
}

// 일괄 상태 변경 요청
export interface BulkLetterStatusUpdateRequest {
  letterIds: string[];
  status: PhysicalLetterStatus;
  adminNote?: string;
}

// 편지 목록 조회 파라미터 (실물 편지 상태 포함)
export interface LetterQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: LetterType | "";
  category?: LetterCategory | "";
  status?: LetterStatus | "";
  physicalStatus?: PhysicalLetterStatus | ""; // 실물 편지 상태 필터 추가
  sort?: string;
  order?: "asc" | "desc";
}

// 실제 백엔드 API 응답 타입 (실물 편지 요청 목록)
export interface PhysicalRequestResponse {
  _id: string; // letterId
  title: string;
  authorName: string;
  physicalStatus: PhysicalLetterStatus;
  physicalRequestDate: string;
  createdAt: string;
  updatedAt: string;
  recipientName: string;
  recipientPhone: string;
  shippingAddress: {
    name: string;
    phone: string;
    zipCode: string;
    address1: string;
    address2: string;
    requestedAt: string;
  };
  physicalNotes: string;
  requestId: string;
}

// 편지별로 그룹화된 실물 편지 정보 (프론트엔드에서 사용)
export interface GroupedPhysicalLetter {
  _id: string; // letterId
  title: string;
  authorName: string;
  physicalStatus: PhysicalLetterStatus;
  createdAt: string;
  updatedAt: string;
  currentStatus: PhysicalLetterStatus;
  lastUpdatedAt?: string;
  adminNote?: string;
  recipients: {
    recipientName: string;
    recipientPhone: string;
    shippingAddress: {
      name: string;
      phone: string;
      zipCode: string;
      address1: string;
      address2: string;
      requestedAt: string;
    };
    physicalNotes: string;
    requestId: string;
    physicalRequestDate: string;
  }[];
}

// 실물 편지 대시보드 데이터
export interface PhysicalLetterDashboard {
  stats: PhysicalLetterStats;
  recentUpdates: LetterPhysicalInfo[];
  pendingLetters: LetterPhysicalInfo[];
  processingTimeStats: {
    averageRequestToWriting: number;
    averageWritingToSent: number;
    averageSentToDelivered: number;
  };
}
