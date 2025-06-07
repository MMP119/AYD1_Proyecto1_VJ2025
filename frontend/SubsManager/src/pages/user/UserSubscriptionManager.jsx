import { useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import url_fetch from '../../enviroment';

export default function UserSubscriptionManager() {
  const [suscripciones, setSuscripciones] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [planes, setPlanes] = useState([]);

  // Cargar servicios y planes
  useEffect(() => {
    const fetchServicios = async () => {
      try {
        const response = await fetch(`${url_fetch}/admin/servicios`);
        const data = await response.json();

        // Agrupa servicios y planes
        const serviciosMap = {};
        const planesArr = [];

        data.servicios.forEach(item => {
          if (!serviciosMap[item.ServiceId]) {
            serviciosMap[item.ServiceId] = {
              ServiceId: item.ServiceId,
              Name: item.Name,
            };
          }
          if (item.PlanType && item.Price !== null) {
            planesArr.push({
              PlanId: `${item.ServiceId}-${item.PlanType}`,
              ServiceId: item.ServiceId,
              Type: item.PlanType,
              Price: item.Price,
            });
          }
        });

        setServicios(Object.values(serviciosMap));
        setPlanes(planesArr);
      } catch (error) {
        setServicios([]);
        setPlanes([]);
      }
    };

    fetchServicios();
  }, []);

  // Cargar suscripciones reales
  useEffect(() => {
    const fetchSuscripciones = async () => {
      try {
        const response = await fetch(`${url_fetch}/admin/suscripciones`);
        const data = await response.json();
        setSuscripciones(data.suscripciones || []);
      } catch (error) {
        setSuscripciones([]);
      }
    };

    fetchSuscripciones();
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
                <td className="py-2 px-4">{sub.StartDate?.slice(0, 10)}</td>
                <td className="py-2 px-4">{sub.EndDate ? sub.EndDate.slice(0, 10) : "-"}</td>
                <td className="py-2 px-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      sub.Status === "active"
                        ? "bg-green-100 text-green-700"
                        : sub.Status === "cancelled"
                        ? "bg-gray-200 text-gray-600"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {sub.Status}
                  </span>
                </td>
                <td className="py-2 px-4 text-center">
                  {sub.Status === "active" ? (
                    <button
                      // Aquí deberías implementar la lógica real de cancelación
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                      disabled
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
