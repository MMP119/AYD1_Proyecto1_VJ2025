import { useState, useMemo, useEffect } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import url_fetch from '../../enviroment';

export default function AdminSubscriptionManagement() {
    const [subscriptions, setSubscriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("todos");
    const [categoryFilter, setCategoryFilter] = useState("todos");
    const [dateType, setDateType] = useState("end");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");

    // Obtener suscripciones del backend
    useEffect(() => {
        const fetchSubscriptions = async () => {
            try {
                const response = await fetch(`${url_fetch}/admin/suscripciones`);
                const data = await response.json();
                setSubscriptions(data.suscripciones || []);
            } catch (error) {
                setSubscriptions([]);
            } finally {
                setLoading(false);
            }
        };
        fetchSubscriptions();
    }, []);

    // Obtener categorías únicas
    const categories = useMemo(() => {
        const setCat = new Set(subscriptions.map(sub => sub.category));
        return ["todos", ...Array.from(setCat)];
    }, [subscriptions]);

    // Filtrado
    const filteredSubscriptions = useMemo(() => {
        return subscriptions.filter((sub) => {
            const matchStatus = statusFilter === "todos" || sub.Status === statusFilter || sub.status === statusFilter;
            const matchCategory = categoryFilter === "todos" || sub.category === categoryFilter;
            let matchDate = true;
            const dateField = dateType === "start" ? sub.StartDate : sub.EndDate;
            if (dateFrom) {
                matchDate = dateField && dateField.slice(0, 10) >= dateFrom;
            }
            if (matchDate && dateTo) {
                matchDate = dateField && dateField.slice(0, 10) <= dateTo;
            }
            return matchStatus && matchCategory && matchDate;
        });
    }, [subscriptions, statusFilter, categoryFilter, dateType, dateFrom, dateTo]);

    const getStatusColor = (status) => {
        switch (status) {
            case "active":
            case "activa":
                return "text-green-600 font-semibold";
            case "vencida":
            case "expired":
                return "text-red-600 font-semibold";
            case "cancelada":
            case "cancelled":
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
                    <option value="active">Activa</option>
                    <option value="cancelled">Cancelada</option>
                    <option value="expired">Vencida</option>
                </select>

                <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="border px-3 py-2 rounded-md"
                >
                    <option value="todos">Todas las categorías</option>
                    {categories.slice(1).map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>

                {/* Combo para tipo de fecha y filtro de fecha */}
                <select
                    value={dateType}
                    onChange={e => setDateType(e.target.value)}
                    className="border px-3 py-2 rounded-md"
                >
                    <option value="end">Fecha de vencimiento</option>
                    <option value="start">Fecha de inicio</option>
                </select>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                        Filtrar <b>{dateType === "end" ? "fecha de vencimiento" : "fecha de inicio"}</b> de
                    </span>
                    <input
                        type="date"
                        value={dateFrom}
                        onChange={e => setDateFrom(e.target.value)}
                        className="border px-3 py-2 rounded-md"
                        placeholder="Desde"
                    />
                    <span className="text-sm text-gray-600">a</span>
                    <input
                        type="date"
                        value={dateTo}
                        onChange={e => setDateTo(e.target.value)}
                        className="border px-3 py-2 rounded-md"
                        placeholder="Hasta"
                    />
                </div>
                {(dateFrom || dateTo) && (
                    <button
                        onClick={() => { setDateFrom(""); setDateTo(""); }}
                        className="ml-2 px-2 py-1 bg-gray-200 rounded"
                        title="Limpiar rango de fechas"
                    >
                        Limpiar fechas
                    </button>
                )}
            </div>

            {/* Tabla */}
            <div className="overflow-x-auto">
                {loading ? (
                    <p className="text-center py-8">Cargando suscripciones...</p>
                ) : (
                    <table className="w-full text-left border">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="p-2">Usuario</th>
                                <th className="p-2">Email</th>
                                <th className="p-2">Servicio</th>
                                <th className="p-2">Categoría</th>
                                <th className="p-2">Estado</th>
                                <th className="p-2">Inicio</th>
                                <th className="p-2">Fecha de vencimiento</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSubscriptions.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="text-center p-4 text-gray-500">
                                        No se encontraron suscripciones con esos filtros.
                                    </td>
                                </tr>
                            ) : (
                                filteredSubscriptions.map((sub) => (
                                    <tr key={sub.SubscriptionId || sub.id} className="border-t">
                                        <td className="p-2">{sub.user}</td>
                                        <td className="p-2">{sub.email}</td>
                                        <td className="p-2">{sub.service}</td>
                                        <td className="p-2">{sub.category}</td>
                                        <td className={`p-2 capitalize ${getStatusColor(sub.Status || sub.status)}`}>
                                            {sub.Status || sub.status}
                                        </td>
                                        <td className="p-2">{sub.StartDate ? sub.StartDate.slice(0, 10) : ""}</td>
                                        <td className="p-2">{sub.EndDate ? sub.EndDate.slice(0, 10) : ""}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </DashboardLayout>
    );
}
