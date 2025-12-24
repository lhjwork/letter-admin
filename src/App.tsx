import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuthStore } from "./stores/authStore";
import { usePermission } from "./hooks/usePermission";
import AdminLayout from "./components/layout/AdminLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Admins from "./pages/Admins";
import AdminDetailPage from "./pages/AdminDetail";
import Users from "./pages/Users";
import UserDetailPage from "./pages/UserDetail";
import Letters from "./pages/Letters";
import LetterDetailPage from "./pages/LetterDetail";
import PhysicalLetters from "./pages/PhysicalLetters";
import ChangePassword from "./pages/ChangePassword";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function SuperAdminRoute({ children }: { children: React.ReactNode }) {
  const { isSuperAdmin } = usePermission();
  if (!isSuperAdmin) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route
          path="admins"
          element={
            <SuperAdminRoute>
              <Admins />
            </SuperAdminRoute>
          }
        />
        <Route
          path="admins/:id"
          element={
            <SuperAdminRoute>
              <AdminDetailPage />
            </SuperAdminRoute>
          }
        />
        <Route path="users" element={<Users />} />
        <Route path="users/:id" element={<UserDetailPage />} />
        <Route path="letters" element={<Letters />} />
        <Route path="letters/:id" element={<LetterDetailPage />} />
        <Route path="physical-letters" element={<PhysicalLetters />} />
        <Route path="change-password" element={<ChangePassword />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
