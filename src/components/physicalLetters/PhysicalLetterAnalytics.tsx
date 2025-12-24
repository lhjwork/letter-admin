import { useState, useEffect } from "react";
import { useStatistics } from "../../hooks/usePhysicalLetters";
import { formatNumber } from "../../utils/format";
import Button from "../common/Button";
import Loading from "../common/Loading";
import "./PhysicalLetterAnalytics.scss";

interface AnalyticsData {
  dailyStats: Array<{
    date: string;
    requests: number;
    revenue: number;
  }>;
  regionStats: Array<{
    region: string;
    count: number;
    percentage: number;
  }>;
  statusDistribution: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
  averageProcessingTime: number;
  topPerformingLetters: Array<{
    letterId: string;
    title: string;
    requestCount: number;
    conversionRate: number;
  }>;
}

export default function PhysicalLetterAnalytics() {
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 30일 전
    end: new Date().toISOString().split("T")[0], // 오늘
  });

  const { data: analyticsData, isLoading } = useStatistics(dateRange);

  const getStatusLabel = (status: string): string => {
    const labels = {
      requested: "신청됨",
      confirmed: "확인됨",
      processing: "처리중",
      writing: "작성중",
      sent: "발송됨",
      delivered: "배송완료",
      cancelled: "취소됨",
    };
    return labels[status as keyof typeof labels] || status;
  };

  const setQuickDateRange = (days: number) => {
    const end = new Date().toISOString().split("T")[0];
    const start = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    setDateRange({ start, end });
  };

  if (isLoading) {
    return <Loading />;
  }

  const analytics = analyticsData?.data;
  if (!analytics) {
    return (
      <div className="physical-letter-analytics">
        <div className="physical-letter-analytics__header">
          <h1 className="physical-letter-analytics__title">실물 편지 분석</h1>
        </div>
        <div className="physical-letter-analytics__empty">분석 데이터를 불러올 수 없습니다.</div>
      </div>
    );
  }

  return (
    <div className="physical-letter-analytics">
      <div className="physical-letter-analytics__header">
        <h1 className="physical-letter-analytics__title">실물 편지 분석</h1>
        <div className="physical-letter-analytics__date-controls">
          <div className="physical-letter-analytics__quick-buttons">
            <Button size="sm" variant="secondary" onClick={() => setQuickDateRange(7)}>
              7일
            </Button>
            <Button size="sm" variant="secondary" onClick={() => setQuickDateRange(30)}>
              30일
            </Button>
            <Button size="sm" variant="secondary" onClick={() => setQuickDateRange(90)}>
              90일
            </Button>
          </div>
          <div className="physical-letter-analytics__date-inputs">
            <input type="date" value={dateRange.start} onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })} className="physical-letter-analytics__date-input" />
            <span>~</span>
            <input type="date" value={dateRange.end} onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })} className="physical-letter-analytics__date-input" />
          </div>
        </div>
      </div>

      <div className="physical-letter-analytics__grid">
        {/* 지역별 통계 */}
        <div className="physical-letter-analytics__card">
          <div className="physical-letter-analytics__card-header">
            <h3 className="physical-letter-analytics__card-title">지역별 신청 현황</h3>
          </div>
          <div className="physical-letter-analytics__card-content">
            {analytics.regionDistribution && analytics.regionDistribution.length > 0 ? (
              <div className="physical-letter-analytics__region-list">
                {analytics.regionDistribution.map((region) => (
                  <div key={region.region} className="physical-letter-analytics__region-item">
                    <div className="physical-letter-analytics__region-info">
                      <span className="physical-letter-analytics__region-name">{region.region}</span>
                    </div>
                    <div className="physical-letter-analytics__region-stats">
                      <div className="physical-letter-analytics__progress-bar">
                        <div className="physical-letter-analytics__progress-fill" style={{ width: `${(region.count / Math.max(...analytics.regionDistribution.map((r) => r.count))) * 100}%` }} />
                      </div>
                      <span className="physical-letter-analytics__region-count">{formatNumber(region.count)}건</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="physical-letter-analytics__empty-state">지역별 데이터가 없습니다</div>
            )}
          </div>
        </div>

        {/* 상태별 분포 */}
        <div className="physical-letter-analytics__card">
          <div className="physical-letter-analytics__card-header">
            <h3 className="physical-letter-analytics__card-title">처리 상태 분포</h3>
          </div>
          <div className="physical-letter-analytics__card-content">
            {analytics.statusDistribution && analytics.statusDistribution.length > 0 ? (
              <div className="physical-letter-analytics__status-list">
                {analytics.statusDistribution.map((status) => (
                  <div key={status.status} className="physical-letter-analytics__status-item">
                    <div className="physical-letter-analytics__status-info">
                      <span className="physical-letter-analytics__status-name">{getStatusLabel(status.status)}</span>
                    </div>
                    <div className="physical-letter-analytics__status-stats">
                      <div className="physical-letter-analytics__progress-bar">
                        <div className="physical-letter-analytics__progress-fill physical-letter-analytics__progress-fill--status" style={{ width: `${status.percentage}%` }} />
                      </div>
                      <span className="physical-letter-analytics__status-count">
                        {formatNumber(status.count)}건 ({status.percentage}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="physical-letter-analytics__empty-state">상태별 데이터가 없습니다</div>
            )}
          </div>
        </div>

        {/* 인기 편지 TOP 10 */}
        <div className="physical-letter-analytics__card physical-letter-analytics__card--wide">
          <div className="physical-letter-analytics__card-header">
            <h3 className="physical-letter-analytics__card-title">인기 편지 TOP 10</h3>
          </div>
          <div className="physical-letter-analytics__card-content">
            {analytics.topPerformingLetters && analytics.topPerformingLetters.length > 0 ? (
              <div className="physical-letter-analytics__top-letters">
                {analytics.topPerformingLetters.slice(0, 10).map((letter, index) => (
                  <div key={letter.letterId} className="physical-letter-analytics__top-letter-item">
                    <div className="physical-letter-analytics__letter-rank">{index + 1}</div>
                    <div className="physical-letter-analytics__letter-info">
                      <div className="physical-letter-analytics__letter-title">{letter.title}</div>
                      <div className="physical-letter-analytics__letter-stats">전환율: {letter.conversionRate}%</div>
                    </div>
                    <div className="physical-letter-analytics__letter-count">{formatNumber(letter.requestCount)}건</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="physical-letter-analytics__empty-state">인기 편지 데이터가 없습니다</div>
            )}
          </div>
        </div>

        {/* 평균 처리 시간 */}
        <div className="physical-letter-analytics__card">
          <div className="physical-letter-analytics__card-header">
            <h3 className="physical-letter-analytics__card-title">평균 처리 시간</h3>
          </div>
          <div className="physical-letter-analytics__card-content">
            <div className="physical-letter-analytics__processing-time">
              <div className="physical-letter-analytics__processing-value">{analytics.averageProcessingTime || 0}일</div>
              <div className="physical-letter-analytics__processing-label">신청부터 발송까지</div>
            </div>
          </div>
        </div>

        {/* 수익 정보 */}
        {analytics.revenue && (
          <div className="physical-letter-analytics__card">
            <div className="physical-letter-analytics__card-header">
              <h3 className="physical-letter-analytics__card-title">수익 현황</h3>
            </div>
            <div className="physical-letter-analytics__card-content">
              <div className="physical-letter-analytics__revenue-stats">
                <div className="physical-letter-analytics__revenue-item">
                  <div className="physical-letter-analytics__revenue-label">총 수익</div>
                  <div className="physical-letter-analytics__revenue-value">{formatNumber(analytics.revenue.total)}원</div>
                </div>
                <div className="physical-letter-analytics__revenue-item">
                  <div className="physical-letter-analytics__revenue-label">이번 달</div>
                  <div className="physical-letter-analytics__revenue-value">{formatNumber(analytics.revenue.thisMonth)}원</div>
                </div>
                <div className="physical-letter-analytics__revenue-item">
                  <div className="physical-letter-analytics__revenue-label">성장률</div>
                  <div
                    className={`physical-letter-analytics__revenue-value ${
                      analytics.revenue.growth >= 0 ? "physical-letter-analytics__revenue-value--positive" : "physical-letter-analytics__revenue-value--negative"
                    }`}
                  >
                    {analytics.revenue.growth >= 0 ? "+" : ""}
                    {analytics.revenue.growth}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
