import type { Letter } from "../../types";
import { LETTER_TYPE_LABELS, LETTER_STATUS_LABELS } from "../../utils/constants";
import { formatDateTime } from "../../utils/format";
import "./LetterDetail.scss";

interface LetterDetailProps {
  letter: Letter;
}

export default function LetterDetail({ letter }: LetterDetailProps) {
  return (
    <div className="letter-detail">
      <div className="letter-detail__header">
        <span className={`letter-type letter-type--${letter.type}`}>{LETTER_TYPE_LABELS[letter.type]}</span>
        <span className="letter-detail__category">{letter.category}</span>
        <span className={`letter-status letter-status--${letter.status}`}>{LETTER_STATUS_LABELS[letter.status]}</span>
      </div>

      <h2 className="letter-detail__title">{letter.title}</h2>

      <div className="letter-detail__meta">
        <span>작성자: {letter.authorName}</span>
        <span>조회 {letter.viewCount}</span>
        <span>좋아요 {letter.likeCount}</span>
      </div>

      <div className="letter-detail__content">
        {letter.content.split("\n").map((line, idx) => (
          <p key={idx}>{line || <br />}</p>
        ))}
      </div>

      {letter.status === "hidden" && (
        <div className="letter-detail__warning">
          <h4>숨김 정보</h4>
          <p>
            <strong>숨김일:</strong> {letter.hiddenAt ? formatDateTime(letter.hiddenAt) : "-"}
          </p>
          <p>
            <strong>사유:</strong> {letter.hiddenReason || "-"}
          </p>
        </div>
      )}

      <div className="letter-detail__info">
        <p>
          <strong>작성일:</strong> {formatDateTime(letter.createdAt)}
        </p>
        <p>
          <strong>수정일:</strong> {formatDateTime(letter.updatedAt)}
        </p>
      </div>
    </div>
  );
}
