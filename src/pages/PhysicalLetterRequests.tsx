import { useState } from "react";
import { Link } from "react-router-dom";
import { usePhysicalLetterRequests } from "../hooks/usePhysicalLetters";
import { usePermission } from "../hooks/usePermission";
import { PERMISSIONS } from "../types";
import { formatDate } from "../utils/format";
import Loading from "../components/common/Loading";
import Button from "../components/common/Button";
import Select from "../components/common/Select";
import Input from "../components/common/Input";
import Pagination from "../components/common/Pagination";
import "./PhysicalLetterRequests.scss";

export default function PhysicalLetterRequests() {
  const { hasPermission } = usePermission();
  const [params, setParams] = useState({
    page: 1,
    limit: 20,
    status: "",
    search: "",
  });

  const { data, isLoading, error, refetch } = usePhysicalLetterRequests(params);

  // 디버깅을 위한 로그 추가
  console.log("PhysicalLetterRequests data:", {
    data: data?.data,
    total: data?.data?.length,
    pagination: data?.pagination,
    params,
  });

  const canRead = hasPermission(PERMISSIONS.LETTERS_READ);

  if (!canRead) {
    return (
      <div className="physical-letter-requests">
        <div className="physical-letter-requests__error">실물 편지 관리 권한이 없습니다</div>
      </div>
    );
  }

  if (isLoading) return <Loading />;
  if (error) return <div className="error">데이터를 불러오는데 실패했습니다</div>;

  const requests = data?.data || [];
  const pagination = data?.pagination;

  const statusOptions = [
    { value: "", label: "전체 상태" },
    { value: "requested", label: "신청됨" },
    { value: "approved", label: "승인됨" },
    { value: "writing", label: "작성중" },
    { value: "sent", label: "발송됨" },
    { value: "delivered", label: "배송완료" },
  ];

  const getStatusLabel = (status: string): string => {
    const labels = {
      requested: "신청됨",
      approved: "승인됨",
      writing: "작성중",
      sent: "발송됨",
      delivered: "배송완료",
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getStatusClass = (status: string): string => {
    const classes = {
      requested: "warning",
      approved: "info",
      writing: "primary",
      sent: "success",
      delivered: "success",
    };
    return classes[status as keyof typeof classes] || "default";
  };

  return (
    <div className="physical-letter-requests">
      <div className="physical-letter-requests__breadcrumb">
        <Link to="/physical-letters" className="physical-letter-requests__back-link">
          ← 실물 편지 관리로 돌아가기
        </Link>
      </div>

      <div className="physical-letter-requests__header">
        <h1 className="physical-letter-requests__title">실물 편지 신청 목록</h1>

        <div className="physical-letter-requests__filters">
          <Input type="text" placeholder="편지 제목, 작성자, 수신자로 검색" value={params.search} onChange={(e) => setParams({ ...params, search: e.target.value, page: 1 })} />

          <Select value={params.status} onChange={(e) => setParams({ ...params, status: e.target.value, page: 1 })} options={statusOptions} />

          <Button onClick={() => refetch()} loading={isLoading} size="sm">
            🔄 새로고침
          </Button>
        </div>
      </div>

      <div className="physical-letter-requests__table-container">
        <table className="physical-letter-requests__table">
          <thead>
            <tr>
              <th>편지 정보</th>
              <th>수신자 정보</th>
              <th>배송 주소</th>
              <th>상태</th>
              <th>신청일</th>
              <th>메모</th>
            </tr>
          </thead>
          <tbody>
            {requests.length > 0 ? (
              requests.map((request) => (
                <tr key={request.requestId}>
                  <td>
                    <div className="physical-letter-requests__letter-info">
                      <div className="physical-letter-requests__letter-title">
                        {request.replyToId && <span className="reply-request-tag">사연 답장</span>}
                        {request.title}
                      </div>
                      <div className="physical-letter-requests__letter-author">작성자: {request.authorName}</div>
                    </div>
                  </td>
                  <td>
                    <div className="physical-letter-requests__recipient-info">
                      <div className="physical-letter-requests__recipient-name">{request.recipientName}</div>
                      <div className="physical-letter-requests__recipient-phone">📞 {request.recipientPhone}</div>
                    </div>
                  </td>
                  <td>
                    <div className="physical-letter-requests__address">
                      {request.shippingAddress.address1} {request.shippingAddress.address2}
                      <br />({request.shippingAddress.zipCode})
                    </div>
                  </td>
                  <td>
                    <span className={`physical-letter-requests__status-badge physical-letter-requests__status-badge--${getStatusClass(request.physicalStatus)}`}>
                      {getStatusLabel(request.physicalStatus)}
                    </span>
                  </td>
                  <td>
                    <div className="physical-letter-requests__date">{formatDate(request.physicalRequestDate)}</div>
                  </td>
                  <td>
                    <div className="physical-letter-requests__memo">{request.physicalNotes || "-"}</div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="physical-letter-requests__empty">
                  실물 편지 신청이 없습니다
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {pagination && pagination.totalPages > 1 && <Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={(page) => setParams({ ...params, page })} />}
    </div>
  );
}
