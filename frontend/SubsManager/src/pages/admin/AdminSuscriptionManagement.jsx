import { useState, useMemo } from "react";
import DashboardLayout from "../../components/DashboardLayout";

export default function AdminSubscriptionManagement() {
    // Datos quemados 
    const fakeSubscriptions = [
        {
            id: 1,
            user: "Ana Pérez",
            email: "ana@correo.com",
            service: "Netflix",
            category: "Streaming",
            status: "activa",
            dueDate: "2025-07-01",
        },
        {
            id: 2,
            user: "Luis Martínez",
            email: "luis@correo.com",
            service: "Dropbox",
            category: "Almacenamiento",
            status: "vencida",
            dueDate: "2025-05-01",
        },
        {
            id: 3,
            user: "Sofía García",
            email: "sofia@correo.com",
            service: "Spotify",
            category: "Música",
            status: "cancelada",
            dueDate: "2025-06-15",
        },
        {
            id: 4,
            user: "Luis Martínez",
            email: "luis@correo.com",
            service: "HBO Max",
            category: "Streaming",
            status: "activa",
            dueDate: "2025-08-10",
        },
    ];

    const [statusFilter, setStatusFilter] = useState("todos");
    const [categoryFilter, setCategoryFilter] = useState("todos");
    const [dueDateFilter, setDueDateFilter] = useState(""); 

    const filteredSubscriptions = useMemo(() => {
        return fakeSubscriptions.filter((sub) => {
            const matchStatus = statusFilter === "todos" || sub.status === statusFilter;
            const matchCategory = categoryFilter === "todos" || sub.category === categoryFilter;
            const matchDueDate =
                !dueDateFilter || sub.dueDate === dueDateFilter;
            return matchStatus && matchCategory && matchDueDate;
        });
    }, [statusFilter, categoryFilter, dueDateFilter]);

    const getStatusColor = (status) => {
        switch (status) {
            case "activa":
                return "text-green-600 font-semibold";
            case "vencida":
                return "text-red-600 font-semibold";
            case "cancelada":
                return "text-gray-600 font-semibold";
            default:
                return "";
        }
    };

    return (
        <DashboardLayout>
            <div className="mb-6">
                <h1 className="text-2xl font-bold mb-2">Gestión de Suscripciones</h1>
                <p className="text-gray-600">Filtra y revisa todas las suscripciones de los usuarios.</p>
            </div>

            {/* Filtros */}
            <div className="flex flex-wrap gap-4 mb-6">
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="border px-3 py-2 rounded-md"
                >
                    <option value="todos">Todos los estados</option>
                    <option value="activa">Activa</option>
                    <option value="cancelada">Cancelada</option>
                    <option value="vencida">Vencida</option>
                </select>

                <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="border px-3 py-2 rounded-md"
                >
                    <option value="todos">Todas las categorías</option>
                    <option value="Streaming">Streaming</option>
                    <option value="Almacenamiento">Almacenamiento</option>
                    <option value="Música">Música</option>
                </select>

                {/* Filtro por fecha de vencimiento */}
                <input
                    type="date"
                    value={dueDateFilter}
                    onChange={(e) => setDueDateFilter(e.target.value)}
                    className="border px-3 py-2 rounded-md"
                    placeholder="Fecha de vencimiento"
                />
                {dueDateFilter && (
                    <button
                        onClick={() => setDueDateFilter("")}
                        className="ml-2 px-2 py-1 bg-gray-200 rounded"
                        title="Limpiar filtro de fecha"
                    >
                        Limpiar fecha
                    </button>
                )}
            </div>

            {/* Tabla */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-2">Usuario</th>
                            <th className="p-2">Email</th>
                            <th className="p-2">Servicio</th>
                            <th className="p-2">Categoría</th>
                            <th className="p-2">Estado</th>
                            <th className="p-2">Fecha de vencimiento</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredSubscriptions.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="text-center p-4 text-gray-500">
                                    No se encontraron suscripciones con esos filtros.
                                </td>
                            </tr>
                        ) : (
                            filteredSubscriptions.map((sub) => (
                                <tr key={sub.id} className="border-t">
                                    <td className="p-2">{sub.user}</td>
                                    <td className="p-2">{sub.email}</td>
                                    <td className="p-2">{sub.service}</td>
                                    <td className="p-2">{sub.category}</td>
                                    <td className={`p-2 capitalize ${getStatusColor(sub.status)}`}>
                                        {sub.status}
                                    </td>
                                    <td className="p-2">{sub.dueDate}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </DashboardLayout>
    );
}
