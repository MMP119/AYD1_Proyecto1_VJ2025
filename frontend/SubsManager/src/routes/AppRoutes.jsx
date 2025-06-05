import { Routes, Route } from "react-router-dom";
import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";
import UserManagement from "../pages/admin/UserManagement";
import ProtectedRoute from "../components/ProtectedRoute";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute role="admin">
            <UserManagement />
          </ProtectedRoute>
        }
      />

      <Route
        path="/user/dashboard"
        element={
          <ProtectedRoute role="user">
            <UserManagement />
          </ProtectedRoute>
        }
      />

    </Routes>
  );
}
