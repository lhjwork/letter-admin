import { useState } from "react";
import type { Admin, AdminRole, Permission } from "../../types";
import { PERMISSIONS, ROLE_PERMISSIONS } from "../../types";
import Button from "../common/Button";
import Input from "../common/Input";
import Select from "../common/Select";
import "./AdminForm.scss";

interface AdminFormProps {
  admin?: Admin;
  onSubmit: (data: AdminFormData) => void;
  onCancel: () => void;
  loading?: boolean;
  isEdit?: boolean;
}

export interface AdminFormData {
  username?: string;
  password?: string;
  name: string;
  role: AdminRole;
  permissions: Permission[];
  department: string;
  status?: "active" | "inactive";
}

const ROLE_OPTIONS = [
  { value: "manager", label: "매니저" },
  { value: "admin", label: "관리자" },
  { value: "super_admin", label: "최고 관리자" },
];

const STATUS_OPTIONS = [
  { value: "active", label: "활성" },
  { value: "inactive", label: "비활성" },
];

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

export default function AdminForm({ admin, onSubmit, onCancel, loading, isEdit }: AdminFormProps) {
  const [formData, setFormData] = useState<AdminFormData>({
    username: admin?.username || "",
    password: "",
    name: admin?.name || "",
    role: admin?.role || "manager",
    permissions: admin?.permissions || [],
    department: admin?.department || "",
    status: admin?.status || "active",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const rolePermissions = ROLE_PERMISSIONS[formData.role];
  const additionalPermissions = Object.values(PERMISSIONS).filter((p) => !rolePermissions.includes(p));

  const togglePermission = (permission: Permission) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permission) ? prev.permissions.filter((p) => p !== permission) : [...prev.permissions, permission],
    }));
  };

  return (
    <form className="admin-form" onSubmit={handleSubmit}>
      {!isEdit && (
        <>
          <Input label="아이디" type="text" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} placeholder="letter-admin" required />
          <Input label="비밀번호" type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required={!isEdit} />
        </>
      )}
      <Input label="이름" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
      <Select label="역할" options={ROLE_OPTIONS} value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value as AdminRole, permissions: [] })} />
      <Input label="부서" value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} />
      {isEdit && <Select label="상태" options={STATUS_OPTIONS} value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as "active" | "inactive" })} />}

      <div className="admin-form__permissions">
        <label className="admin-form__label">기본 권한 (역할 기반)</label>
        <div className="admin-form__permission-list">
          {rolePermissions.map((p) => (
            <span key={p} className="admin-form__permission admin-form__permission--default">
              {PERMISSION_LABELS[p]}
            </span>
          ))}
        </div>
      </div>

      {additionalPermissions.length > 0 && (
        <div className="admin-form__permissions">
          <label className="admin-form__label">추가 권한</label>
          <div className="admin-form__permission-list">
            {additionalPermissions.map((p) => (
              <label key={p} className="admin-form__permission-checkbox">
                <input type="checkbox" checked={formData.permissions.includes(p)} onChange={() => togglePermission(p)} />
                {PERMISSION_LABELS[p]}
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="admin-form__actions">
        <Button type="button" variant="secondary" onClick={onCancel}>
          취소
        </Button>
        <Button type="submit" loading={loading}>
          {isEdit ? "수정" : "생성"}
        </Button>
      </div>
    </form>
  );
}
