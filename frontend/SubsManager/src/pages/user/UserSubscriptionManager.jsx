import React, { useState, useEffect } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { useAuth } from "../../context/AuthContext";
import url_fetch from '../../enviroment';
import { useNavigate } from "react-router-dom";

export default function PerfilUsuario() {
  const { user } = useAuth(); 

  const [suscripciones, setSuscripciones] = useState([]);
  const [mensaje, setMensaje] = useState({ text: "", type: "" });
  const navigate = useNavigate();


  useEffect(() => {
    const fetchSuscripciones = async () => {
      try {
        const response = await fetch(`${url_fetch}/subscription/${user.id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,  
          },
        });

        const data = await response.json();
        if (data.success) {
          console.log(data.data);
          setSuscripciones(data.data || []);
        } else {
          setMensaje({ text: "No se pudieron cargar las suscripciones", type: "error" });
        }
      } catch (error) {
        setMensaje({ text: "Error al obtener suscripciones", type: "error" });
      }
    };

    if (user?.id) {
      fetchSuscripciones();
    }
  }, [user?.id]); 


const cancelarSuscripcion = async (subscriptionId) => {
  const confirmar = confirm("¿Seguro que deseas cancelar esta suscripción?");
  if (!confirmar) return;

  try {

    const response = await fetch(`${url_fetch}/subscription/cancelled/${user.id}/${subscriptionId}`, {
      method: "PUT", 
    });

    const data = await response.json();

    if (data.success) {
      setSuscripciones((prev) =>
        prev.map((s) =>
          s.SubscriptionId === subscriptionId
            ? {
                ...s,
                Estado: "Cancelada",  
                FechaFin: new Date().toISOString().slice(0, 10), 
              }
            : s
        )
      );
      alert("Suscripción cancelada exitosamente.");
    } else {
      alert("Hubo un error al cancelar la suscripción.");
    }
  } catch (error) {
    console.error("Error al cancelar la suscripción:", error);
    alert("Hubo un error al cancelar la suscripción.");
  }
};

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Perfil de Usuario</h1>
        <p className="text-gray-600">Ver y actualizar tus datos personales.</p>
      </div>

      {/* Mostrar las suscripciones */}
      <div className="overflow-x-auto">
        <table className="min-w-full border rounded-lg bg-white">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-4 text-left">Servicio</th>
              <th className="py-2 px-4 text-left">Tipo de Plan</th>
              <th className="py-2 px-4">Fecha de Inicio</th>
              <th className="py-2 px-4">Fecha de Fin</th>
              <th className="py-2 px-4">Estado</th>
              <th className="py-2 px-4">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {suscripciones.map((sub) => (
              <tr key={sub.SubscriptionId} className="border-t">
                <td className="py-2 px-4">{sub.Servicio}</td>
                <td className="py-2 px-4">{sub.TipoPlan}</td>
                <td className="py-2 px-4">{sub.FechaInicio?.slice(0, 10)}</td>
                <td className="py-2 px-4">{sub.FechaFin ? sub.FechaFin.slice(0, 10) : "-"}</td>
                <td className="py-2 px-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      sub.Estado === "active"
                        ? "bg-green-100 text-green-700"
                        : sub.Estado === "cancelled"
                        ? "bg-gray-200 text-gray-600"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {sub.Estado}
                  </span>
                </td>
                <td className="py-2 px-4 text-center">
                  {sub.Estado === "active" ? (
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

      {/* Mostrar mensaje de éxito o error */}
      {mensaje.text && (
        <div className={`mt-4 text-${mensaje.type === 'error' ? 'red' : 'green'}-500`}>
          {mensaje.text}
        </div>
      )}
    </DashboardLayout>
  );
}
