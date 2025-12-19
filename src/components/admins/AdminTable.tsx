import { useNavigate } from "react-router-dom";
import type { Admin } from "../../types";
import Table from "../common/Table";
import { ROLE_LABELS, ADMIN_STATUS_LABELS } from "../../utils/constants";
import { formatDate } from "../../utils/format";

interface AdminTableProps {
  admins: Admin[];
  loading?: boolean;
}

export default function AdminTable({ admins, loading }: AdminTableProps) {
  const navigate = useNavigate();

  const columns = [
    { key: "name", header: "이름" },
    { key: "username", header: "아이디" },
    {
      key: "role",
      header: "역할",
      render: (admin: Admin) => <span className={`badge badge--${admin.role}`}>{ROLE_LABELS[admin.role]}</span>,
    },
    { key: "department", header: "부서", render: (admin: Admin) => admin.department || "-" },
    {
      key: "status",
      header: "상태",
      render: (admin: Admin) => <span className={`status status--${admin.status}`}>{ADMIN_STATUS_LABELS[admin.status]}</span>,
    },
    {
      key: "lastLoginAt",
      header: "마지막 로그인",
      render: (admin: Admin) => (admin.lastLoginAt ? formatDate(admin.lastLoginAt) : "-"),
    },
    { key: "createdAt", header: "생성일", render: (admin: Admin) => formatDate(admin.createdAt) },
  ];

  return <Table columns={columns} data={admins} keyExtractor={(admin) => admin._id} onRowClick={(admin) => navigate(`/admins/${admin._id}`)} loading={loading} emptyMessage="관리자가 없습니다" />;
}
