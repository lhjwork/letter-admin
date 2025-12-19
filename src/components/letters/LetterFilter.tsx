import type { LetterQueryParams } from "../../types";
import { CATEGORY_OPTIONS } from "../../utils/constants";
import Input from "../common/Input";
import Select from "../common/Select";
import "./LetterFilter.scss";

interface LetterFilterProps {
  params: LetterQueryParams;
  onChange: (params: LetterQueryParams) => void;
}

const TYPE_OPTIONS = [
  { value: "", label: "전체 유형" },
  { value: "story", label: "사연" },
  { value: "letter", label: "편지" },
];

const STATUS_OPTIONS = [
  { value: "", label: "전체 상태" },
  { value: "created", label: "작성됨" },
  { value: "published", label: "공개" },
  { value: "hidden", label: "숨김" },
  { value: "deleted", label: "삭제됨" },
];

export default function LetterFilter({ params, onChange }: LetterFilterProps) {
  return (
    <div className="letter-filter">
      <Input placeholder="제목, 작성자 검색" value={params.search || ""} onChange={(e) => onChange({ ...params, search: e.target.value, page: 1 })} />
      <Select options={TYPE_OPTIONS} value={params.type || ""} onChange={(e) => onChange({ ...params, type: e.target.value as LetterQueryParams["type"], page: 1 })} />
      <Select options={CATEGORY_OPTIONS} value={params.category || ""} onChange={(e) => onChange({ ...params, category: e.target.value as LetterQueryParams["category"], page: 1 })} />
      <Select options={STATUS_OPTIONS} value={params.status || ""} onChange={(e) => onChange({ ...params, status: e.target.value as LetterQueryParams["status"], page: 1 })} />
    </div>
  );
}
