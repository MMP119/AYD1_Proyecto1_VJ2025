import { Routes, Route } from "react-router-dom";
import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";
import UserManagement from "../pages/admin/UserManagement";
import AdminSubscriptionManagement from "../pages/admin/AdminSuscriptionManagement";
import AdminServiceManagement from "../pages/admin/AdminServiceManagement";
import AdminDashboard from "../pages/admin/Dashboard";
import UserDashboard from "../pages/user/Dashboard";
import ProtectedRoute from "../components/ProtectedRoute";
import AdminControlPanel from "../pages/admin/AdminControlPanel";
import AdminReports from "../pages/admin/AdminReports";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Admin Routes */}

      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute role="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

        <Route
        path="/admin/user-management"
        element={
          <ProtectedRoute role="admin">
            <UserManagement />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/subscription-management"
        element={
          <ProtectedRoute role="admin">
            <AdminSubscriptionManagement />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/service-management"
        element={
          <ProtectedRoute role="admin">
            <AdminServiceManagement />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/control-panel"
        element={
          <ProtectedRoute role="admin">
            <AdminControlPanel />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/reports"
        element={
          <ProtectedRoute role="admin">
            <AdminReports />
          </ProtectedRoute>
        }
      />

        {/* User Routes */}

      <Route
        path="/user/dashboard"
        element={
          <ProtectedRoute role="user">
            <UserDashboard />
          </ProtectedRoute>
        }
      />

        <Route
        path="/user/subscription"
        element={
          <ProtectedRoute role="user">
            <UserDashboard />
          </ProtectedRoute>
        }
        />

    </Routes>
  );
}
