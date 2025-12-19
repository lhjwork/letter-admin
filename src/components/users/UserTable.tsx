import { useNavigate } from "react-router-dom";
import type { User } from "../../types";
import Table from "../common/Table";
import { USER_STATUS_LABELS } from "../../utils/constants";
import { formatDate } from "../../utils/format";
import "./UserTable.scss";

interface UserTableProps {
  users: User[];
  loading?: boolean;
}

export default function UserTable({ users, loading }: UserTableProps) {
  const navigate = useNavigate();

  const columns = [
    {
      key: "name",
      header: "이름",
      render: (user: User) => (
        <div className="user-cell">
          <div className="user-cell__avatar">{user.image ? <img src={user.image} alt={user.name} /> : <span>{user.name.charAt(0)}</span>}</div>
          <span>{user.name}</span>
        </div>
      ),
    },
    { key: "email", header: "이메일" },
    {
      key: "oauthAccounts",
      header: "연동 계정",
      render: (user: User) => user.oauthAccounts.map((acc) => acc.provider).join(", ") || "-",
    },
    {
      key: "status",
      header: "상태",
      render: (user: User) => <span className={`user-status user-status--${user.status}`}>{USER_STATUS_LABELS[user.status]}</span>,
    },
    { key: "createdAt", header: "가입일", render: (user: User) => formatDate(user.createdAt) },
  ];

  return <Table columns={columns} data={users} keyExtractor={(user) => user._id} onRowClick={(user) => navigate(`/users/${user._id}`)} loading={loading} emptyMessage="사용자가 없습니다" />;
}
