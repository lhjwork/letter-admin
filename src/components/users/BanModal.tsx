import { useState } from "react";
import Button from "../common/Button";
import "./BanModal.scss";

interface BanModalProps {
  userName: string;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function BanModal({ userName, onConfirm, onCancel, loading }: BanModalProps) {
  const [reason, setReason] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (reason.trim()) {
      onConfirm(reason);
    }
  };

  return (
    <form className="ban-modal" onSubmit={handleSubmit}>
      <p className="ban-modal__message">
        <strong>{userName}</strong> 사용자를 정지하시겠습니까?
      </p>
      <div className="ban-modal__field">
        <label>정지 사유</label>
        <textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="정지 사유를 입력하세요" required />
      </div>
      <div className="ban-modal__actions">
        <Button type="button" variant="secondary" onClick={onCancel}>
          취소
        </Button>
        <Button type="submit" variant="danger" loading={loading}>
          정지
        </Button>
      </div>
    </form>
  );
}
