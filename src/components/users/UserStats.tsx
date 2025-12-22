import { UserStats as UserStatsType } from "../../types";
import { formatDate, formatNumber } from "../../utils/format";
import "./UserStats.scss";

interface UserStatsProps {
  stats: UserStatsType;
}

export default function UserStats({ stats }: UserStatsProps) {
  // stats가 없는 경우 기본값 사용
  const safeStats = {
    totalLetters: stats?.totalLetters || 0,
    totalStories: stats?.totalStories || 0,
    totalViews: stats?.totalViews || 0,
    totalLikes: stats?.totalLikes || 0,
    joinedAt: stats?.joinedAt || new Date().toISOString(),
    lastActiveAt: stats?.lastActiveAt,
  };

  const statItems = [
    {
      label: "총 편지 수",
      value: formatNumber(safeStats.totalLetters),
      icon: "📝",
      color: "blue",
    },
    {
      label: "총 스토리 수",
      value: formatNumber(safeStats.totalStories),
      icon: "📖",
      color: "green",
    },
    {
      label: "총 조회 수",
      value: formatNumber(safeStats.totalViews),
      icon: "👁️",
      color: "purple",
    },
    {
      label: "총 좋아요 수",
      value: formatNumber(safeStats.totalLikes),
      icon: "❤️",
      color: "red",
    },
  ];

  return (
    <div className="user-stats">
      <div className="user-stats__grid">
        {statItems.map((item) => (
          <div key={item.label} className={`user-stats__card user-stats__card--${item.color}`}>
            <div className="user-stats__icon">{item.icon}</div>
            <div className="user-stats__content">
              <div className="user-stats__value">{item.value}</div>
              <div className="user-stats__label">{item.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="user-stats__info">
        <div className="user-stats__info-item">
          <span className="user-stats__info-label">가입일:</span>
          <span className="user-stats__info-value">{safeStats.joinedAt ? formatDate(safeStats.joinedAt) : "정보 없음"}</span>
        </div>
        {safeStats.lastActiveAt && (
          <div className="user-stats__info-item">
            <span className="user-stats__info-label">마지막 활동:</span>
            <span className="user-stats__info-value">{formatDate(safeStats.lastActiveAt)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
