import type { Ad } from "../../types/ads";
import "./DisplayStatusBadge.scss";

interface DisplayStatusBadgeProps {
  ad: Ad;
}

export default function DisplayStatusBadge({ ad }: DisplayStatusBadgeProps) {
  const getDisplayStatus = () => {
    const now = new Date();
    const startDate = new Date(ad.campaign.startDate);
    const endDate = new Date(ad.campaign.endDate);

    // 1. 기본 상태 확인 (가장 중요)
    if (ad.status !== "active") {
      return { 
        label: ad.status === "draft" ? "초안 (비활성)" : "비활성", 
        color: "gray",
        reason: `광고 상태가 "${ad.status}"입니다. "active"로 변경하세요.`
      };
    }

    if (!ad.displayControl?.isVisible) {
      return { 
        label: "숨김", 
        color: "red",
        reason: "노출 설정이 비활성화되어 있습니다."
      };
    }

    // 2. 캠페인 기간 확인
    if (now < startDate) {
      return { 
        label: "예약됨", 
        color: "blue",
        reason: `캠페인 시작일: ${startDate.toLocaleDateString()}`
      };
    }

    if (now > endDate) {
      return { 
        label: "만료됨", 
        color: "red",
        reason: `캠페인 종료일: ${endDate.toLocaleDateString()}`
      };
    }

    // 3. 노출 위치 확인
    if (!ad.displayControl?.placements?.length) {
      return { 
        label: "위치 미설정", 
        color: "yellow",
        reason: "노출 위치가 설정되지 않았습니다."
      };
    }

    return { 
      label: "노출 중", 
      color: "green",
      reason: "모든 조건이 충족되어 노출 중입니다."
    };
  };

  const { label, color, reason } = getDisplayStatus();

  return (
    <span 
      className={`display-status-badge display-status-badge--${color}`}
      title={reason}
    >
      {label}
    </span>
  );
}