import { useState } from "react";
import { useUpdatePhysicalLetterStatus, useUpdateShippingInfo } from "../../hooks/usePhysicalLetters";
import { PhysicalLetterRequest, PhysicalLetterStatus } from "../../types";
import { formatDate } from "../../utils/format";
import Modal from "../common/Modal";
import Button from "../common/Button";
import Input from "../common/Input";
import Select from "../common/Select";
import Textarea from "../common/Textarea";
import "./RequestManagementModal.scss";

interface RequestManagementModalProps {
  request: PhysicalLetterRequest;
  onClose: () => void;
  onUpdateSuccess: () => void;
}

export default function RequestManagementModal({ request, onClose, onUpdateSuccess }: RequestManagementModalProps) {
  const [status, setStatus] = useState<PhysicalLetterStatus>(request.physicalStatus);
  const [trackingNumber, setTrackingNumber] = useState(request.shippingInfo?.trackingNumber || "");
  const [shippingCompany, setShippingCompany] = useState(request.shippingInfo?.shippingCompany || "");
  const [adminNote, setAdminNote] = useState("");

  const updateStatusMutation = useUpdatePhysicalLetterStatus();
  const updateShippingMutation = useUpdateShippingInfo();

  const statusOptions = [
    { value: "requested", label: "신청됨" },
    { value: "confirmed", label: "확인됨" },
    { value: "processing", label: "처리중" },
    { value: "writing", label: "작성중" },
    { value: "sent", label: "발송됨" },
    { value: "delivered", label: "배송완료" },
    { value: "cancelled", label: "취소됨" },
  ];

  const shippingCompanyOptions = [
    { value: "", label: "택배사 선택" },
    { value: "cj", label: "CJ대한통운" },
    { value: "lotte", label: "롯데택배" },
    { value: "hanjin", label: "한진택배" },
    { value: "post", label: "우체국택배" },
    { value: "kdexp", label: "경동택배" },
  ];

  const handleUpdate = async () => {
    try {
      // 상태 업데이트
      if (status !== request.physicalStatus || adminNote.trim()) {
        await updateStatusMutation.mutateAsync({
          id: request._id,
          data: {
            status,
            notes: adminNote.trim() || undefined,
          },
        });
      }

      // 배송 정보 업데이트 (발송됨 상태일 때)
      if (status === "sent" && (trackingNumber || shippingCompany)) {
        await updateShippingMutation.mutateAsync({
          id: request._id,
          data: {
            trackingNumber,
            shippingCompany,
            adminNotes: adminNote.trim() || undefined,
          },
        });
      }

      onUpdateSuccess();
    } catch (error) {
      console.error("업데이트 실패:", error);
    }
  };

  const isLoading = updateStatusMutation.isPending || updateShippingMutation.isPending;

  return (
    <Modal isOpen={true} onClose={onClose} title="신청 관리" size="lg">
      <div className="request-management-modal">
        {/* 신청 정보 */}
        <div className="request-management-modal__section">
          <h3 className="request-management-modal__section-title">신청 정보</h3>
          <div className="request-management-modal__info-grid">
            <div className="request-management-modal__info-item">
              <label className="request-management-modal__label">편지 제목</label>
              <div className="request-management-modal__value">{request.title}</div>
            </div>
            <div className="request-management-modal__info-item">
              <label className="request-management-modal__label">수신자</label>
              <div className="request-management-modal__value">{request.shippingAddress.name}</div>
            </div>
            <div className="request-management-modal__info-item">
              <label className="request-management-modal__label">연락처</label>
              <div className="request-management-modal__value">{request.shippingAddress.phone}</div>
            </div>
            <div className="request-management-modal__info-item">
              <label className="request-management-modal__label">신청일</label>
              <div className="request-management-modal__value">{formatDate(request.physicalRequestDate)}</div>
            </div>
          </div>

          <div className="request-management-modal__info-item request-management-modal__info-item--full">
            <label className="request-management-modal__label">배송 주소</label>
            <div className="request-management-modal__value">
              ({request.shippingAddress.zipCode}) {request.shippingAddress.address1}
              {request.shippingAddress.address2 && (
                <>
                  <br />
                  {request.shippingAddress.address2}
                </>
              )}
            </div>
          </div>

          {request.recipientInfo?.memo && (
            <div className="request-management-modal__info-item request-management-modal__info-item--full">
              <label className="request-management-modal__label">수신자 메모</label>
              <div className="request-management-modal__value">{request.recipientInfo.memo}</div>
            </div>
          )}

          <div className="request-management-modal__info-grid">
            <div className="request-management-modal__info-item">
              <label className="request-management-modal__label">총 비용</label>
              <div className="request-management-modal__value">{(request.totalCost || 0).toLocaleString()}원</div>
            </div>
            <div className="request-management-modal__info-item">
              <label className="request-management-modal__label">편지 비용</label>
              <div className="request-management-modal__value">{(request.letterCost || 0).toLocaleString()}원</div>
            </div>
            <div className="request-management-modal__info-item">
              <label className="request-management-modal__label">배송 비용</label>
              <div className="request-management-modal__value">{(request.shippingCost || 0).toLocaleString()}원</div>
            </div>
          </div>
        </div>

        {/* 상태 관리 */}
        <div className="request-management-modal__section">
          <h3 className="request-management-modal__section-title">상태 관리</h3>
          <div className="request-management-modal__form-group">
            <label className="request-management-modal__label">상태 변경</label>
            <Select value={status} onChange={(e) => setStatus(e.target.value as PhysicalLetterStatus)} options={statusOptions} />
          </div>

          {/* 배송 정보 (발송됨 상태일 때) */}
          {status === "sent" && (
            <div className="request-management-modal__shipping-section">
              <h4 className="request-management-modal__subsection-title">배송 정보</h4>
              <div className="request-management-modal__form-row">
                <div className="request-management-modal__form-group">
                  <label className="request-management-modal__label">택배사</label>
                  <Select value={shippingCompany} onChange={(e) => setShippingCompany(e.target.value)} options={shippingCompanyOptions} />
                </div>
                <div className="request-management-modal__form-group">
                  <label className="request-management-modal__label">운송장 번호</label>
                  <Input value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} placeholder="운송장 번호 입력" />
                </div>
              </div>
            </div>
          )}

          {/* 관리자 메모 */}
          <div className="request-management-modal__form-group">
            <label className="request-management-modal__label">관리자 메모</label>
            <Textarea value={adminNote} onChange={(e) => setAdminNote(e.target.value)} placeholder="상태 변경 사유나 추가 메모를 입력하세요" rows={4} maxLength={500} />
            <div className="request-management-modal__char-count">{adminNote.length}/500</div>
          </div>
        </div>

        {/* 기존 메모 표시 */}
        {(request.physicalNotes || request.adminNotes) && (
          <div className="request-management-modal__section">
            <h3 className="request-management-modal__section-title">기존 메모</h3>
            {request.physicalNotes && (
              <div className="request-management-modal__existing-note">
                <label className="request-management-modal__label">신청자 메모</label>
                <div className="request-management-modal__note-content">{request.physicalNotes}</div>
              </div>
            )}
            {request.adminNotes && (
              <div className="request-management-modal__existing-note">
                <label className="request-management-modal__label">관리자 메모</label>
                <div className="request-management-modal__note-content">{request.adminNotes}</div>
              </div>
            )}
          </div>
        )}

        {/* 버튼 */}
        <div className="request-management-modal__actions">
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            취소
          </Button>
          <Button onClick={handleUpdate} loading={isLoading}>
            업데이트
          </Button>
        </div>
      </div>
    </Modal>
  );
}
