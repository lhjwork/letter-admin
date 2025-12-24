import { useState, useEffect } from "react";
import { PhysicalLetterRequest, PhysicalLetterStatus } from "../../types";
import { useUpdatePhysicalLetterStatus } from "../../hooks/usePhysicalLetters";
import { formatDate } from "../../utils/format";
import Modal from "../common/Modal";
import Button from "../common/Button";
import Select from "../common/Select";
import "./StatusUpdateModal.scss";

interface StatusUpdateModalProps {
  isOpen: boolean;
  letter: PhysicalLetterRequest | null;
  onClose: () => void;
}

export default function StatusUpdateModal({ isOpen, letter, onClose }: StatusUpdateModalProps) {
  const [status, setStatus] = useState<PhysicalLetterStatus>("requested");
  const [notes, setNotes] = useState("");
  const updateMutation = useUpdatePhysicalLetterStatus();

  useEffect(() => {
    if (letter && isOpen) {
      setStatus(letter.physicalStatus);
      setNotes(letter.physicalNotes || "");
    }
  }, [letter, isOpen]);

  const statusOptions = [
    { value: "requested", label: "신청됨" },
    { value: "processing", label: "처리중" },
    { value: "writing", label: "작성중" },
    { value: "sent", label: "발송됨" },
    { value: "delivered", label: "배송완료" },
    { value: "cancelled", label: "취소됨" },
  ];

  const handleSubmit = async () => {
    if (!letter) return;

    try {
      await updateMutation.mutateAsync({
        id: letter._id,
        data: { status, notes: notes.trim() || undefined },
      });
      onClose();
    } catch (error) {
      console.error("Status update failed:", error);
    }
  };

  if (!letter) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`실물 편지 상태 업데이트 - ${letter.title}`} size="md">
      <div className="status-update-modal">
        <div className="status-update-modal__form">
          <div className="status-update-modal__field">
            <label className="status-update-modal__label">상태</label>
            <Select value={status} onChange={(e) => setStatus(e.target.value as PhysicalLetterStatus)} options={statusOptions} />
          </div>

          <div className="status-update-modal__field">
            <label className="status-update-modal__label">관리자 메모</label>
            <textarea
              className="status-update-modal__textarea"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="상태 변경 사유나 추가 메모를 입력하세요"
              rows={4}
              maxLength={500}
            />
            <div className="status-update-modal__char-count">{notes.length}/500</div>
          </div>
        </div>

        <div className="status-update-modal__info">
          <h4 className="status-update-modal__info-title">배송 정보</h4>
          <div className="status-update-modal__info-grid">
            <div className="status-update-modal__info-item">
              <span className="status-update-modal__info-label">받는 분:</span>
              <span className="status-update-modal__info-value">{letter.shippingAddress.name}</span>
            </div>
            <div className="status-update-modal__info-item">
              <span className="status-update-modal__info-label">연락처:</span>
              <span className="status-update-modal__info-value">{letter.shippingAddress.phone}</span>
            </div>
            <div className="status-update-modal__info-item">
              <span className="status-update-modal__info-label">주소:</span>
              <span className="status-update-modal__info-value">
                ({letter.shippingAddress.zipCode}) {letter.shippingAddress.address1}
                {letter.shippingAddress.address2 && ` ${letter.shippingAddress.address2}`}
              </span>
            </div>
            <div className="status-update-modal__info-item">
              <span className="status-update-modal__info-label">신청일:</span>
              <span className="status-update-modal__info-value">{formatDate(letter.physicalRequestDate)}</span>
            </div>
          </div>
        </div>

        <div className="status-update-modal__actions">
          <Button variant="secondary" onClick={onClose}>
            취소
          </Button>
          <Button onClick={handleSubmit} loading={updateMutation.isPending}>
            업데이트
          </Button>
        </div>
      </div>
    </Modal>
  );
}
