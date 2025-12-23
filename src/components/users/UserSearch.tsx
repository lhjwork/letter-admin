import { useState, useEffect } from "react";
import { useSearchUsers } from "../../hooks/useUsers";
import { User } from "../../types";
import Input from "../common/Input";
import Select from "../common/Select";
import Loading from "../common/Loading";
import "./UserSearch.scss";

interface UserSearchProps {
  onSelectUser: (user: User) => void;
  placeholder?: string;
  className?: string;
}

export default function UserSearch({ onSelectUser, placeholder = "사용자 검색...", className }: UserSearchProps) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [showResults, setShowResults] = useState(false);

  const { data, isLoading } = useSearchUsers(query, { limit: 10, status: status || undefined });

  useEffect(() => {
    setShowResults(query.length > 0);
  }, [query]);

  const handleSelectUser = (user: User) => {
    onSelectUser(user);
    setQuery("");
    setShowResults(false);
  };

  const statusOptions = [
    { value: "", label: "전체 상태" },
    { value: "active", label: "활성" },
    { value: "banned", label: "정지" },
    { value: "deleted", label: "삭제" },
  ];

  return (
    <div className={`user-search ${className || ""}`}>
      <div className="user-search__filters">
        <Input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={placeholder} className="user-search__input" />
        <Select value={status} onChange={(e) => setStatus(e.target.value)} options={statusOptions} className="user-search__status" />
      </div>

      {showResults && (
        <div className="user-search__results">
          {isLoading ? (
            <div className="user-search__loading">
              <Loading />
            </div>
          ) : data?.data && data.data.length > 0 ? (
            <ul className="user-search__list">
              {data.data.map((user) => (
                <li key={user._id} className="user-search__item" onClick={() => handleSelectUser(user)}>
                  <div className="user-search__user">
                    {user.image && <img src={user.image} alt={user.name} className="user-search__avatar" />}
                    <div className="user-search__info">
                      <div className="user-search__name">{user.name}</div>
                      <div className="user-search__email">{user.email}</div>
                    </div>
                    <div className={`user-search__status user-search__status--${user.status}`}>{user.status === "active" ? "활성" : user.status === "banned" ? "정지" : "삭제"}</div>
                  </div>
                </li>
              ))}
            </ul>
          ) : query.length > 0 ? (
            <div className="user-search__empty">검색 결과가 없습니다</div>
          ) : null}
        </div>
      )}
    </div>
  );
}
