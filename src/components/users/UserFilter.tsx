import type { UserQueryParams } from "../../types";
import Input from "../common/Input";
import Select from "../common/Select";
import "./UserFilter.scss";

interface UserFilterProps {
  params: UserQueryParams;
  onChange: (params: UserQueryParams) => void;
}

const STATUS_OPTIONS = [
  { value: "", label: "전체 상태" },
  { value: "active", label: "활성" },
  { value: "banned", label: "정지" },
  { value: "deleted", label: "삭제됨" },
];

const SORT_OPTIONS = [
  { value: "createdAt", label: "가입일순" },
  { value: "name", label: "이름순" },
  { value: "email", label: "이메일순" },
];

export default function UserFilter({ params, onChange }: UserFilterProps) {
  return (
    <div className="user-filter">
      <Input placeholder="이름, 이메일 검색" value={params.search || ""} onChange={(e) => onChange({ ...params, search: e.target.value, page: 1 })} />
      <Select options={STATUS_OPTIONS} value={params.status || ""} onChange={(e) => onChange({ ...params, status: e.target.value as UserQueryParams["status"], page: 1 })} />
      <Select options={SORT_OPTIONS} value={params.sort || "createdAt"} onChange={(e) => onChange({ ...params, sort: e.target.value, page: 1 })} />
    </div>
  );
}
