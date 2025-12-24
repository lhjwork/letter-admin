import { Link } from "react-router-dom";
import { usePhysicalLetterStats } from "../../hooks/usePhysicalLetters";
import { formatNumber } from "../../utils/format";
import "./PhysicalLetterWidget.scss";

export default function PhysicalLetterWidget() {
  const { data: statsData, isLoading } = usePhysicalLetterStats();

  if (isLoading) {
    return (
      <div className="physical-letter-widget">
        <div className="physical-letter-widget__header">
          <h3 className="physical-letter-widget__title">📮 실물 편지 현황</h3>
        </div>
        <div className="physical-letter-widget__loading">로딩 중...</div>
      </div>
    );
  }

  const stats = statsData?.data;
  if (!stats) return null;

  const completionRate = stats.total > 0 ? Math.round((stats.delivered / stats.total) * 100) : 0;
  const pendingCount = stats.requested + stats.processing + stats.writing;

  return (
    <div className="physical-letter-widget">
      <div className="physical-letter-widget__header">
        <h3 className="physical-letter-widget__title">📮 실물 편지 현황</h3>
        <Link to="/physical-letters" className="physical-letter-widget__link">
          전체보기 →
        </Link>
      </div>

      <div className="physical-letter-widget__stats">
        <div className="physical-letter-widget__stat">
          <div className="physical-letter-widget__stat-value">{formatNumber(stats.total)}</div>
          <div className="physical-letter-widget__stat-label">총 신청</div>
        </div>
        <div className="physical-letter-widget__stat">
          <div className="physical-letter-widget__stat-value physical-letter-widget__stat-value--warning">{formatNumber(pendingCount)}</div>
          <div className="physical-letter-widget__stat-label">처리 대기</div>
        </div>
        <div className="physical-letter-widget__stat">
          <div className="physical-letter-widget__stat-value physical-letter-widget__stat-value--success">{completionRate}%</div>
          <div className="physical-letter-widget__stat-label">완료율</div>
        </div>
      </div>

      <div className="physical-letter-widget__progress">
        <div className="physical-letter-widget__progress-label">
          배송 완료: {formatNumber(stats.delivered)} / {formatNumber(stats.total)}
        </div>
        <div className="physical-letter-widget__progress-bar">
          <div className="physical-letter-widget__progress-fill" style={{ width: `${completionRate}%` }} />
        </div>
      </div>

      <div className="physical-letter-widget__status-grid">
        <div className="physical-letter-widget__status-item">
          <span className="physical-letter-widget__status-dot physical-letter-widget__status-dot--requested"></span>
          <span className="physical-letter-widget__status-label">신청됨</span>
          <span className="physical-letter-widget__status-count">{formatNumber(stats.requested)}</span>
        </div>
        <div className="physical-letter-widget__status-item">
          <span className="physical-letter-widget__status-dot physical-letter-widget__status-dot--processing"></span>
          <span className="physical-letter-widget__status-label">처리중</span>
          <span className="physical-letter-widget__status-count">{formatNumber(stats.processing)}</span>
        </div>
        <div className="physical-letter-widget__status-item">
          <span className="physical-letter-widget__status-dot physical-letter-widget__status-dot--sent"></span>
          <span className="physical-letter-widget__status-label">발송됨</span>
          <span className="physical-letter-widget__status-count">{formatNumber(stats.sent)}</span>
        </div>
      </div>
    </div>
  );
}
