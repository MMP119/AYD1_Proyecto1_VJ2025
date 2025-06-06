import { useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";

const servicios = [
  { ServiceId: 1, Name: "Netflix" },
  { ServiceId: 2, Name: "Spotify" },
];

const planes = [
  { PlanId: 1, ServiceId: 1, Type: "Básico", Price: 10 },
  { PlanId: 2, ServiceId: 2, Type: "Estándar", Price: 5 },
];

const suscripcionesSimuladas = [
  {
    SubscriptionId: 1,
    ServiceId: 1,
    PlanId: 1,
    StartDate: "2024-12-01",
    EndDate: null,
    Status: "Activa",
  },
  {
    SubscriptionId: 2,
    ServiceId: 2,
    PlanId: 2,
    StartDate: "2024-10-01",
    EndDate: "2025-01-01",
    Status: "Cancelada",
  },
];

export default function UserSubscriptionManager() {
  const [suscripciones, setSuscripciones] = useState([]);

  useEffect(() => {
    setSuscripciones(suscripcionesSimuladas);
  }, []);

  const cancelarSuscripcion = (id) => {
    const confirmar = confirm("¿Seguro que deseas cancelar esta suscripción?");
    if (!confirmar) return;

    setSuscripciones((prev) =>
      prev.map((s) =>
        s.SubscriptionId === id
          ? {
              ...s,
              Status: "Cancelada",
              EndDate: new Date().toISOString().slice(0, 10),
            }
          : s
      )
    );
  };

  const getNombreServicio = (serviceId) =>
    servicios.find((s) => s.ServiceId === serviceId)?.Name || "Desconocido";

  const getNombrePlan = (planId) =>
    planes.find((p) => p.PlanId === planId)?.Type || "N/A";

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Mis Suscripciones</h1>
        <p className="text-gray-600">Visualiza tu historial y cancela servicios activos.</p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border rounded-lg bg-white">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-4 text-left">Servicio</th>
              <th className="py-2 px-4 text-left">Plan</th>
              <th className="py-2 px-4">Inicio</th>
              <th className="py-2 px-4">Fin</th>
              <th className="py-2 px-4">Estado</th>
              <th className="py-2 px-4">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {suscripciones.map((sub) => (
              <tr key={sub.SubscriptionId} className="border-t">
                <td className="py-2 px-4">{getNombreServicio(sub.ServiceId)}</td>
                <td className="py-2 px-4">{getNombrePlan(sub.PlanId)}</td>
                <td className="py-2 px-4">{sub.StartDate}</td>
                <td className="py-2 px-4">{sub.EndDate || "-"}</td>
                <td className="py-2 px-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      sub.Status === "Activa"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {sub.Status}
                  </span>
                </td>
                <td className="py-2 px-4 text-center">
                  {sub.Status === "Activa" ? (
                    <button
                      onClick={() => cancelarSuscripcion(sub.SubscriptionId)}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Cancelar
                    </button>
                  ) : (
                    <span className="text-sm text-gray-500">Cancelada</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}
