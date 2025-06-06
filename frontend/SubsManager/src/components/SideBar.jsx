import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const links = user?.role === "admin"
    ? [
        { path: "/admin/dashboard", label: "Dashboard" },
        { path: "/admin/user-management", label: "Gestión de Usuarios" },
        { path: "/admin/subscription-management", label: "Gestión de Suscripciones" },
        { path: "/admin/service-management", label: "Gestión de Servicios" },
        { path: "/admin/control-panel", label: "Panel de Control" },
        { path: "/admin/reports", label: "Reportes" },
      ]
    : [
        { path: "/user/dashboard", label: "Dashboard" },
        { path: "/user/service-explorer", label: "Explorar Servicios" },
        { path: "/user/subscription", label: "Mis Suscripciones" },
        { path: "/user/payment-methods", label: "Métodos de Pago" },
        { path: "/user/expense-tracking", label: "Seguimiento de Gastos" },
        { path: "/user/profile", label: "Perfil" },
      ];

  return (
    <aside className="bg-gray-800 text-white w-64 min-h-screen p-6 fixed">
      <h2 className="text-xl font-bold mb-6">
        {"SubsManager"}
      </h2>

      <nav className="space-y-4">
        {links.map(({ path, label }) => (
          <Link
            key={path}
            to={path}
            className={`block px-3 py-2 rounded ${
              location.pathname === path
                ? "bg-gray-700"
                : "hover:bg-gray-700 transition"
            }`}
          >
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
