import { useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import url_fetch from '../../enviroment';

export default function AdminServiceManagement() {
  const [services, setServices] = useState([]);
  const [form, setForm] = useState({
    id: null,
    name: "",
    category: "",
    description: "",
    price: "",
    plan: "mensual",
  });
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Cargar servicios desde el backend
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch(`${url_fetch}/admin/servicios`);
        const data = await response.json();
        // Agrupar por ServiceId y tomar el primer plan (para simplificar)
        const grouped = {};
        data.servicios.forEach(item => {
          if (!grouped[item.ServiceId]) {
            grouped[item.ServiceId] = {
              id: item.ServiceId,
              name: item.Name,
              category: item.Category,
              description: item.Description,
              price: item.Price,
              plan: item.PlanType,
            };
          }
        });
        setServices(Object.values(grouped));
      } catch (error) {
        setServices([]);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.category || !form.description || !form.price) return;

    if (editing) {
      // PUT
      try {
        await fetch(`${url_fetch}/admin/servicios/${form.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name,
            category: form.category,
            description: form.description,
            price: parseFloat(form.price),
            plan_type: form.plan,
          }),
        });
        setServices((prev) =>
          prev.map((s) =>
            s.id === form.id
              ? { ...form, price: parseFloat(form.price) }
              : s
          )
        );
      } catch (error) {}
    } else {
      // POST
      try {
        const response = await fetch(`${url_fetch}/admin/servicios`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name,
            category: form.category,
            description: form.description,
            price: parseFloat(form.price),
            plan_type: form.plan,
          }),
        });
        const data = await response.json();
        setServices((prev) => [
          ...prev,
          {
            ...form,
            id: data.service_id,
            price: parseFloat(form.price),
          },
        ]);
      } catch (error) {}
    }

    setForm({
      id: null,
      name: "",
      category: "",
      description: "",
      price: "",
      plan: "mensual",
    });
    setEditing(false);
  };

  const handleEdit = (service) => {
    setForm(service);
    setEditing(true);
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`${url_fetch}/admin/servicios/${id}`, {
        method: "DELETE",
      });
      setServices((prev) => prev.filter((s) => s.id !== id));
      if (form.id === id) {
        setForm({
          id: null,
          name: "",
          category: "",
          description: "",
          price: "",
          plan: "mensual",
        });
        setEditing(false);
      }
    } catch (error) {}
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-2">Gestión de Servicios</h1>
        <p className="text-gray-600 mb-6">
          Aquí puedes agregar, editar o eliminar servicios disponibles.
        </p>

        {/* Formulario */}
        <form
          onSubmit={handleSubmit}
          className="bg-gray-50 border p-6 rounded-lg shadow space-y-4 mb-8"
        >
          <div className="grid md:grid-cols-2 gap-4">
            <input
              type="text"
              name="name"
              placeholder="Nombre del servicio"
              value={form.name}
              onChange={handleChange}
              className="p-2 border rounded w-full"
              required
            />
            <input
              type="text"
              name="category"
              placeholder="Categoría"
              value={form.category}
              onChange={handleChange}
              className="p-2 border rounded w-full"
              required
            />
            <input
              type="number"
              name="price"
              placeholder="Precio"
              value={form.price}
              onChange={handleChange}
              className="p-2 border rounded w-full"
              required
            />
            <select
              name="plan"
              value={form.plan}
              onChange={handleChange}
              className="p-2 border rounded w-full"
              required
            >
              <option value="mensual">Mensual</option>
              <option value="anual">Anual</option>
            </select>
          </div>

          <textarea
            name="description"
            placeholder="Descripción"
            value={form.description}
            onChange={handleChange}
            rows="3"
            className="p-2 border rounded w-full"
            required
          ></textarea>

          <div className="flex gap-4">
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              {editing ? "Actualizar servicio" : "Agregar servicio"}
            </button>
            {editing && (
              <button
                type="button"
                onClick={() => {
                  setForm({
                    id: null,
                    name: "",
                    category: "",
                    description: "",
                    price: "",
                    plan: "mensual",
                  });
                  setEditing(false);
                }}
                className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>

        {/* Tabla */}
        <div className="overflow-x-auto">
          {loading ? (
            <p className="text-center py-8">Cargando servicios...</p>
          ) : (
            <table className="w-full border text-left">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2">Nombre</th>
                  <th className="p-2">Categoría</th>
                  <th className="p-2">Descripción</th>
                  <th className="p-2">Precio</th>
                  <th className="p-2">Plan</th>
                  <th className="p-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {services.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-4 text-center text-gray-500">
                      No hay servicios registrados.
                    </td>
                  </tr>
                ) : (
                  services.map((s) => (
                    <tr key={s.id} className="border-t">
                      <td className="p-2">{s.name}</td>
                      <td className="p-2">{s.category}</td>
                      <td className="p-2">{s.description}</td>
                      <td className="p-2">${s.price.toFixed(2)}</td>
                      <td className="p-2 capitalize">{s.plan}</td>
                      <td className="p-2 space-x-2">
                        <button
                          onClick={() => handleEdit(s)}
                          className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(s.id)}
                          className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
