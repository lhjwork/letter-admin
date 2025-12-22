import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUsers } from "../hooks/useUsers";
import type { UserQueryParams, User } from "../types";
import UserTable from "../components/users/UserTable";
import UserFilter from "../components/users/UserFilter";
import UserSearch from "../components/users/UserSearch";
import Pagination from "../components/common/Pagination";
import "./Users.scss";

export default function Users() {
  const navigate = useNavigate();
  const [params, setParams] = useState<UserQueryParams>({
    page: 1,
    limit: 10,
    search: "",
    status: "",
    sort: "createdAt",
    order: "desc",
  });
  const [showQuickSearch, setShowQuickSearch] = useState(false);

  const { data, isLoading } = useUsers(params);

  const handleQuickSearchSelect = (user: User) => {
    navigate(`/users/${user._id}`);
  };

  return (
    <div className="users">
      <div className="users__header">
        <h1 className="users__title">사용자 관리</h1>
        <div className="users__quick-search">
          <button className="users__quick-search-toggle" onClick={() => setShowQuickSearch(!showQuickSearch)}>
            🔍 빠른 검색
          </button>
          {showQuickSearch && (
            <div className="users__quick-search-dropdown">
              <UserSearch onSelectUser={handleQuickSearchSelect} placeholder="사용자 이름 또는 이메일 검색..." className="users__quick-search-component" />
            </div>
          )}
        </div>
      </div>

      <UserFilter params={params} onChange={setParams} />

      <UserTable users={data?.data || []} loading={isLoading} />

      {data?.pagination && <Pagination page={data.pagination.page} totalPages={data.pagination.totalPages} onPageChange={(page) => setParams({ ...params, page })} />}
    </div>
  );
}
