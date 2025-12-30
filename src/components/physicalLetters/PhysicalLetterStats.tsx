import { PhysicalLetterStats as PhysicalLetterStatsType } from "../../types";
import { formatNumber } from "../../utils/format";
import "./PhysicalLetterStats.scss";

interface PhysicalLetterStatsProps {
  stats: PhysicalLetterStatsType;
}

export default function PhysicalLetterStats({ stats }: PhysicalLetterStatsProps) {
  const statItems = [
    {
      label: "전체",
      value: formatNumber(stats.total),
      icon: "📋",
      color: "blue",
    },
    {
      label: "신청됨",
      value: formatNumber(stats.requested),
      icon: "📝",
      color: "orange",
    },
    {
      label: "작성중",
      value: formatNumber(stats.writing),
      icon: "✍️",
      color: "purple",
    },
    {
      label: "발송됨",
      value: formatNumber(stats.sent),
      icon: "📮",
      color: "cyan",
    },
    {
      label: "배송완료",
      value: formatNumber(stats.delivered),
      icon: "🎯",
      color: "green",
    },
  ];

  const completionRate = stats.total > 0 ? Math.round((stats.delivered / stats.total) * 100) : 0;

  return (
    <div className="physical-letter-stats">
      <div className="physical-letter-stats__grid">
        {statItems.map((item) => (
          <div key={item.label} className={`physical-letter-stats__card physical-letter-stats__card--${item.color}`}>
            <div className="physical-letter-stats__icon">{item.icon}</div>
            <div className="physical-letter-stats__content">
              <div className="physical-letter-stats__value">{item.value}</div>
              <div className="physical-letter-stats__label">{item.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="physical-letter-stats__metrics">
        <div className="physical-letter-stats__metric">
          <div className="physical-letter-stats__metric-label">완료율</div>
          <div className="physical-letter-stats__metric-value">{completionRate}%</div>
          <div className="physical-letter-stats__progress">
            <div className="physical-letter-stats__progress-bar physical-letter-stats__progress-bar--blue" style={{ width: `${completionRate}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}
