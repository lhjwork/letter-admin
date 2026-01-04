import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { subDays, format } from "date-fns";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend, BarChart, Bar,
} from "recharts";
import { QRCodeSVG } from "qrcode.react";
import { useAdStats } from "../hooks/useAds";
import Button from "../components/common/Button";
import Loading from "../components/common/Loading";
import "./AdStats.scss";

const COLORS = ["#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

const sourceLabels: Record<string, string> = {
  qr: "QR 코드",
  direct: "직접 접속",
  link: "편지 링크",
  social: "소셜",
  referral: "외부 사이트",
  other: "기타",
};

const deviceLabels: Record<string, string> = {
  mobile: "모바일",
  tablet: "태블릿",
  desktop: "데스크톱",
};

export default function AdStats() {
  const { id } = useParams<{ id: string }>();
  const [dateRange, setDateRange] = useState({
    start: subDays(new Date(), 30),
    end: new Date(),
  });

  const { data, isLoading } = useAdStats(id || "", {
    startDate: dateRange.start.toISOString(),
    endDate: dateRange.end.toISOString(),
  });

  const stats = data?.data;
  const APP_URL = import.meta.env.VITE_APP_URL || "https://letter.community";
  const qrUrl = stats?.ad?.slug
    ? `${APP_URL}/ad/${stats.ad.slug}?utm_source=qr&utm_medium=offline`
    : "";

  const copyToClipboard = () => {
    navigator.clipboard.writeText(qrUrl);
    alert("URL이 복사되었습니다!");
  };

  if (isLoading) return <Loading />;
  if (!stats) return <div className="ad-stats__empty">광고를 찾을 수 없습니다</div>;

  return (
    <div className="ad-stats">
      <div className="ad-stats__header">
        <div>
          <h1 className="ad-stats__title">{stats.ad.name}</h1>
          <p className="ad-stats__subtitle">광고 통계</p>
        </div>
        <div className="ad-stats__date-buttons">
          <button
            className="ad-stats__date-btn"
            onClick={() => setDateRange({ start: subDays(new Date(), 7), end: new Date() })}
          >
            7일
          </button>
          <button
            className="ad-stats__date-btn"
            onClick={() => setDateRange({ start: subDays(new Date(), 30), end: new Date() })}
          >
            30일
          </button>
          <Link to={`/ads/${id}`}>
            <Button variant="secondary" size="sm">수정</Button>
          </Link>
        </div>
      </div>

      <div className="ad-stats__summary">
        <div className="ad-stats__card">
          <span className="ad-stats__card-label">노출수</span>
          <span className="ad-stats__card-value">{stats.summary.impressions.toLocaleString()}</span>
        </div>
        <div className="ad-stats__card">
          <span className="ad-stats__card-label">클릭수</span>
          <span className="ad-stats__card-value ad-stats__card-value--blue">
            {stats.summary.clicks.toLocaleString()}
          </span>
        </div>
        <div className="ad-stats__card">
          <span className="ad-stats__card-label">CTR</span>
          <span className="ad-stats__card-value ad-stats__card-value--green">{stats.summary.ctr}%</span>
        </div>
        <div className="ad-stats__card">
          <span className="ad-stats__card-label">고유 방문자</span>
          <span className="ad-stats__card-value">{stats.summary.uniqueVisitors.toLocaleString()}</span>
        </div>
        <div className="ad-stats__card">
          <span className="ad-stats__card-label">평균 체류시간</span>
          <span className="ad-stats__card-value">{stats.summary.avgDwellTime}초</span>
        </div>
      </div>

      <div className="ad-stats__charts">
        <div className="ad-stats__chart ad-stats__chart--full">
          <h3 className="ad-stats__chart-title">일별 추이</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.daily}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={(v) => format(new Date(v), "MM/dd")} />
              <YAxis />
              <Tooltip labelFormatter={(v) => format(new Date(v), "yyyy-MM-dd")} />
              <Legend />
              <Line type="monotone" dataKey="impressions" name="노출" stroke="#8b5cf6" strokeWidth={2} />
              <Line type="monotone" dataKey="clicks" name="클릭" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="ad-stats__chart">
          <h3 className="ad-stats__chart-title">유입 경로</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={stats.bySource.map((s) => ({
                  name: sourceLabels[s._id] || s._id,
                  value: s.count,
                }))}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
              >
                {stats.bySource.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="ad-stats__chart">
          <h3 className="ad-stats__chart-title">기기별</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={stats.byDevice.map((d) => ({
              name: deviceLabels[d._id] || d._id,
              count: d.count,
            }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#8b5cf6" name="방문수" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="ad-stats__qr">
        <h3 className="ad-stats__qr-title">📱 QR 코드</h3>
        <div className="ad-stats__qr-content">
          <div className="ad-stats__qr-code">
            <QRCodeSVG value={qrUrl} size={200} />
          </div>
          <div className="ad-stats__qr-info">
            <h4>QR 코드 URL</h4>
            <div className="ad-stats__qr-url">{qrUrl}</div>
            <p className="ad-stats__qr-desc">
              이 QR 코드를 실물 편지에 인쇄하세요. 스캔 시 광고 랜딩 페이지로 이동합니다.
            </p>
            <Button onClick={copyToClipboard}>URL 복사</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
