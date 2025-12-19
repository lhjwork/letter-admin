export const ROLE_LABELS: Record<string, string> = {
  super_admin: "최고 관리자",
  admin: "관리자",
  manager: "매니저",
};

export const USER_STATUS_LABELS: Record<string, string> = {
  active: "활성",
  banned: "정지",
  deleted: "삭제됨",
};

export const LETTER_STATUS_LABELS: Record<string, string> = {
  created: "작성됨",
  published: "공개",
  hidden: "숨김",
  deleted: "삭제됨",
};

export const LETTER_TYPE_LABELS: Record<string, string> = {
  story: "사연",
  letter: "편지",
};

export const ADMIN_STATUS_LABELS: Record<string, string> = {
  active: "활성",
  inactive: "비활성",
};

export const CATEGORY_OPTIONS = [
  { value: "", label: "전체 카테고리" },
  { value: "가족", label: "가족" },
  { value: "사랑", label: "사랑" },
  { value: "우정", label: "우정" },
  { value: "성장", label: "성장" },
  { value: "위로", label: "위로" },
  { value: "추억", label: "추억" },
  { value: "감사", label: "감사" },
  { value: "기타", label: "기타" },
];
