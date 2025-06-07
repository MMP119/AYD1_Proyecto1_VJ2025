import React, { useState, useEffect } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { useAuth } from "../../context/AuthContext";
import url_fetch from '../../enviroment';
import { useNavigate } from "react-router-dom";

export default function PerfilUsuario() {

    const { user } = useAuth();

    const profile = {
        UserId: user?.id,
        Name: user?.name,
        Email: user?.email,
        Rol: user?.role,
        Username: user?.username,
        NewPassword: "",
        ConfirmPassword: "",
    };
    const [perfil, setPerfil] = useState(profile);
    const [editando, setEditando] = useState(false);
    const [errores, setErrores] = useState({});
    const [mensaje, setMensaje] = useState({ text: "", type: "" });
    const [mostrarPassword, setMostrarPassword] = useState(false);
    const [cambiarPassword, setCambiarPassword] = useState(false);
    const [countdown, setCountdown] = useState(5);
    const navigate = useNavigate();

    useEffect(() => {
        if (mensaje.type === "success" && countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
        if (mensaje.type === "success" && countdown === 0) {
            navigate("/");
        }
    }, [mensaje, countdown, navigate]);

    const handleChange = (e) => {
        setPerfil({ ...perfil, [e.target.name]: e.target.value });
        if (errores[e.target.name]) {
            setErrores({ ...errores, [e.target.name]: "" });
        }
    };

    const validar = () => {
        const nuevosErrores = {};

        if (!perfil.Name.trim()) {
            nuevosErrores.Name = "El nombre completo es obligatorio";
        }
        if (!perfil.Email.trim()) {
            nuevosErrores.Email = "El correo electrónico es obligatorio";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(perfil.Email)) {
            nuevosErrores.Email = "Correo electrónico no válido";
        }
        if (!perfil.Username.trim()) {
            nuevosErrores.Username = "El nombre de usuario es obligatorio";
        }

        if (cambiarPassword) {
            if (perfil.NewPassword && perfil.NewPassword !== perfil.ConfirmPassword) {
                nuevosErrores.ConfirmPassword = "Las contraseñas no coinciden";
            }
        }

        setErrores(nuevosErrores);
        return Object.keys(nuevosErrores).length === 0;
    };

    const handleGuardar = async () => {
        if (!validar()) return;

        try {
            const body = {
                username: perfil.Username,
                name: perfil.Name,
                email: perfil.Email,
            };

            // Solo enviar password si se va a cambiar
            if (cambiarPassword && perfil.NewPassword) {
                body.password = perfil.NewPassword;
            }

            const response = await fetch(`${url_fetch}/update_user/${user.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            });

            const data = await response.json();

            if (!response.ok) {
                setMensaje({ text: data.detail || "Error al actualizar el perfil", type: "error" });
                return;
            }

            setMensaje({ text: "Perfil actualizado correctamente", type: "success" });
            setCountdown(5); // Reinicia el contador
            setEditando(false);
            setCambiarPassword(false);
            setMostrarPassword(false);
            setPerfil(prev => ({
                ...prev,
                NewPassword: "",
                ConfirmPassword: "",
            }));
        } catch (error) {
            setMensaje({ text: "Error al actualizar el perfil", type: "error" });
        }
    };

    const handleCancelar = () => {
        setPerfil(profile);
        setEditando(false);
        setCambiarPassword(false);
        setMostrarPassword(false);
        setErrores({});
    };

    return (
        <DashboardLayout>
            <div className="max-w-2xl mx-auto p-6">
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <h1 className="text-2xl font-bold">Configuración de Perfil</h1>
                                <p className="text-blue-100">Administra tu información personal</p>
                            </div>
                            {!editando ? (
                                <button
                                    onClick={() => setEditando(true)}
                                    className="px-5 py-2 bg-white text-blue-700 rounded-lg font-medium hover:bg-blue-50 transition-colors"
                                >
                                    Editar Perfil
                                </button>
                            ) : (
                                <div className="flex gap-3">
                                    <button
                                        onClick={handleGuardar}
                                        className="px-5 py-2 bg-white text-green-700 rounded-lg font-medium hover:bg-green-50 transition-colors"
                                    >
                                        Guardar Cambios
                                    </button>
                                    <button
                                        onClick={handleCancelar}
                                        className="px-5 py-2 bg-white text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {mensaje.text && (
                        <div className={`p-4 ${mensaje.type === "success"
                                ? "bg-green-50 text-green-700"
                                : "bg-red-50 text-red-700"
                            }`}>
                            {mensaje.text}
                            {mensaje.type === "success" && (
                                <div>Redireccionando en {countdown}...</div>
                            )}
                        </div>
                    )}

                    <div className="p-6 space-y-8">
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Información Personal</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo *</label>
                                    <input
                                        type="text"
                                        name="Name"
                                        value={perfil.Name}
                                        onChange={handleChange}
                                        disabled={!editando}
                                        className={`w-full px-4 py-2 rounded-lg border ${errores.Name ? "border-red-500" : "border-gray-300"
                                            } ${!editando ? "bg-gray-50" : "bg-white"}`}
                                    />
                                    {errores.Name && <p className="mt-1 text-sm text-red-600">{errores.Name}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico *</label>
                                    <input
                                        type="email"
                                        name="Email"
                                        value={perfil.Email}
                                        onChange={handleChange}
                                        disabled={!editando}
                                        className={`w-full px-4 py-2 rounded-lg border ${errores.Email ? "border-red-500" : "border-gray-300"
                                            } ${!editando ? "bg-gray-50" : "bg-white"}`}
                                    />
                                    {errores.Email && <p className="mt-1 text-sm text-red-600">{errores.Email}</p>}
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de usuario *</label>
                                    <input
                                        type="text"
                                        name="Username"
                                        value={perfil.Username}
                                        onChange={handleChange}
                                        disabled={!editando}
                                        className={`w-full px-4 py-2 rounded-lg border ${errores.Username ? "border-red-500" : "border-gray-300"
                                            } ${!editando ? "bg-gray-50" : "bg-white"}`}
                                    />
                                    {errores.Username && <p className="mt-1 text-sm text-red-600">{errores.Username}</p>}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Seguridad</h2>

                            {!editando ? (
                                <button
                                    onClick={() => {
                                        setEditando(true);
                                        setCambiarPassword(true);
                                    }}
                                    className="px-4 py-2 text-blue-600 font-medium hover:text-blue-800 transition-colors"
                                >
                                    Cambiar contraseña
                                </button>
                            ) : cambiarPassword ? (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Nueva contraseña</label>
                                            <input
                                                type="password"
                                                name="NewPassword"
                                                value={perfil.NewPassword}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2 rounded-lg border border-gray-300"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar nueva contraseña</label>
                                            <input
                                                type="password"
                                                name="ConfirmPassword"
                                                value={perfil.ConfirmPassword}
                                                onChange={handleChange}
                                                className={`w-full px-4 py-2 rounded-lg border ${errores.ConfirmPassword ? "border-red-500" : "border-gray-300"
                                                    }`}
                                            />
                                            {errores.ConfirmPassword && <p className="mt-1 text-sm text-red-600">{errores.ConfirmPassword}</p>}
                                        </div>
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
