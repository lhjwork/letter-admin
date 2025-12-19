import "./StatsCard.scss";

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: string;
  color?: "blue" | "green" | "purple" | "orange";
  subStats?: { label: string; value: number | string }[];
}

export default function StatsCard({ title, value, icon, color = "blue", subStats }: StatsCardProps) {
  return (
    <div className={`stats-card stats-card--${color}`}>
      <div className="stats-card__header">
        <span className="stats-card__icon">{icon}</span>
        <span className="stats-card__title">{title}</span>
      </div>
      <div className="stats-card__value">{value.toLocaleString()}</div>
      {subStats && (
        <div className="stats-card__sub">
          {subStats.map((stat, idx) => (
            <div key={idx} className="stats-card__sub-item">
              <span className="stats-card__sub-label">{stat.label}</span>
              <span className="stats-card__sub-value">{stat.value.toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
