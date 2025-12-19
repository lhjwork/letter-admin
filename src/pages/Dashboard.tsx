import { useDashboard } from "../hooks/useDashboard";
import Loading from "../components/common/Loading";
import StatsCard from "../components/dashboard/StatsCard";
import RecentUsers from "../components/dashboard/RecentUsers";
import RecentLetters from "../components/dashboard/RecentLetters";
import "./Dashboard.scss";

export default function Dashboard() {
  const { data, isLoading, error } = useDashboard();

  if (isLoading) return <Loading />;
  if (error) return <div className="error">데이터를 불러오는데 실패했습니다</div>;

  const stats = data?.data;
  if (!stats) return null;

  return (
    <div className="dashboard">
      <h1 className="dashboard__title">대시보드</h1>

      <div className="dashboard__stats">
        <StatsCard
          title="전체 사용자"
          value={stats.users.total}
          icon="👥"
          color="blue"
          subStats={[
            { label: "오늘", value: stats.users.today },
            { label: "이번 주", value: stats.users.thisWeek },
            { label: "이번 달", value: stats.users.thisMonth },
          ]}
        />
        <StatsCard
          title="전체 편지/사연"
          value={stats.letters.total}
          icon="✉️"
          color="green"
          subStats={[
            { label: "사연", value: stats.letters.stories },
            { label: "편지", value: stats.letters.letters },
            { label: "오늘", value: stats.letters.today },
          ]}
        />
        <StatsCard
          title="사용자 상태"
          value={stats.users.byStatus.active}
          icon="✅"
          color="purple"
          subStats={[
            { label: "활성", value: stats.users.byStatus.active },
            { label: "정지", value: stats.users.byStatus.banned },
            { label: "삭제", value: stats.users.byStatus.deleted },
          ]}
        />
        <StatsCard
          title="편지 상태"
          value={stats.letters.byStatus.published}
          icon="📬"
          color="orange"
          subStats={[
            { label: "공개", value: stats.letters.byStatus.published },
            { label: "작성됨", value: stats.letters.byStatus.created },
            { label: "숨김", value: stats.letters.byStatus.hidden },
          ]}
        />
      </div>

      <div className="dashboard__recent">
        <RecentUsers users={stats.recentUsers} />
        <RecentLetters letters={stats.recentLetters} />
      </div>
    </div>
  );
}
