import { useState } from "react";
import { useUserLetters } from "../../hooks/useUsers";
import { Letter, LetterStatus } from "../../types";
import { formatDate, formatNumber } from "../../utils/format";
import Select from "../common/Select";
import Pagination from "../common/Pagination";
import Loading from "../common/Loading";
import "./UserLetters.scss";

interface UserLettersProps {
  userId: string;
}

export default function UserLetters({ userId }: UserLettersProps) {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const limit = 10;

  const { data, isLoading, error } = useUserLetters(userId, { page, limit, status: status || undefined });

  const statusOptions = [
    { value: "", label: "전체 상태" },
    { value: "created", label: "작성됨" },
    { value: "published", label: "게시됨" },
    { value: "hidden", label: "숨김" },
    { value: "deleted", label: "삭제됨" },
  ];

  const getStatusBadge = (status: LetterStatus) => {
    const statusMap = {
      created: { label: "작성됨", className: "created" },
      published: { label: "게시됨", className: "published" },
      hidden: { label: "숨김", className: "hidden" },
      deleted: { label: "삭제됨", className: "deleted" },
    };
    return statusMap[status] || { label: "알 수 없음", className: "unknown" };
  };

  const getTypeBadge = (type: string) => {
    if (type === "story") return { label: "스토리", className: "story" };
    if (type === "letter") return { label: "편지", className: "letter" };
    return { label: "기타", className: "other" };
  };

  if (isLoading) return <Loading />;

  if (error) {
    return (
      <div className="user-letters">
        <div className="user-letters__header">
          <h3 className="user-letters__title">편지 목록</h3>
        </div>
        <div className="user-letters__error">
          <p>편지 목록을 불러올 수 없습니다.</p>
          <p className="user-letters__error-hint">백엔드 API가 구현되지 않았을 수 있습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="user-letters">
      <div className="user-letters__header">
        <h3 className="user-letters__title">편지 목록</h3>
        <Select value={status} onChange={(e) => setStatus(e.target.value)} options={statusOptions} className="user-letters__filter" />
      </div>

      {data?.data && data.data.length > 0 ? (
        <>
          <div className="user-letters__list">
            {data.data.map((letter: Letter) => (
              <div key={letter._id} className="user-letters__item">
                <div className="user-letters__item-header">
                  <h4 className="user-letters__item-title">{letter.title || "제목 없음"}</h4>
                  <div className="user-letters__item-badges">
                    <span className={`user-letters__badge user-letters__badge--${getTypeBadge(letter.type || "").className}`}>{getTypeBadge(letter.type || "").label}</span>
                    <span className={`user-letters__badge user-letters__badge--${getStatusBadge(letter.status).className}`}>{getStatusBadge(letter.status).label}</span>
                  </div>
                </div>

                <div className="user-letters__item-content">
                  <p className="user-letters__item-excerpt">{letter.content && letter.content.length > 100 ? `${letter.content.substring(0, 100)}...` : letter.content || "내용 없음"}</p>
                </div>

                <div className="user-letters__item-meta">
                  <div className="user-letters__item-info">
                    <span className="user-letters__item-category">{letter.category || "기타"}</span>
                    <span className="user-letters__item-author">작성자: {letter.authorName || "알 수 없음"}</span>
                  </div>
                  <div className="user-letters__item-stats">
                    <span className="user-letters__item-stat">👁️ {formatNumber(letter.viewCount || 0)}</span>
                    <span className="user-letters__item-stat">❤️ {formatNumber(letter.likeCount || 0)}</span>
                  </div>
                  <div className="user-letters__item-date">{letter.createdAt ? formatDate(letter.createdAt) : "날짜 없음"}</div>
                </div>
              </div>
            ))}
          </div>

          {data.pagination && <Pagination page={data.pagination.page} totalPages={data.pagination.totalPages} onPageChange={setPage} />}
        </>
      ) : (
        <div className="user-letters__empty">{status ? "해당 상태의 편지가 없습니다" : "작성한 편지가 없습니다"}</div>
      )}
    </div>
  );
}
