import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useMe } from "../../hooks/useAuth";
import "./AdminLayout.scss";

export default function AdminLayout() {
  useMe();
  return (
    <div className="admin-layout">
      <Sidebar />
      <div className="admin-layout__main">
        <Header />
        <main className="admin-layout__content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
