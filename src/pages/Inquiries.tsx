import { useState } from "react";
import { Link } from "react-router-dom";
import { useInquiries } from "../hooks/useInquiries";
import type { InquiryItem, InquiryStatus } from "../types";
import { formatDate } from "../utils/format";
import Table from "../components/common/Table";
import Pagination from "../components/common/Pagination";
import "./Inquiries.scss";

const INQUIRY_STATUS_LABELS: Record<InquiryStatus, string> = { open: "답변 기다림", answered: "답변 완료" };
const FILTERS: { value: InquiryStatus | ""; label: string }[] = [
  { value: "", label: "전체" },
  { value: "open", label: "답변 기다림" },
  { value: "answered", label: "답변 완료" },
];

export function InquiryStatusBadge({ status }: { status: InquiryStatus }) {
  return <span className={`inq-badge inq-badge--${status}`}>{INQUIRY_STATUS_LABELS[status]}</span>;
}

/** 1:1 문의 목록. 작성자는 닉네임만 */
export default function Inquiries() {
  const [status, setStatus] = useState<InquiryStatus | "">("open");
  const [page, setPage] = useState(1);
  const { data, isLoading } = useInquiries(page, status);
  const list = data?.data;

  const columns = [
    { key: "status", header: "상태", width: "110px", render: (q: InquiryItem) => <InquiryStatusBadge status={q.status} /> },
    { key: "category", header: "분류", width: "100px" },
    { key: "title", header: "제목", render: (q: InquiryItem) => <Link to={`/inquiries/${q._id}`} className="inq-link">{q.title}</Link> },
    { key: "nickname", header: "작성자", width: "140px" },
    { key: "createdAt", header: "작성일", width: "120px", render: (q: InquiryItem) => formatDate(q.createdAt) },
  ];

  return (
    <div className="inquiries">
      <div className="inquiries__header">
        <h1 className="inquiries__title">문의</h1>
        <div className="inquiries__filters" role="group" aria-label="상태 필터">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              aria-pressed={status === f.value}
              className={`inquiries__filter ${status === f.value ? "inquiries__filter--on" : ""}`}
              onClick={() => {
                setStatus(f.value);
                setPage(1);
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>
      <Table columns={columns} data={list?.items ?? []} keyExtractor={(q) => q._id} loading={isLoading} emptyMessage="문의가 없습니다" />
      {list && <Pagination page={page} totalPages={list.pagination.totalPages} onPageChange={setPage} />}
    </div>
  );
}
