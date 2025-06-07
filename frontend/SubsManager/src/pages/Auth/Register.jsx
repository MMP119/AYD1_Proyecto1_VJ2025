import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AuthInput from "../../components/AuthInput";
import url_fetch from '../../enviroment';

export default function Register() {
    const [form, setForm] = useState({
        username: "",
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        isVerified: false,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [passwordMatchError, setPasswordMatchError] = useState(false);
    const [success, setSuccess] = useState(false);
    const [countdown, setCountdown] = useState(5);
    const navigate = useNavigate();

    useEffect(() => {
        if (success && countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
        if (success && countdown === 0) {
            navigate("/");
        }
    }, [success, countdown, navigate]);

    useEffect(() => {
        if (form.password && form.confirmPassword) {
            setPasswordMatchError(form.password !== form.confirmPassword);
        } else {
            setPasswordMatchError(false);
        }
    }, [form.password, form.confirmPassword]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (!form.username || !form.name || !form.email || !form.password || !form.confirmPassword) {
            setError("Todos los campos son obligatorios");
            setLoading(false);
            return;
        }

        if (form.password !== form.confirmPassword) {
            setError("Las contraseñas no coinciden");
            setLoading(false);
            return;
        }

        if (!form.email.includes("@")) {
            setError("Correo electrónico inválido");
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${url_fetch}/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username: form.username,
                    name: form.name,
                    email: form.email,
                    password: form.password,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                setError(data.detail || "Error en el registro. Intenta nuevamente.");
                setLoading(false);
                return;
            }

            setSuccess(true);
        } catch (err) {
            setError("Error en el registro. Intenta nuevamente.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full mx-4 p-8 bg-white rounded-xl shadow-lg">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">SubsManager</h1>
                    <p className="text-gray-600 mt-2">Gestión de suscripciones</p>
                </div>

                <h2 className="text-2xl font-semibold text-center mb-6">Crear una cuenta</h2>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                        {error}
                    </div>
                )}

                {success ? (
                    <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md text-center">
                        ¡Registro exitoso!<br />
                        Redireccionando en {countdown}...
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <AuthInput
                            label="Nombre de usuario"
                            type="text"
                            value={form.username}
                            onChange={handleChange}
                            name="username"
                            placeholder="Ej: juanperez123"
                        />

                        <AuthInput
                            label="Nombre completo"
                            type="text"
                            value={form.name}
                            onChange={handleChange}
                            name="name"
                            placeholder="Ej: Juan Pérez"
                        />

                        <AuthInput
                            label="Correo electrónico"
                            type="email"
                            value={form.email}
                            onChange={handleChange}
                            name="email"
                            placeholder="ejemplo@correo.com"
                        />

                        <AuthInput
                            label="Contraseña"
                            type="password"
                            value={form.password}
                            onChange={handleChange}
                            name="password"
                            placeholder="••••••••"
                        />

                        <AuthInput
                            label="Confirmar contraseña"
                            type="password"
                            value={form.confirmPassword}
                            onChange={handleChange}
                            name="confirmPassword"
                            placeholder="Repite tu contraseña"
                            error={passwordMatchError ? "Las contraseñas no coinciden" : ""}
                        />

                        <div className="flex items-center">
                            <input type="checkbox" id="terms" className="mr-2" required />
                            <label htmlFor="terms" className="text-sm text-gray-600">
                                Acepto los términos y condiciones
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || passwordMatchError}
                            className={`w-full py-2 px-4 rounded-md text-white font-medium ${loading || passwordMatchError
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "bg-blue-600 hover:bg-blue-700"
                                } transition-colors`}
                        >
                            {loading ? "Registrando..." : "Registrarse"}
                        </button>
                    </form>
                )}

                <div className="mt-6 text-center text-sm text-gray-600">
                    ¿Ya tienes una cuenta?{" "}
                    <a href="/" className="text-blue-600 hover:underline">
                        Inicia sesión
                    </a>
                </div>
            </div>
        </div>
    );
}
