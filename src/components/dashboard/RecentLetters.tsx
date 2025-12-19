import { Link } from "react-router-dom";
import type { Letter } from "../../types";
import { formatDate } from "../../utils/format";
import "./RecentLetters.scss";

interface RecentLettersProps {
  letters: Letter[];
}

const TYPE_LABELS: Record<string, string> = {
  story: "사연",
  letter: "편지",
};

export default function RecentLetters({ letters }: RecentLettersProps) {
  return (
    <div className="recent-letters">
      <h3 className="recent-letters__title">최근 편지/사연</h3>
      <div className="recent-letters__list">
        {letters.length === 0 ? (
          <p className="recent-letters__empty">최근 편지/사연이 없습니다</p>
        ) : (
          letters.map((letter) => (
            <Link key={letter._id} to={`/letters/${letter._id}`} className="recent-letters__item">
              <div className="recent-letters__header">
                <span className={`recent-letters__type recent-letters__type--${letter.type}`}>{TYPE_LABELS[letter.type]}</span>
                <span className="recent-letters__category">{letter.category}</span>
              </div>
              <h4 className="recent-letters__item-title">{letter.title}</h4>
              <div className="recent-letters__meta">
                <span>{letter.authorName}</span>
                <span>{formatDate(letter.createdAt)}</span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
