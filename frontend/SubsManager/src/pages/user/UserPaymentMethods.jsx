import { useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";

const metodosIniciales = [
    { id: 1, tipo: "Tarjeta", numero: "**** **** **** 1234", titular: "Ana Pérez", vencimiento: "12/28" },
];

const transaccionesFicticias = [
    { id: 1, tipo: "Recarga", monto: 25, fecha: "2025-06-01" },
    { id: 2, tipo: "Pago", monto: 10, fecha: "2025-06-02", descripcion: "Netflix Premium" },
];

export default function UserPaymentMethods() {
    const [metodos, setMetodos] = useState(metodosIniciales);
    const [walletBalance, setWalletBalance] = useState(40);
    const [transacciones, setTransacciones] = useState(transaccionesFicticias);
    const [nuevoMetodo, setNuevoMetodo] = useState({ tipo: "Tarjeta", numero: "", titular: "", vencimiento: "" });
    const [montoRecarga, setMontoRecarga] = useState("");
    const [errorRecarga, setErrorRecarga] = useState("");
    const [errorMetodo, setErrorMetodo] = useState("");

    const agregarMetodo = () => {
        setErrorMetodo(""); // Limpiar errores previos

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
            
            // Validar formato de número de tarjeta (16 dígitos)
            const numeroLimpio = nuevoMetodo.numero.replace(/\s/g, '');
            if (numeroLimpio.length !== 16 || !/^\d+$/.test(numeroLimpio)) {
                setErrorMetodo("El número de tarjeta debe tener 16 dígitos");
                return;
            }

            // Validar fecha de vencimiento (formato MM/YY)
            if (!/^\d{2}\/\d{2}$/.test(nuevoMetodo.vencimiento)) {
                setErrorMetodo("Formato de vencimiento inválido (MM/AA)");
                return;
            }
        }

        // Agregar el método
        const nuevoId = Date.now();
        if (nuevoMetodo.tipo === "Efectivo") {
            setMetodos([...metodos, { id: nuevoId, tipo: "Efectivo" }]);
        } else {
            // Formatear número de tarjeta para mostrar solo últimos 4 dígitos
            const numeroOculto = `**** **** **** ${nuevoMetodo.numero.slice(-4)}`;
            setMetodos([...metodos, { 
                ...nuevoMetodo, 
                id: nuevoId,
                numero: numeroOculto
            }]);
        }

        // Resetear formulario
        setNuevoMetodo({ tipo: "Tarjeta", numero: "", titular: "", vencimiento: "" });
    };

    const eliminarMetodo = (id) => {
        setMetodos(metodos.filter(m => m.id !== id));
    };

    const recargarWallet = () => {
        const cantidad = parseFloat(montoRecarga);
        
        if (isNaN(cantidad)) {
            setErrorRecarga("Ingrese un monto válido");
            return;
        }
        
        if (cantidad <= 0) {
            setErrorRecarga("El monto debe ser mayor a cero");
            return;
        }

        if (cantidad > 1000) {
            setErrorRecarga("El monto máximo por recarga es $1000");
            return;
        }

        setWalletBalance(walletBalance + cantidad);
        setTransacciones([
            ...transacciones,
            { 
                id: Date.now(), 
                tipo: "Recarga", 
                monto: cantidad, 
                fecha: new Date().toISOString().split("T")[0] 
            }
        ]);
        setMontoRecarga("");
        setErrorRecarga("");
    };

    return (
        <DashboardLayout>
            <h1 className="text-2xl font-bold mb-4">Métodos de Pago</h1>

            {/* Cartera Digital */}
            <div className="bg-white p-4 rounded shadow mb-6">
                <h2 className="text-xl font-semibold mb-2">Cartera Digital</h2>
                <p>Saldo disponible: <strong>${walletBalance.toFixed(2)}</strong></p>
                
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
                        onClick={recargarWallet}
                    >
                        Recargar
                    </button>
                </div>
            </div>

            {/* Lista de métodos */}
            <div className="bg-white p-4 rounded shadow mb-6">
                <h2 className="text-xl font-semibold mb-2">Tus Métodos de Pago</h2>
                
                {metodos.length === 0 ? (
                    <p className="text-gray-500 mb-4">No tienes métodos de pago registrados</p>
                ) : (
                    <ul className="mb-4 space-y-2">
                        {metodos.map(m => (
                            <li key={m.id} className="border-b py-3 flex justify-between items-center">
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
                                    onClick={() => eliminarMetodo(m.id)} 
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
                        onChange={e => setNuevoMetodo({ ...nuevoMetodo, tipo: e.target.value })}
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
                                    onChange={e => setNuevoMetodo({ ...nuevoMetodo, numero: e.target.value })}
                                    maxLength={16}
                                />
                            </div>
                            <div>
                                <input
                                    type="text"
                                    placeholder="Titular de la tarjeta"
                                    className="border px-3 py-2 rounded w-full"
                                    value={nuevoMetodo.titular}
                                    onChange={e => setNuevoMetodo({ ...nuevoMetodo, titular: e.target.value })}
                                />
                            </div>
                            <div>
                                <input
                                    type="text"
                                    placeholder="MM/AA"
                                    className="border px-3 py-2 rounded w-full"
                                    value={nuevoMetodo.vencimiento}
                                    onChange={e => setNuevoMetodo({ ...nuevoMetodo, vencimiento: e.target.value })}
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
                        onClick={agregarMetodo} 
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
                        {transacciones.map(tx => (
                            <li key={tx.id} className="py-3">
                                <div className="flex justify-between">
                                    <div>
                                        <span className="font-medium">{tx.tipo}</span>
                                        {tx.descripcion && (
                                            <p className="text-sm text-gray-600">{tx.descripcion}</p>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <p className={tx.tipo === "Recarga" ? "text-green-600" : "text-red-600"}>
                                            {tx.tipo === "Recarga" ? "+" : "-"}${tx.monto.toFixed(2)}
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