import { useNavigate } from "react-router-dom";
import type { Letter } from "../../types";
import Table from "../common/Table";
import { LETTER_TYPE_LABELS, LETTER_STATUS_LABELS } from "../../utils/constants";
import { formatDate } from "../../utils/format";
import "./LetterTable.scss";

interface LetterTableProps {
  letters: Letter[];
  loading?: boolean;
}

export default function LetterTable({ letters, loading }: LetterTableProps) {
  const navigate = useNavigate();

  const columns = [
    {
      key: "type",
      header: "유형",
      width: "80px",
      render: (letter: Letter) => <span className={`letter-type letter-type--${letter.type}`}>{LETTER_TYPE_LABELS[letter.type]}</span>,
    },
    {
      key: "title",
      header: "제목",
      render: (letter: Letter) => <span className="letter-title">{letter.title}</span>,
    },
    { key: "authorName", header: "작성자" },
    { key: "category", header: "카테고리" },
    {
      key: "status",
      header: "상태",
      render: (letter: Letter) => <span className={`letter-status letter-status--${letter.status}`}>{LETTER_STATUS_LABELS[letter.status]}</span>,
    },
    {
      key: "stats",
      header: "조회/좋아요",
      render: (letter: Letter) => `${letter.viewCount} / ${letter.likeCount}`,
    },
    { key: "createdAt", header: "작성일", render: (letter: Letter) => formatDate(letter.createdAt) },
  ];

  return (
    <Table columns={columns} data={letters} keyExtractor={(letter) => letter._id} onRowClick={(letter) => navigate(`/letters/${letter._id}`)} loading={loading} emptyMessage="편지/사연이 없습니다" />
  );
}
