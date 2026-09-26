import { useState } from "react";
import { useLetters } from "../hooks/useLetters";
import type { LetterQueryParams } from "../types";
import LetterTable from "../components/letters/LetterTable";
import LetterFilter from "../components/letters/LetterFilter";
import Pagination from "../components/common/Pagination";
import Button from "../components/common/Button";
import { Link, useSearchParams } from "react-router-dom";
import "./Letters.scss";

export default function Letters() {
  const [searchParams] = useSearchParams();
  const [params, setParams] = useState<LetterQueryParams>({
    page: 1,
    limit: 10,
    search: "",
    type: "",
    category: "",
    // /letters?status=deleted 로 진입하면 사용자 삭제 요청 목록부터 보여준다
    status: (searchParams.get("status") as LetterQueryParams["status"]) || "",
    sort: "createdAt",
    order: "desc",
  });

  const { data, isLoading } = useLetters(params);

  return (
    <div className="letters">
      <div className="letters__header">
        <h1 className="letters__title">편지/사연 관리</h1>

        <div className="letters__actions">
          <Button variant={params.status === "deleted" ? "primary" : "secondary"} onClick={() => setParams({ ...params, status: params.status === "deleted" ? "" : "deleted", page: 1 })}>
            🗑️ 삭제 요청 목록
          </Button>
          <Link to="/letters/physical">
            <Button variant="secondary">📮 실물 편지 관리</Button>
          </Link>
        </div>
      </div>

      <LetterFilter params={params} onChange={setParams} />

      <LetterTable letters={data?.data || []} loading={isLoading} />

      {data?.pagination && <Pagination page={data.pagination.page} totalPages={data.pagination.totalPages} onPageChange={(page) => setParams({ ...params, page })} />}
    </div>
  );
}
