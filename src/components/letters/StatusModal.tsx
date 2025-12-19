import { useState } from "react";
import type { LetterStatus } from "../../types";
import Button from "../common/Button";
import Select from "../common/Select";
import "./StatusModal.scss";

interface StatusModalProps {
  currentStatus: LetterStatus;
  onConfirm: (status: LetterStatus, reason?: string) => void;
  onCancel: () => void;
  loading?: boolean;
}

const STATUS_OPTIONS = [
  { value: "created", label: "작성됨" },
  { value: "published", label: "공개" },
  { value: "hidden", label: "숨김" },
];

export default function StatusModal({ currentStatus, onConfirm, onCancel, loading }: StatusModalProps) {
  const [status, setStatus] = useState<LetterStatus>(currentStatus);
  const [reason, setReason] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(status, status === "hidden" ? reason : undefined);
  };

  return (
    <form className="status-modal" onSubmit={handleSubmit}>
      <Select label="상태" options={STATUS_OPTIONS} value={status} onChange={(e) => setStatus(e.target.value as LetterStatus)} />

      {status === "hidden" && (
        <div className="status-modal__field">
          <label>숨김 사유</label>
          <textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="숨김 사유를 입력하세요" required />
        </div>
      )}

      <div className="status-modal__actions">
        <Button type="button" variant="secondary" onClick={onCancel}>
          취소
        </Button>
        <Button type="submit" loading={loading}>
          변경
        </Button>
      </div>
    </form>
  );
}
