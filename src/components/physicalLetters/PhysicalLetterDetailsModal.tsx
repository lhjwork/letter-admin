import { useEffect } from "react";
import { usePhysicalLetterRequests } from "../../hooks/usePhysicalLetters";
import { formatDate } from "../../utils/format";
import Button from "../common/Button";
import Loading from "../common/Loading";
import "./PhysicalLetterDetailsModal.scss";

interface PhysicalLetterDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  letterId: string;
  letterTitle: string;
}

export default function PhysicalLetterDetailsModal({ isOpen, onClose, letterId, letterTitle }: PhysicalLetterDetailsModalProps) {
  // letterId를 사용하여 더 정확한 검색
  const searchParams = {
    limit: 1000, // 모든 요청을 가져와서 클라이언트에서 필터링
  };

  const { data, isLoading, error } = usePhysicalLetterRequests(searchParams);

  // Filter requests that match this letter - _id로 정확히 매칭
  const letterRequests =
    data?.data?.filter((request) => {
      console.log("Filtering request:", {
        requestId: request._id,
        targetLetterId: letterId,
        requestTitle: request.title,
        targetTitle: letterTitle,
        match: request._id === letterId,
      });
      return request._id === letterId;
    }) || [];

  console.log("Modal data:", {
    letterId,
    letterTitle,
    totalRequests: data?.data?.length || 0,
    matchedRequests: letterRequests.length,
    allRequests: data?.data?.map((r) => ({ id: r._id, title: r.title })) || [],
  });

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

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
    <div className="physical-letter-details-modal">
      <div className="physical-letter-details-modal__backdrop" onClick={onClose} />
      <div className="physical-letter-details-modal__content">
        <div className="physical-letter-details-modal__header">
          <h2 className="physical-letter-details-modal__title">실물 편지 신청 상세 정보</h2>
          <Button variant="secondary" size="sm" onClick={onClose}>
            ✕
          </Button>
        </div>

        <div className="physical-letter-details-modal__letter-info">
          <h3>{letterTitle}</h3>
          <p>총 {letterRequests.length}개의 실물 편지 신청</p>
        </div>

        <div className="physical-letter-details-modal__body">
          {isLoading ? (
            <Loading />
          ) : error ? (
            <div className="physical-letter-details-modal__error">데이터를 불러오는데 실패했습니다</div>
          ) : letterRequests.length > 0 ? (
            <div className="physical-letter-details-modal__requests">
              {letterRequests.map((request) => (
                <div key={request.requestId} className="physical-letter-details-modal__request-card">
                  <div className="physical-letter-details-modal__request-header">
                    <div className="physical-letter-details-modal__request-status">
                      <span className={`physical-letter-details-modal__status-badge physical-letter-details-modal__status-badge--${getStatusClass(request.physicalStatus)}`}>
                        {getStatusLabel(request.physicalStatus)}
                      </span>
                    </div>
                    <div className="physical-letter-details-modal__request-date">{formatDate(request.physicalRequestDate)}</div>
                  </div>

                  <div className="physical-letter-details-modal__request-details">
                    <div className="physical-letter-details-modal__detail-section">
                      <h4>수신자 정보</h4>
                      <div className="physical-letter-details-modal__recipient-info">
                        <div className="physical-letter-details-modal__recipient-name">
                          <strong>{request.recipientName}</strong>
                        </div>
                        <div className="physical-letter-details-modal__recipient-phone">📞 {request.recipientPhone}</div>
                      </div>
                    </div>

                    <div className="physical-letter-details-modal__detail-section">
                      <h4>배송 주소</h4>
                      <div className="physical-letter-details-modal__address">
                        {request.shippingAddress.address1} {request.shippingAddress.address2}
                        <br />({request.shippingAddress.zipCode})
                      </div>
                    </div>

                    {request.physicalNotes && (
                      <div className="physical-letter-details-modal__detail-section">
                        <h4>메모</h4>
                        <div className="physical-letter-details-modal__memo">{request.physicalNotes}</div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="physical-letter-details-modal__empty">이 편지에 대한 실물 편지 신청이 없습니다</div>
          )}
        </div>

        <div className="physical-letter-details-modal__footer">
          <Button onClick={onClose}>닫기</Button>
        </div>
      </div>
    </div>
  );
}
