import { useState } from "react";
import { useDashboardStats } from "../../hooks/usePhysicalLetters";
import { formatNumber, formatDate } from "../../utils/format";
import Button from "../common/Button";
import Loading from "../common/Loading";
import "./PhysicalLetterDashboard.scss";

interface DashboardStats {
  totalRequests: number;
  pendingRequests: number;
  completedRequests: number;
  totalRevenue: number;
  popularLetters: Array<{
    letterId: string;
    title: string;
    requestCount: number;
    totalRevenue: number;
  }>;
  recentRequests: Array<{
    id: string;
    letterId: string;
    letterTitle: string;
    recipientName: string;
    status: string;
    cost: number;
    createdAt: string;
  }>;
}

export default function PhysicalLetterDashboard() {
  const [dateRange, setDateRange] = useState("7d");
  const { data: statsData, isLoading } = useDashboardStats();

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      requested: { label: "신청됨", className: "requested" },
      confirmed: { label: "확인됨", className: "confirmed" },
      processing: { label: "처리중", className: "processing" },
      writing: { label: "작성중", className: "writing" },
      sent: { label: "발송됨", className: "sent" },
      delivered: { label: "배송완료", className: "delivered" },
      cancelled: { label: "취소됨", className: "cancelled" },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.requested;
    return <span className={`dashboard__status-badge dashboard__status-badge--${config.className}`}>{config.label}</span>;
  };

  if (isLoading) {
    return <Loading />;
  }

  const stats = statsData?.data;
  if (!stats) return null;

  // Transform stats to match dashboard format
  const dashboardStats: DashboardStats = {
    totalRequests: stats.total || 0,
    pendingRequests: stats.pendingRequests || 0,
    completedRequests: stats.completedRequests || 0,
    totalRevenue: stats.totalRevenue || 0,
    popularLetters: [], // This would come from a separate API call
    recentRequests: [], // This would come from a separate API call
  };

  return (
    <div className="physical-letter-dashboard">
      <div className="physical-letter-dashboard__header">
        <h1 className="physical-letter-dashboard__title">실물 편지 관리</h1>
        <div className="physical-letter-dashboard__date-filters">
          <Button variant={dateRange === "7d" ? "primary" : "secondary"} size="sm" onClick={() => setDateRange("7d")}>
            7일
          </Button>
          <Button variant={dateRange === "30d" ? "primary" : "secondary"} size="sm" onClick={() => setDateRange("30d")}>
            30일
          </Button>
          <Button variant={dateRange === "90d" ? "primary" : "secondary"} size="sm" onClick={() => setDateRange("90d")}>
            90일
          </Button>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="physical-letter-dashboard__stats-grid">
        <div className="physical-letter-dashboard__stat-card">
          <div className="physical-letter-dashboard__stat-header">
            <span className="physical-letter-dashboard__stat-label">총 신청</span>
          </div>
          <div className="physical-letter-dashboard__stat-value">{formatNumber(dashboardStats.totalRequests)}</div>
        </div>

        <div className="physical-letter-dashboard__stat-card physical-letter-dashboard__stat-card--warning">
          <div className="physical-letter-dashboard__stat-header">
            <span className="physical-letter-dashboard__stat-label">대기 중</span>
          </div>
          <div className="physical-letter-dashboard__stat-value">{formatNumber(dashboardStats.pendingRequests)}</div>
        </div>

        <div className="physical-letter-dashboard__stat-card physical-letter-dashboard__stat-card--success">
          <div className="physical-letter-dashboard__stat-header">
            <span className="physical-letter-dashboard__stat-label">완료</span>
          </div>
          <div className="physical-letter-dashboard__stat-value">{formatNumber(dashboardStats.completedRequests)}</div>
        </div>

        <div className="physical-letter-dashboard__stat-card physical-letter-dashboard__stat-card--info">
          <div className="physical-letter-dashboard__stat-header">
            <span className="physical-letter-dashboard__stat-label">총 수익</span>
          </div>
          <div className="physical-letter-dashboard__stat-value">{formatNumber(dashboardStats.totalRevenue)}원</div>
        </div>
      </div>

      <div className="physical-letter-dashboard__content-grid">
        {/* 인기 편지 */}
        <div className="physical-letter-dashboard__card">
          <div className="physical-letter-dashboard__card-header">
            <h3 className="physical-letter-dashboard__card-title">인기 편지</h3>
          </div>
          <div className="physical-letter-dashboard__card-content">
            {dashboardStats.popularLetters.length > 0 ? (
              <div className="physical-letter-dashboard__popular-list">
                {dashboardStats.popularLetters.map((letter, index) => (
                  <div key={letter.letterId} className="physical-letter-dashboard__popular-item">
                    <div className="physical-letter-dashboard__popular-rank">{index + 1}</div>
                    <div className="physical-letter-dashboard__popular-info">
                      <div className="physical-letter-dashboard__popular-title">{letter.title}</div>
                      <div className="physical-letter-dashboard__popular-stats">{letter.requestCount}건 신청</div>
                    </div>
                    <div className="physical-letter-dashboard__popular-revenue">{formatNumber(letter.totalRevenue)}원</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="physical-letter-dashboard__empty">인기 편지 데이터가 없습니다</div>
            )}
          </div>
        </div>

        {/* 최근 신청 */}
        <div className="physical-letter-dashboard__card">
          <div className="physical-letter-dashboard__card-header">
            <h3 className="physical-letter-dashboard__card-title">최근 신청</h3>
          </div>
          <div className="physical-letter-dashboard__card-content">
            {dashboardStats.recentRequests.length > 0 ? (
              <div className="physical-letter-dashboard__recent-list">
                {dashboardStats.recentRequests.map((request) => (
                  <div key={request.id} className="physical-letter-dashboard__recent-item">
                    <div className="physical-letter-dashboard__recent-info">
                      <div className="physical-letter-dashboard__recent-title">{request.letterTitle}</div>
                      <div className="physical-letter-dashboard__recent-meta">
                        {request.recipientName} • {formatDate(request.createdAt)}
                      </div>
                    </div>
                    <div className="physical-letter-dashboard__recent-status">
                      {getStatusBadge(request.status)}
                      <div className="physical-letter-dashboard__recent-cost">{formatNumber(request.cost)}원</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="physical-letter-dashboard__empty">최근 신청이 없습니다</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
