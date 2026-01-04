import { useState, useEffect } from "react";
import type { Ad } from "../../types/ads";
import "./DisplayPreview.scss";

interface DisplayPreviewProps {
  ad: Ad;
}

interface DisplayStatus {
  isActive: boolean;
  isVisible: boolean;
  isInCampaignPeriod: boolean;
  hasPlacement: boolean;
  isInTimeRange: boolean;
  isInDayRange: boolean;
}

export default function DisplayPreview({ ad }: DisplayPreviewProps) {
  const [currentStatus, setCurrentStatus] = useState<DisplayStatus | null>(null);

  useEffect(() => {
    const checkDisplayStatus = () => {
      const now = new Date();
      const status: DisplayStatus = {
        isActive: ad.status === "active",
        isVisible: ad.displayControl?.isVisible || false,
        isInCampaignPeriod:
          now >= new Date(ad.campaign.startDate) && now <= new Date(ad.campaign.endDate),
        hasPlacement: (ad.displayControl?.placements?.length || 0) > 0,
        isInTimeRange: checkTimeRange(ad.displayControl?.schedule),
        isInDayRange: checkDayRange(ad.displayControl?.schedule),
      };
      setCurrentStatus(status);
    };

    checkDisplayStatus();
    const interval = setInterval(checkDisplayStatus, 60000); // 1분마다 체크
    return () => clearInterval(interval);
  }, [ad]);

  const checkTimeRange = (schedule?: any) => {
    if (!schedule?.startTime || !schedule?.endTime) return true;
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5);
    return currentTime >= schedule.startTime && currentTime <= schedule.endTime;
  };

  const checkDayRange = (schedule?: any) => {
    if (!schedule?.daysOfWeek?.length) return true;
    const currentDay = new Date().getDay();
    return schedule.daysOfWeek.includes(currentDay);
  };

  if (!currentStatus) return null;

  const isDisplayable = Object.values(currentStatus).every(Boolean);

  return (
    <div className="display-preview">
      <h4 className="display-preview__title">
        <span>실시간 노출 상태</span>
        <span className={`display-preview__indicator ${isDisplayable ? "display-preview__indicator--active" : "display-preview__indicator--inactive"}`} />
      </h4>
      
      <div className="display-preview__items">
        <StatusItem label="광고 상태" status={currentStatus.isActive} value={ad.status} />
        <StatusItem
          label="노출 설정"
          status={currentStatus.isVisible}
          value={currentStatus.isVisible ? "활성" : "비활성"}
        />
        <StatusItem
          label="캠페인 기간"
          status={currentStatus.isInCampaignPeriod}
          value={currentStatus.isInCampaignPeriod ? "진행 중" : "기간 외"}
        />
        <StatusItem
          label="노출 위치"
          status={currentStatus.hasPlacement}
          value={
            currentStatus.hasPlacement
              ? `${ad.displayControl?.placements?.length}개 설정`
              : "미설정"
          }
        />
        <StatusItem
          label="시간대"
          status={currentStatus.isInTimeRange}
          value={currentStatus.isInTimeRange ? "허용 시간" : "제한 시간"}
        />
        <StatusItem
          label="요일"
          status={currentStatus.isInDayRange}
          value={currentStatus.isInDayRange ? "허용 요일" : "제한 요일"}
        />
      </div>

      <div className={`display-preview__result ${isDisplayable ? "display-preview__result--success" : "display-preview__result--error"}`}>
        {isDisplayable ? "✅ 현재 노출 가능" : "❌ 현재 노출 불가"}
      </div>
    </div>
  );
}

interface StatusItemProps {
  label: string;
  status: boolean;
  value: string;
}

function StatusItem({ label, status, value }: StatusItemProps) {
  return (
    <div className="display-preview__item">
      <span className="display-preview__item-label">{label}:</span>
      <span className={`display-preview__item-value ${status ? "display-preview__item-value--success" : "display-preview__item-value--error"}`}>
        {value}
      </span>
    </div>
  );
}