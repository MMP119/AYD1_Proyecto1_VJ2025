import { useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";

export default function AdminServiceManagement() {
  const [services, setServices] = useState([
    {
      id: 1,
      name: "Netflix",
      category: "Streaming",
      description: "Películas y series ilimitadas.",
      price: 10.99,
      plan: "mensual",
    },
    {
      id: 2,
      name: "Dropbox",
      category: "Almacenamiento",
      description: "Almacenamiento seguro en la nube.",
      price: 99.99,
      plan: "anual",
    },
  ]);

  const [form, setForm] = useState({
    id: null,
    name: "",
    category: "",
    description: "",
    price: "",
    plan: "mensual",
  });

  const [editing, setEditing] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.name || !form.category || !form.description || !form.price) return;

    if (editing) {
      setServices((prev) =>
        prev.map((s) => (s.id === form.id ? form : s))
      );
    } else {
      setServices((prev) => [
        ...prev,
        { ...form, id: Date.now(), price: parseFloat(form.price) },
      ]);
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

  const handleDelete = (id) => {
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
        </div>
      </div>
    </DashboardLayout>
  );
}
