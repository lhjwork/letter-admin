import "./PriorityBadge.scss";

interface PriorityBadgeProps {
  priority: number;
}

export default function PriorityBadge({ priority }: PriorityBadgeProps) {
  const getPriorityInfo = (priority: number) => {
    if (priority >= 90) return { label: "최우선", color: "red" };
    if (priority >= 70) return { label: "높음", color: "orange" };
    if (priority >= 50) return { label: "보통", color: "blue" };
    if (priority >= 30) return { label: "낮음", color: "gray" };
    return { label: "최하위", color: "gray" };
  };

  const { label, color } = getPriorityInfo(priority);

  return (
    <div className="priority-badge">
      <span className="priority-badge__value">{priority}</span>
      <span className={`priority-badge__label priority-badge__label--${color}`}>
        {label}
      </span>
    </div>
  );
}