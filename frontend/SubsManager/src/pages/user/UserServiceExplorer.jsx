import { useEffect, useState, useMemo } from "react";
import { Dialog } from "@headlessui/react";
import DashboardLayout from "../../components/DashboardLayout";
import url_fetch from '../../enviroment';
import { useAuth } from "../../context/AuthContext";

export default function UserServiceExplorer() {
  const [busqueda, setBusqueda] = useState("");
  const [categoria, setCategoria] = useState("todos");
  const [servicioSeleccionado, setServicioSeleccionado] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const [plan, setPlan] = useState(null);
  const [metodoPago, setMetodoPago] = useState("Cartera Digital");
  const [userWalletBalance, setUserWalletBalance] = useState(20);

  // Estados para servicios y planes
  const [servicios, setServicios] = useState([]);
  const [planes, setPlanes] = useState([]);

  const { user } = useAuth();

  useEffect(() => {
    const fetchServicios = async () => {
      try {
        const response = await fetch(`${url_fetch}/admin/servicios`);
        const data = await response.json();

        // Agrupa servicios y planes según la nueva respuesta
        const serviciosMap = {};
        const planesArr = [];

        (data.planes_servicios || []).forEach(item => {
          if (!serviciosMap[item.ServiceId]) {
            serviciosMap[item.ServiceId] = {
              ServiceId: item.ServiceId,
              Name: item.ServiceName,
              Category: item.Category,
              Description: item.Description,
            };
          }
          // Si hay plan, agrégalo
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

  const serviciosFiltrados = useMemo(() => {
    return servicios.filter(s =>
      s.Name.toLowerCase().includes(busqueda.toLowerCase()) &&
      (categoria === "todos" || s.Category === categoria)
    );
  }, [busqueda, categoria, servicios]);

  const abrirModal = (servicio) => {
    setServicioSeleccionado(servicio);
    const planesServicio = planes.filter(p => p.ServiceId === servicio.ServiceId);
    setPlan(planesServicio[0]?.PlanId || null);
    setIsOpen(true);
  };

  const obtenerPrecioPlan = (planId) => {
    return planes.find(p => p.PlanId === planId)?.Price || 0;
  };


  const suscribirse = async () => {
    const precio = obtenerPrecioPlan(plan);
    if (metodoPago === "Cartera Digital" && userWalletBalance < precio) {
      alert("Saldo insuficiente en la cartera digital.");
      return;
    }
    
    // Preparar fechas
    const hoy = new Date();
    const start_date = hoy.toISOString().slice(0, 10);
    const end = new Date(hoy);
    
    //verificar si el plan es mensual o anual
    end.setMonth(end.getMonth() + (plan.includes("monthly") ? 1 : 12));
    const end_date = end.toISOString().slice(0, 10);

    // Determinar el método de pago
    let pm;
    if (metodoPago === "Tarjeta") pm = "card";
    else if (metodoPago === "Efectivo") pm = "cash";
    else if (metodoPago === "Cartera Digital") pm = "wallet";

    //determinar si es mensual o anual
    let plant_type;
    if (plan.includes("monthly")) {
      plant_type = "monthly";
    }else{
      plant_type = "annual";
    }


    try {
      const res = await fetch(
        `${url_fetch}/pay/plan/${user.id}`,  // user.id del contexto
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            service_id: parseInt(plan.split("-")[0], 10),  // Sale id del serivicio y el tipo del plan...
            plant_type,
            start_date,
            end_date,
            AmountPaid: precio,
            PaymentMethod: pm
          })
        }
      );

      const data = await res.json();
      if (!res.ok) {
        alert(data.detail || "Error al suscribirse");
      } else {
        alert("Suscripción exitosa!");
        setIsOpen(false);
      }
      
    } catch (err) {
      console.error(err);
      alert("Error de red. Intenta de nuevo.");
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
              <div className="w-full border px-3 py-2 rounded-md bg-gray-100 text-gray-700">
                Cartera Digital
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-4">Saldo actual: ${userWalletBalance}</p>

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
