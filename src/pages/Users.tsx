import { useState } from "react";
import { useUsers } from "../hooks/useUsers";
import type { UserQueryParams } from "../types";
import UserTable from "../components/users/UserTable";
import UserFilter from "../components/users/UserFilter";
import Pagination from "../components/common/Pagination";
import "./Users.scss";

export default function Users() {
  const [params, setParams] = useState<UserQueryParams>({
    page: 1,
    limit: 10,
    search: "",
    status: "",
    sort: "createdAt",
    order: "desc",
  });

  const { data, isLoading } = useUsers(params);

  return (
    <div className="users">
      <h1 className="users__title">사용자 관리</h1>

      <UserFilter params={params} onChange={setParams} />

      <UserTable users={data?.data || []} loading={isLoading} />

      {data?.pagination && <Pagination page={data.pagination.page} totalPages={data.pagination.totalPages} onPageChange={(page) => setParams({ ...params, page })} />}
    </div>
  );
}
