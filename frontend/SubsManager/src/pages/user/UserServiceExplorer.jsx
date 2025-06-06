import { useEffect, useState, useMemo } from "react";
import { Dialog } from "@headlessui/react";
import DashboardLayout from "../../components/DashboardLayout";

// Datos simulados para ejemplo (en la práctica se cargarían desde API)
const servicios = [
  { ServiceId: 1, Name: "Netflix", Category: "Streaming", Description: "Películas y series" },
  { ServiceId: 2, Name: "Spotify", Category: "Música", Description: "Música en línea" },
];

const planes = [
  { PlanId: 1, ServiceId: 1, Type: "Básico", Price: 10 },
  { PlanId: 2, ServiceId: 1, Type: "Premium", Price: 15 },
  { PlanId: 3, ServiceId: 2, Type: "Estándar", Price: 5 },
];

const metodosPago = ["Tarjeta", "Efectivo", "Cartera Digital"];

export default function UserServiceExplorer() {
  const [busqueda, setBusqueda] = useState("");
  const [categoria, setCategoria] = useState("todos");
  const [servicioSeleccionado, setServicioSeleccionado] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const [plan, setPlan] = useState(null);
  const [metodoPago, setMetodoPago] = useState("Cartera Digital");
  const [userWalletBalance, setUserWalletBalance] = useState(20); // valor simulado

  const serviciosFiltrados = useMemo(() => {
    return servicios.filter(s =>
      s.Name.toLowerCase().includes(busqueda.toLowerCase()) &&
      (categoria === "todos" || s.Category === categoria)
    );
  }, [busqueda, categoria]);

  const abrirModal = (servicio) => {
    setServicioSeleccionado(servicio);
    const planesServicio = planes.filter(p => p.ServiceId === servicio.ServiceId);
    setPlan(planesServicio[0]?.PlanId || null);
    setIsOpen(true);
  };

  const obtenerPrecioPlan = (planId) => {
    return planes.find(p => p.PlanId === parseInt(planId))?.Price || 0;
  };

  const suscribirse = () => {
    const precio = obtenerPrecioPlan(plan);
    if (metodoPago === "Cartera Digital" && userWalletBalance < precio) {
      alert("Saldo insuficiente en la cartera digital.");
      return;
    }

    console.log(`Suscrito a ${servicioSeleccionado.Name}, plan ${plan}, pagando con ${metodoPago}. Monto: $${precio}`);
    
    if (metodoPago === "Cartera Digital") {
      setUserWalletBalance(prev => prev - precio);
      console.log(`Transacción registrada en wallet por $${precio}`);
    }

    setIsOpen(false);
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Explorar Servicios</h1>
        <p className="text-gray-600">Busca servicios disponibles y suscríbete al plan que más te convenga.</p>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-4 mb-6">
        <input
          type="text"
          placeholder="Buscar por nombre"
          className="border px-3 py-2 rounded-md"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <select
          className="border px-3 py-2 rounded-md"
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
        >
          <option value="todos">Todas las categorías</option>
          {[...new Set(servicios.map(s => s.Category))].map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Lista de servicios */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {serviciosFiltrados.map(servicio => (
          <div key={servicio.ServiceId} className="border rounded-lg p-4 shadow-sm bg-white">
            <h2 className="text-lg font-semibold">{servicio.Name}</h2>
            <p className="text-gray-600 mb-2">{servicio.Description}</p>
            <p className="text-sm text-gray-500 mb-2">Categoría: {servicio.Category}</p>
            <button
              onClick={() => abrirModal(servicio)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Suscribirse
            </button>
          </div>
        ))}
      </div>

      {/* Modal */}
      <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="fixed z-50 inset-0 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen backdrop-blur-sm bg-white/10">
          <Dialog.Panel className="bg-white p-6 rounded-lg max-w-md w-full shadow-lg">
            <Dialog.Title className="text-lg font-bold mb-2">
              Suscribirse a {servicioSeleccionado?.Name}
            </Dialog.Title>

            <div className="mb-4">
              <label className="block mb-1">Plan:</label>
              <select
                value={plan}
                onChange={(e) => setPlan(e.target.value)}
                className="w-full border px-3 py-2 rounded-md"
              >
                {planes
                  .filter(p => p.ServiceId === servicioSeleccionado?.ServiceId)
                  .map(p => (
                    <option key={p.PlanId} value={p.PlanId}>
                      {p.Type} - ${p.Price}
                    </option>
                  ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block mb-1">Método de Pago:</label>
              <select
                value={metodoPago}
                onChange={(e) => setMetodoPago(e.target.value)}
                className="w-full border px-3 py-2 rounded-md"
              >
                {metodosPago.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            {metodoPago === "Cartera Digital" && (
              <p className="text-sm text-gray-600 mb-4">Saldo actual: ${userWalletBalance}</p>
            )}

            <div className="flex justify-end gap-2">
              <button onClick={() => setIsOpen(false)} className="px-4 py-2 rounded bg-gray-300">
                Cancelar
              </button>
              <button onClick={suscribirse} className="px-4 py-2 rounded bg-green-600 text-white">
                Confirmar
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </DashboardLayout>
  );
}
