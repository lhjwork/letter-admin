import "./Pagination.scss";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages: (number | string)[] = [];
  const showPages = 5;
  let start = Math.max(1, page - Math.floor(showPages / 2));
  const end = Math.min(totalPages, start + showPages - 1);

  if (end - start + 1 < showPages) {
    start = Math.max(1, end - showPages + 1);
  }

  if (start > 1) {
    pages.push(1);
    if (start > 2) pages.push("...");
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (end < totalPages) {
    if (end < totalPages - 1) pages.push("...");
    pages.push(totalPages);
  }

  return (
    <div className="pagination">
      <button className="pagination__btn" onClick={() => onPageChange(page - 1)} disabled={page === 1}>
        이전
      </button>
      {pages.map((p, idx) =>
        typeof p === "number" ? (
          <button key={idx} className={`pagination__btn ${p === page ? "pagination__btn--active" : ""}`} onClick={() => onPageChange(p)}>
            {p}
          </button>
        ) : (
          <span key={idx} className="pagination__ellipsis">
            {p}
          </span>
        )
      )}
      <button className="pagination__btn" onClick={() => onPageChange(page + 1)} disabled={page === totalPages}>
        다음
      </button>
    </div>
  );
}
