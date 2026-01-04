import { NavLink } from "react-router-dom";
import { usePermission } from "../../hooks/usePermission";
import { PERMISSIONS } from "../../types";
import "./Sidebar.scss";

export default function Sidebar() {
  const { isSuperAdmin, hasPermission } = usePermission();

  const menuItems = [
    {
      path: "/dashboard",
      label: "대시보드",
      icon: "📊",
      show: hasPermission(PERMISSIONS.DASHBOARD_READ),
    },
    {
      path: "/admins",
      label: "관리자 관리",
      icon: "👑",
      show: isSuperAdmin,
    },
    {
      path: "/users",
      label: "사용자 관리",
      icon: "👥",
      show: hasPermission(PERMISSIONS.USERS_READ),
    },
    {
      path: "/letters",
      label: "편지/사연 관리",
      icon: "✉️",
      show: hasPermission(PERMISSIONS.LETTERS_READ),
    },
    {
      path: "/physical-letters",
      label: "실물 편지 관리",
      icon: "📮",
      show: hasPermission(PERMISSIONS.LETTERS_READ),
    },
    {
      path: "/ads",
      label: "광고 관리",
      icon: "📢",
      show: hasPermission(PERMISSIONS.LETTERS_READ),
    },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar__logo">
        <h1>Letter Admin</h1>
      </div>
      <nav className="sidebar__nav">
        {menuItems
          .filter((item) => item.show)
          .map((item) => (
            <NavLink key={item.path} to={item.path} className={({ isActive }) => `sidebar__link ${isActive ? "sidebar__link--active" : ""}`}>
              <span className="sidebar__icon">{item.icon}</span>
              <span className="sidebar__label">{item.label}</span>
            </NavLink>
          ))}
      </nav>
    </aside>
  );
}
