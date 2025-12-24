import { PhysicalLetterRequest } from "../../types";
import { formatDate, formatDateTime } from "../../utils/format";
import Modal from "../common/Modal";
import Button from "../common/Button";
import "./DetailModal.scss";

interface DetailModalProps {
  isOpen: boolean;
  letter: PhysicalLetterRequest | null;
  onClose: () => void;
}

export default function DetailModal({ isOpen, letter, onClose }: DetailModalProps) {
  if (!letter) return null;

  const getStatusBadge = (status: string) => {
    const statusMap = {
      requested: { label: "신청됨", className: "requested" },
      processing: { label: "처리중", className: "processing" },
      writing: { label: "작성중", className: "writing" },
      sent: { label: "발송됨", className: "sent" },
      delivered: { label: "배송완료", className: "delivered" },
      cancelled: { label: "취소됨", className: "cancelled" },
    };
    return statusMap[status as keyof typeof statusMap] || { label: "알 수 없음", className: "unknown" };
  };

  const statusBadge = getStatusBadge(letter.physicalStatus);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="실물 편지 상세 정보" size="lg">
      <div className="detail-modal">
        <div className="detail-modal__section">
          <h3 className="detail-modal__section-title">편지 정보</h3>
          <div className="detail-modal__grid">
            <div className="detail-modal__item detail-modal__item--full">
              <span className="detail-modal__label">편지 제목:</span>
              <span className="detail-modal__value">{letter.title}</span>
            </div>
            <div className="detail-modal__item">
              <span className="detail-modal__label">현재 상태:</span>
              <span className={`detail-modal__status detail-modal__status--${statusBadge.className}`}>{statusBadge.label}</span>
            </div>
            <div className="detail-modal__item">
              <span className="detail-modal__label">신청일:</span>
              <span className="detail-modal__value">📅 {formatDateTime(letter.physicalRequestDate)}</span>
            </div>
          </div>
        </div>

        <div className="detail-modal__section">
          <h3 className="detail-modal__section-title">배송 정보</h3>
          <div className="detail-modal__grid">
            <div className="detail-modal__item">
              <span className="detail-modal__label">받는 분:</span>
              <span className="detail-modal__value">{letter.shippingAddress.name}</span>
            </div>
            <div className="detail-modal__item">
              <span className="detail-modal__label">연락처:</span>
              <span className="detail-modal__value">📞 {letter.shippingAddress.phone}</span>
            </div>
            <div className="detail-modal__item">
              <span className="detail-modal__label">우편번호:</span>
              <span className="detail-modal__value">{letter.shippingAddress.zipCode}</span>
            </div>
            <div className="detail-modal__item detail-modal__item--full">
              <span className="detail-modal__label">주소:</span>
              <span className="detail-modal__value">🏠 {letter.shippingAddress.address1}</span>
            </div>
            {letter.shippingAddress.address2 && (
              <div className="detail-modal__item detail-modal__item--full">
                <span className="detail-modal__label">상세주소:</span>
                <span className="detail-modal__value">{letter.shippingAddress.address2}</span>
              </div>
            )}
            <div className="detail-modal__item">
              <span className="detail-modal__label">주소 등록일:</span>
              <span className="detail-modal__value">{formatDateTime(letter.shippingAddress.requestedAt)}</span>
            </div>
          </div>
        </div>

        <div className="detail-modal__section">
          <h3 className="detail-modal__section-title">시스템 정보</h3>
          <div className="detail-modal__grid">
            <div className="detail-modal__item">
              <span className="detail-modal__label">편지 작성일:</span>
              <span className="detail-modal__value">{formatDateTime(letter.createdAt)}</span>
            </div>
            <div className="detail-modal__item">
              <span className="detail-modal__label">최종 수정일:</span>
              <span className="detail-modal__value">{formatDateTime(letter.updatedAt)}</span>
            </div>
          </div>
        </div>

        {letter.physicalNotes && (
          <div className="detail-modal__section">
            <h3 className="detail-modal__section-title">관리자 메모</h3>
            <div className="detail-modal__notes">{letter.physicalNotes}</div>
          </div>
        )}

        <div className="detail-modal__actions">
          <Button onClick={onClose}>닫기</Button>
        </div>
      </div>
    </Modal>
  );
}
