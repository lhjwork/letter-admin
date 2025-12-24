import { useState } from "react";
import { usePhysicalLetters } from "../../hooks/usePhysicalLetters";
import { usePermission } from "../../hooks/usePermission";
import { PERMISSIONS, type PhysicalLetterRequest, type PhysicalLetterQueryParams, type PhysicalLetterStatus } from "../../types";
import { formatDate, formatNumber } from "../../utils/format";
import Button from "../common/Button";
import Input from "../common/Input";
import Select from "../common/Select";
import Pagination from "../common/Pagination";
import Loading from "../common/Loading";
import RequestManagementModal from "./RequestManagementModal";
import "./PhysicalLetterRequestList.scss";

export default function PhysicalLetterRequestList() {
  const { hasPermission } = usePermission();
  const [params, setParams] = useState<PhysicalLetterQueryParams>({
    page: 1,
    limit: 20,
    search: "",
    status: "",
    sort: "physicalRequestDate",
    order: "desc",
  });
  const [selectedRequest, setSelectedRequest] = useState<PhysicalLetterRequest | null>(null);
  const [showManagementModal, setShowManagementModal] = useState(false);

  const { data, isLoading, refetch } = usePhysicalLetters(params);
  const canWrite = hasPermission(PERMISSIONS.LETTERS_WRITE);

  const statusOptions = [
    { value: "", label: "전체 상태" },
    { value: "requested", label: "신청됨" },
    { value: "confirmed", label: "확인됨" },
    { value: "processing", label: "처리중" },
    { value: "writing", label: "작성중" },
    { value: "sent", label: "발송됨" },
    { value: "delivered", label: "배송완료" },
    { value: "cancelled", label: "취소됨" },
  ];

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      requested: { label: "신청됨", className: "requested" },
      confirmed: { label: "확인됨", className: "confirmed" },
      processing: { label: "처리중", className: "processing" },
      writing: { label: "작성중", className: "writing" },
      sent: { label: "발송됨", className: "sent" },
      delivered: { label: "배송완료", className: "delivered" },
      cancelled: { label: "취소됨", className: "cancelled" },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.requested;
    return <span className={`request-list__status-badge request-list__status-badge--${config.className}`}>{config.label}</span>;
  };

  const handleManageRequest = (request: PhysicalLetterRequest) => {
    setSelectedRequest(request);
    setShowManagementModal(true);
  };

  const handleCloseModal = () => {
    setShowManagementModal(false);
    setSelectedRequest(null);
  };

  const handleUpdateSuccess = () => {
    refetch();
    handleCloseModal();
  };

  if (isLoading) return <Loading />;

  return (
    <div className="physical-letter-request-list">
      <div className="physical-letter-request-list__header">
        <h1 className="physical-letter-request-list__title">신청 목록 관리</h1>
        <Button onClick={() => refetch()}>새로고침</Button>
      </div>

      {/* 필터 */}
      <div className="physical-letter-request-list__filters">
        <Input
          placeholder="편지 제목 또는 수신자명 검색"
          value={params.search || ""}
          onChange={(e) => setParams({ ...params, search: e.target.value, page: 1 })}
          className="physical-letter-request-list__search"
        />
        <Select
          value={params.status || ""}
          onChange={(e) => setParams({ ...params, status: e.target.value as PhysicalLetterStatus | "", page: 1 })}
          options={statusOptions}
          className="physical-letter-request-list__status-filter"
        />
      </div>

      {/* 신청 목록 테이블 */}
      <div className="physical-letter-request-list__table-container">
        <table className="physical-letter-request-list__table">
          <thead>
            <tr>
              <th>편지</th>
              <th>수신자</th>
              <th>주소</th>
              <th>비용</th>
              <th>상태</th>
              <th>신청일</th>
              <th>작업</th>
            </tr>
          </thead>
          <tbody>
            {data?.data && data.data.length > 0 ? (
              data.data.map((request) => (
                <tr key={request._id} className="physical-letter-request-list__row">
                  <td>
                    <div className="physical-letter-request-list__letter-info">
                      <div className="physical-letter-request-list__letter-title">{request.title}</div>
                      <div className="physical-letter-request-list__letter-id">ID: {typeof request.letterId === "string" ? request.letterId.slice(-8) : request.letterId._id.slice(-8)}</div>
                    </div>
                  </td>
                  <td>
                    <div className="physical-letter-request-list__recipient-info">
                      <div className="physical-letter-request-list__recipient-name">{request.shippingAddress.name}</div>
                      <div className="physical-letter-request-list__recipient-phone">{request.shippingAddress.phone}</div>
                    </div>
                  </td>
                  <td>
                    <div className="physical-letter-request-list__address">
                      <div className="physical-letter-request-list__address-main">
                        ({request.shippingAddress.zipCode}) {request.shippingAddress.address1}
                      </div>
                      {request.shippingAddress.address2 && <div className="physical-letter-request-list__address-detail">{request.shippingAddress.address2}</div>}
                    </div>
                  </td>
                  <td>
                    <div className="physical-letter-request-list__cost">
                      <div className="physical-letter-request-list__total-cost">{formatNumber(request.totalCost || 0)}원</div>
                      <div className="physical-letter-request-list__shipping-cost">배송: {formatNumber(request.shippingCost || 0)}원</div>
                    </div>
                  </td>
                  <td>{getStatusBadge(request.physicalStatus)}</td>
                  <td className="physical-letter-request-list__date">{formatDate(request.physicalRequestDate)}</td>
                  <td>
                    <Button size="sm" variant="secondary" onClick={() => handleManageRequest(request)} disabled={!canWrite}>
                      관리
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="physical-letter-request-list__empty">
                  실물 편지 신청이 없습니다
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 페이지네이션 */}
      {data?.pagination && <Pagination page={data.pagination.page} totalPages={data.pagination.totalPages} onPageChange={(page) => setParams({ ...params, page })} />}

      {/* 관리 모달 */}
      {showManagementModal && selectedRequest && <RequestManagementModal request={selectedRequest} onClose={handleCloseModal} onUpdateSuccess={handleUpdateSuccess} />}
    </div>
  );
}
