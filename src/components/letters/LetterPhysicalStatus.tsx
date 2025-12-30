import { PhysicalLetterStatus, PhysicalLetterSummary } from "../../types";
import "./LetterPhysicalStatus.scss";

interface LetterPhysicalStatusProps {
  physicalLetter?: PhysicalLetterSummary;
  compact?: boolean;
}

export default function LetterPhysicalStatus({ physicalLetter, compact = false }: LetterPhysicalStatusProps) {
  if (!physicalLetter || physicalLetter.currentStatus === "none") {
    return compact ? null : (
      <div className="letter-physical-status letter-physical-status--none">
        <span className="letter-physical-status__badge letter-physical-status__badge--none">실물 편지 없음</span>
      </div>
    );
  }

  const getStatusInfo = (status: PhysicalLetterStatus) => {
    const statusMap = {
      none: { label: "없음", className: "none", icon: "⚪" },
      requested: { label: "신청됨", className: "requested", icon: "📝" },
      writing: { label: "작성중", className: "writing", icon: "✍️" },
      sent: { label: "발송됨", className: "sent", icon: "📮" },
      delivered: { label: "배송완료", className: "delivered", icon: "✅" },
    };
    return statusMap[status] || { label: "알 수 없음", className: "unknown", icon: "❓" };
  };

  const statusInfo = getStatusInfo(physicalLetter.currentStatus);

  if (compact) {
    return (
      <div className="letter-physical-status letter-physical-status--compact">
        <span className={`letter-physical-status__badge letter-physical-status__badge--${statusInfo.className}`}>
          {statusInfo.icon} {physicalLetter.totalRequests}개 {statusInfo.label}
        </span>
      </div>
    );
  }

  return (
    <div className="letter-physical-status">
      <div className="letter-physical-status__header">
        <span className={`letter-physical-status__badge letter-physical-status__badge--${statusInfo.className}`}>
          {statusInfo.icon} {statusInfo.label}
        </span>
        <span className="letter-physical-status__count">{physicalLetter.totalRequests}개 신청</span>
      </div>

      {physicalLetter.adminNote && <div className="letter-physical-status__note">{physicalLetter.adminNote}</div>}

      {physicalLetter.lastUpdatedAt && <div className="letter-physical-status__updated">마지막 업데이트: {new Date(physicalLetter.lastUpdatedAt).toLocaleDateString("ko-KR")}</div>}
    </div>
  );
}
