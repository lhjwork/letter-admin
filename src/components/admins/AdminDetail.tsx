import type { Admin } from "../../types";
import { ROLE_LABELS, ADMIN_STATUS_LABELS } from "../../utils/constants";
import { formatDateTime } from "../../utils/format";
import "./AdminDetail.scss";

interface AdminDetailProps {
  admin: Admin;
}

const PERMISSION_LABELS: Record<string, string> = {
  "users.read": "사용자 조회",
  "users.write": "사용자 수정",
  "users.delete": "사용자 삭제",
  "letters.read": "편지 조회",
  "letters.write": "편지 수정",
  "letters.delete": "편지 삭제",
  "admins.read": "관리자 조회",
  "admins.write": "관리자 수정",
  "admins.delete": "관리자 삭제",
  "dashboard.read": "대시보드 조회",
};

export default function AdminDetail({ admin }: AdminDetailProps) {
  return (
    <div className="admin-detail">
      <div className="admin-detail__row">
        <span className="admin-detail__label">이름</span>
        <span className="admin-detail__value">{admin.name}</span>
      </div>
      <div className="admin-detail__row">
        <span className="admin-detail__label">아이디</span>
        <span className="admin-detail__value">{admin.username}</span>
      </div>
      <div className="admin-detail__row">
        <span className="admin-detail__label">역할</span>
        <span className={`badge badge--${admin.role}`}>{ROLE_LABELS[admin.role]}</span>
      </div>
      <div className="admin-detail__row">
        <span className="admin-detail__label">부서</span>
        <span className="admin-detail__value">{admin.department || "-"}</span>
      </div>
      <div className="admin-detail__row">
        <span className="admin-detail__label">상태</span>
        <span className={`status status--${admin.status}`}>{ADMIN_STATUS_LABELS[admin.status]}</span>
      </div>
      <div className="admin-detail__row">
        <span className="admin-detail__label">권한</span>
        <div className="admin-detail__permissions">
          {admin.permissions.map((p) => (
            <span key={p} className="admin-detail__permission">
              {PERMISSION_LABELS[p] || p}
            </span>
          ))}
        </div>
      </div>
      <div className="admin-detail__row">
        <span className="admin-detail__label">마지막 로그인</span>
        <span className="admin-detail__value">{admin.lastLoginAt ? formatDateTime(admin.lastLoginAt) : "-"}</span>
      </div>
      <div className="admin-detail__row">
        <span className="admin-detail__label">생성일</span>
        <span className="admin-detail__value">{formatDateTime(admin.createdAt)}</span>
      </div>
    </div>
  );
}
