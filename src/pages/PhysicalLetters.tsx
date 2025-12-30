import { usePhysicalLetterStats, usePhysicalLetterDashboard } from "../hooks/usePhysicalLetters";
import { usePermission } from "../hooks/usePermission";
import { PERMISSIONS } from "../types";
import { formatNumber } from "../utils/format";
import Loading from "../components/common/Loading";
import Button from "../components/common/Button";
import { Link } from "react-router-dom";
import "./PhysicalLetters.scss";

export default function PhysicalLetters() {
  const { hasPermission } = usePermission();
  const { data: statsData, isLoading: statsLoading } = usePhysicalLetterStats();
  const { data: dashboardData, isLoading: dashboardLoading } = usePhysicalLetterDashboard();

  const canRead = hasPermission(PERMISSIONS.LETTERS_READ);

  if (!canRead) {
    return (
      <div className="physical-letters">
        <div className="physical-letters__error">실물 편지 관리 권한이 없습니다</div>
      </div>
    );
  }

  if (statsLoading || dashboardLoading) return <Loading />;

  const stats = statsData?.data;
  const dashboard = dashboardData?.data;

  return (
    <div className="physical-letters">
      <div className="physical-letters__header">
        <h1 className="physical-letters__title">실물 편지 통계</h1>

        <div className="physical-letters__actions">
          <Link to="/letters/physical">
            <Button>📮 편지별 관리</Button>
          </Link>
          <Link to="/physical-letters/requests">
            <Button variant="secondary">📋 신청 목록 보기</Button>
          </Link>
        </div>
      </div>

      {/* 통계 카드 */}
      {stats && (
        <div className="physical-letters__stats-grid">
          <div className="physical-letters__stat-card">
            <div className="physical-letters__stat-icon">📋</div>
            <div className="physical-letters__stat-content">
              <div className="physical-letters__stat-value">{formatNumber(stats.total)}</div>
              <div className="physical-letters__stat-label">전체 편지</div>
            </div>
          </div>

          <div className="physical-letters__stat-card physical-letters__stat-card--warning">
            <div className="physical-letters__stat-icon">📝</div>
            <div className="physical-letters__stat-content">
              <div className="physical-letters__stat-value">{formatNumber(stats.requested)}</div>
              <div className="physical-letters__stat-label">신청됨</div>
            </div>
          </div>

          <div className="physical-letters__stat-card physical-letters__stat-card--info">
            <div className="physical-letters__stat-icon">✍️</div>
            <div className="physical-letters__stat-content">
              <div className="physical-letters__stat-value">{formatNumber(stats.writing)}</div>
              <div className="physical-letters__stat-label">작성중</div>
            </div>
          </div>

          <div className="physical-letters__stat-card physical-letters__stat-card--primary">
            <div className="physical-letters__stat-icon">📮</div>
            <div className="physical-letters__stat-content">
              <div className="physical-letters__stat-value">{formatNumber(stats.sent)}</div>
              <div className="physical-letters__stat-label">발송됨</div>
            </div>
          </div>

          <div className="physical-letters__stat-card physical-letters__stat-card--success">
            <div className="physical-letters__stat-icon">✅</div>
            <div className="physical-letters__stat-content">
              <div className="physical-letters__stat-value">{formatNumber(stats.delivered)}</div>
              <div className="physical-letters__stat-label">배송완료</div>
            </div>
          </div>

          {stats.totalRevenue && (
            <div className="physical-letters__stat-card physical-letters__stat-card--revenue">
              <div className="physical-letters__stat-icon">💰</div>
              <div className="physical-letters__stat-content">
                <div className="physical-letters__stat-value">{formatNumber(stats.totalRevenue)}원</div>
                <div className="physical-letters__stat-label">총 수익</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 최근 업데이트 */}
      {dashboard?.recentUpdates && dashboard.recentUpdates.length > 0 && (
        <div className="physical-letters__section">
          <h2 className="physical-letters__section-title">최근 업데이트</h2>
          <div className="physical-letters__recent-list">
            {dashboard.recentUpdates.map((update) => (
              <div key={update._id} className="physical-letters__recent-item">
                <div className="physical-letters__recent-info">
                  <div className="physical-letters__recent-title">{update.title}</div>
                  <div className="physical-letters__recent-author">작성자: {update.authorName}</div>
                </div>
                <div className="physical-letters__recent-status">
                  <span className={`physical-letters__status-badge physical-letters__status-badge--${update.currentStatus}`}>{getStatusLabel(update.currentStatus)}</span>
                  <div className="physical-letters__recent-count">{update.totalRequests}개 신청</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 대기 중인 편지 */}
      {dashboard?.pendingLetters && dashboard.pendingLetters.length > 0 && (
        <div className="physical-letters__section">
          <h2 className="physical-letters__section-title">처리 대기 중</h2>
          <div className="physical-letters__pending-list">
            {dashboard.pendingLetters.map((letter) => (
              <div key={letter._id} className="physical-letters__pending-item">
                <div className="physical-letters__pending-info">
                  <div className="physical-letters__pending-title">{letter.title}</div>
                  <div className="physical-letters__pending-author">작성자: {letter.authorName}</div>
                </div>
                <div className="physical-letters__pending-meta">
                  <div className="physical-letters__pending-count">{letter.totalRequests}개 신청</div>
                  <div className="physical-letters__pending-date">{letter.lastUpdatedAt && new Date(letter.lastUpdatedAt).toLocaleDateString("ko-KR")}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 처리 시간 통계 */}
      {dashboard?.processingTimeStats && (
        <div className="physical-letters__section">
          <h2 className="physical-letters__section-title">평균 처리 시간</h2>
          <div className="physical-letters__processing-stats">
            <div className="physical-letters__processing-item">
              <div className="physical-letters__processing-label">신청 → 작성</div>
              <div className="physical-letters__processing-value">{dashboard.processingTimeStats.averageRequestToWriting}일</div>
            </div>
            <div className="physical-letters__processing-item">
              <div className="physical-letters__processing-label">작성 → 발송</div>
              <div className="physical-letters__processing-value">{dashboard.processingTimeStats.averageWritingToSent}일</div>
            </div>
            <div className="physical-letters__processing-item">
              <div className="physical-letters__processing-label">발송 → 배송</div>
              <div className="physical-letters__processing-value">{dashboard.processingTimeStats.averageSentToDelivered}일</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function getStatusLabel(status: string): string {
  const labels = {
    none: "없음",
    requested: "신청됨",
    writing: "작성중",
    sent: "발송됨",
    delivered: "배송완료",
  };
  return labels[status as keyof typeof labels] || status;
}
