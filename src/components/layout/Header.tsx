import { Link } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import "./Header.scss";

const ROLE_LABELS: Record<string, string> = {
  super_admin: "최고 관리자",
  admin: "관리자",
  manager: "매니저",
};

export default function Header() {
  const { admin, logout } = useAuthStore();

  return (
    <header className="header">
      <div className="header__title">관리자 페이지</div>
      <div className="header__user">
        <span className="header__name">{admin?.name}</span>
        <span className="header__role">{ROLE_LABELS[admin?.role || ""]}</span>
        <Link to="/change-password" className="header__link">
          비밀번호 변경
        </Link>
        <button onClick={logout} className="header__logout">
          로그아웃
        </button>
      </div>
    </header>
  );
}
