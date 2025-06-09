import { useState, useEffect } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import url_fetch from "../../enviroment";
import { useAuth } from "../../context/AuthContext";

export default function UserPaymentMethods() {
    const { user } = useAuth();
    const [metodos, setMetodos] = useState([]);
    const [walletBalance, setWalletBalance] = useState(0);
    const [transacciones, setTransacciones] = useState([]);
    const [nuevoMetodo, setNuevoMetodo] = useState({ tipo: "Tarjeta", numero: "", titular: "", vencimiento: "" });
    const [montoRecarga, setMontoRecarga] = useState("");
    const [errorRecarga, setErrorRecarga] = useState("");
    const [errorMetodo, setErrorMetodo] = useState("");
    const [loading, setLoading] = useState(true);

    // Cargar métodos y transacciones solo si hay usuario
    useEffect(() => {
        if (user && user.id) {
            setLoading(true);
            Promise.all([fetchPaymentMethods(), fetchWalletTransactions()]).then(() => {
                setLoading(false);
            });
        }
    }, [user]);

    // Obtener métodos de pago
    async function fetchPaymentMethods() {
        try {
            const res = await fetch(`${url_fetch}/payment-methods/${user.id}`);
            const data = await res.json();
            if (data.success) {
                setMetodos(
                    data.data.map(pm => ({
                        id: pm[0], // PaymentMethodId
                        tipo: pm[1] === "card" ? "Tarjeta" : "Efectivo",
                        numero: pm[2] ? `**** **** **** ${pm[2].slice(-4)}` : "",
                        titular: pm[3] || "",
                        vencimiento: pm[4] || "",
                    }))
                );
                setWalletBalance(data.data[0]?.[5] || 0); // WalletBalance (del primer método, si viene)
            } else {
                setMetodos([]);
                setWalletBalance(0);
            }
        } catch (err) {
            setMetodos([]);
            setWalletBalance(0);
        }
    }

    // Obtener historial de transacciones
    async function fetchWalletTransactions() {
        try {
            const res = await fetch(`${url_fetch}/wallet/transactions/${user.id}`);
            const data = await res.json();
            if (data.success) {
                setTransacciones(
                    data.data.map(tx => ({
                        id: tx[0], // TransactionId
                        tipo: tx[1] === "recharge" ? "Recarga" : "Pago",
                        monto: Number(tx[2]),
                        fecha: tx[3].split("T")[0],
                        descripcion: "", // Puedes ajustar si tienes descripciones
                    }))
                );
            } else {
                setTransacciones([]);
            }
        } catch (err) {
            setTransacciones([]);
        }
    }

    // Agregar método de pago
    async function agregarMetodoAPI() {
        setErrorMetodo("");
        if (nuevoMetodo.tipo === "Tarjeta") {
            if (!nuevoMetodo.numero.trim()) {
                setErrorMetodo("El número de tarjeta es obligatorio");
                return;
            }
            if (!nuevoMetodo.titular.trim()) {
                setErrorMetodo("El nombre del titular es obligatorio");
                return;
            }
            if (!nuevoMetodo.vencimiento) {
                setErrorMetodo("La fecha de vencimiento es obligatoria");
                return;
            }
            const numeroLimpio = nuevoMetodo.numero.replace(/\s/g, "");
            if (numeroLimpio.length !== 16 || !/^\d+$/.test(numeroLimpio)) {
                setErrorMetodo("El número de tarjeta debe tener 16 dígitos");
                return;
            }
            if (!/^\d{2}\/\d{2}$/.test(nuevoMetodo.vencimiento)) {
                setErrorMetodo("Formato de vencimiento inválido (MM/AA)");
                return;
            }
        }
        let body = {
            user_id: user.id,
            tipo: nuevoMetodo.tipo === "Tarjeta" ? "card" : "cash",
            numero: nuevoMetodo.tipo === "Tarjeta" ? nuevoMetodo.numero : null,
            titular: nuevoMetodo.tipo === "Tarjeta" ? nuevoMetodo.titular : null,
            vencimiento: nuevoMetodo.tipo === "Tarjeta" ? nuevoMetodo.vencimiento : null,
            balance: 0
        };
        try {
            const res = await fetch(`${url_fetch}/payment-methods`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            const data = await res.json();
            if (data.success) {
                await fetchPaymentMethods();
                setNuevoMetodo({ tipo: "Tarjeta", numero: "", titular: "", vencimiento: "" });
            } else {
                setErrorMetodo(data.message || "Error al agregar método");
            }
        } catch (err) {
            setErrorMetodo("Error de red al agregar método");
        }
    }

    // Eliminar método de pago
    async function eliminarMetodoAPI(paymentMethodId) {
        try {
            const res = await fetch(
                `${url_fetch}/payment-methods/${user.id}/${paymentMethodId}`,
                { method: "DELETE" }
            );
            const data = await res.json();
            if (data.success) {
                await fetchPaymentMethods();
            }
        } catch (err) {
            // Puedes mostrar un error aquí si quieres
        }
    }

    // Recargar billetera
    async function recargarWalletAPI() {
        setErrorRecarga("");
        const cantidad = parseFloat(montoRecarga);
        if (isNaN(cantidad) || cantidad <= 0 || cantidad > 1000) {
            setErrorRecarga("Monto inválido");
            return;
        }
        try {
            const res = await fetch(`${url_fetch}/wallet/update/${user.id}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tipo: "recharge", monto: cantidad }),
            });
            const data = await res.json();
            if (data.success) {
                setWalletBalance(Number(data.new_balance));
                setMontoRecarga("");
                await fetchWalletTransactions();
            } else {
                setErrorRecarga(data.detail || data.message || "Error al recargar");
            }
        } catch (err) {
            setErrorRecarga("Error de red al recargar");
        }
    }

    // Si el usuario no está cargado, muestra un loader simple
    if (!user || !user.id || loading) {
        return (
            <DashboardLayout>
                <div className="flex justify-center items-center h-64">
                    <span className="text-gray-500">Cargando...</span>
                </div>
            </DashboardLayout>
        );
    }

    // Renderizado normal
    return (
        <DashboardLayout>
            <h1 className="text-2xl font-bold mb-4">Métodos de Pago</h1>
            {/* Cartera Digital */}
            <div className="bg-white p-4 rounded shadow mb-6">
                <h2 className="text-xl font-semibold mb-2">Cartera Digital</h2>
                <p>
                    Saldo disponible: <strong>${walletBalance.toFixed(2)}</strong>
                </p>
                <div className="mt-3 flex flex-col sm:flex-row gap-2">
                    <div className="flex-1">
                        <input
                            type="number"
                            placeholder="Monto a recargar"
                            className="border px-3 py-2 rounded w-full"
                            value={montoRecarga}
                            onChange={(e) => setMontoRecarga(e.target.value)}
                            min="1"
                            max="1000"
                        />
                        {errorRecarga && (
                            <p className="text-red-500 text-sm mt-1">{errorRecarga}</p>
                        )}
                    </div>
                    <button
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
                        onClick={recargarWalletAPI}
                    >
                        Recargar
                    </button>
                </div>
            </div>

            {/* Lista de métodos */}
            <div className="bg-white p-4 rounded shadow mb-6">
                <h2 className="text-xl font-semibold mb-2">Tus Métodos de Pago</h2>
                {metodos.length === 0 ? (
                    <p className="text-gray-500 mb-4">
                        No tienes métodos de pago registrados
                    </p>
                ) : (
                    <ul className="mb-4 space-y-2">
                        {metodos.map((m) => (
                            <li
                                key={m.id}
                                className="border-b py-3 flex justify-between items-center"
                            >
                                <div>
                                    <span className="font-medium">{m.tipo}</span>
                                    {m.tipo === "Tarjeta" && (
                                        <div className="text-sm text-gray-600">
                                            <p>{m.numero}</p>
                                            <p>Titular: {m.titular}</p>
                                            <p>Vence: {m.vencimiento}</p>
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={() => eliminarMetodoAPI(m.id)}
                                    className="text-red-600 hover:text-red-800 transition-colors"
                                >
                                    Eliminar
                                </button>
                            </li>
                        ))}
                    </ul>
                )}

                <h3 className="font-semibold mb-3">Agregar nuevo método:</h3>
                <div className="space-y-3">
                    <select
                        value={nuevoMetodo.tipo}
                        onChange={(e) =>
                            setNuevoMetodo({ ...nuevoMetodo, tipo: e.target.value })
                        }
                        className="border px-3 py-2 rounded w-full sm:w-auto"
                    >
                        <option value="Tarjeta">Tarjeta de crédito/débito</option>
                        <option value="Efectivo">Efectivo</option>
                    </select>
                    {nuevoMetodo.tipo === "Tarjeta" && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                                <input
                                    type="text"
                                    placeholder="Número de tarjeta"
                                    className="border px-3 py-2 rounded w-full"
                                    value={nuevoMetodo.numero}
                                    onChange={(e) =>
                                        setNuevoMetodo({
                                            ...nuevoMetodo,
                                            numero: e.target.value,
                                        })
                                    }
                                    maxLength={16}
                                />
                            </div>
                            <div>
                                <input
                                    type="text"
                                    placeholder="Titular de la tarjeta"
                                    className="border px-3 py-2 rounded w-full"
                                    value={nuevoMetodo.titular}
                                    onChange={(e) =>
                                        setNuevoMetodo({
                                            ...nuevoMetodo,
                                            titular: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <div>
                                <input
                                    type="text"
                                    placeholder="MM/AA"
                                    className="border px-3 py-2 rounded w-full"
                                    value={nuevoMetodo.vencimiento}
                                    onChange={(e) =>
                                        setNuevoMetodo({
                                            ...nuevoMetodo,
                                            vencimiento: e.target.value,
                                        })
                                    }
                                    maxLength={5}
                                />
                            </div>
                        </div>
                    )}
                    {errorMetodo && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-2">
                            <p className="text-red-700">{errorMetodo}</p>
                        </div>
                    )}
                    <button
                        onClick={agregarMetodoAPI}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                    >
                        Agregar método de pago
                    </button>
                </div>
            </div>

            {/* Historial de Transacciones */}
            <div className="bg-white p-4 rounded shadow">
                <h2 className="text-xl font-semibold mb-3">Historial de Transacciones</h2>
                {transacciones.length === 0 ? (
                    <p className="text-gray-500">No hay transacciones registradas</p>
                ) : (
                    <ul className="divide-y">
                        {transacciones.map((tx) => (
                            <li key={tx.id} className="py-3">
                                <div className="flex justify-between">
                                    <div>
                                        <span className="font-medium">{tx.tipo}</span>
                                        {tx.descripcion && (
                                            <p className="text-sm text-gray-600">
                                                {tx.descripcion}
                                            </p>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <p
                                            className={
                                                tx.tipo === "Recarga"
                                                    ? "text-green-600"
                                                    : "text-red-600"
                                            }
                                        >
                                            {tx.tipo === "Recarga" ? "+" : "-"}
                                            ${tx.monto.toFixed(2)}
                                        </p>
                                        <p className="text-sm text-gray-500">{tx.fecha}</p>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </DashboardLayout>
    );
}
