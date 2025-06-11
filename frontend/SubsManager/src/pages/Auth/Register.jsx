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
        confirmPassword: ""
    });
    const [step, setStep] = useState("register"); // "register" o "verify"
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [passwordMatchError, setPasswordMatchError] = useState(false);
    const [countdown, setCountdown] = useState(5);
    const navigate = useNavigate();

    // manejar redirección tras confirmación
    useEffect(() => {
        if (step === "done" && countdown > 0) {
        const t = setTimeout(() => setCountdown(c => c - 1), 1000);
        return () => clearTimeout(t);
        }
        if (step === "done" && countdown === 0) {
        navigate("/");
        }
    }, [step, countdown, navigate]);

    // chequeo de contraseñas
    useEffect(() => {
        if (form.password && form.confirmPassword) {
        setPasswordMatchError(form.password !== form.confirmPassword);
        } else {
        setPasswordMatchError(false);
        }
    }, [form.password, form.confirmPassword]);

    const handleChange = e => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError("");
    };

    const handleRegister = async e => {
        e.preventDefault();
        setError("");
        setLoading(true);

        // validaciones básicas
        if (!form.username || !form.name || !form.email || !form.password || !form.confirmPassword) {
        setError("Todos los campos son obligatorios");
        setLoading(false);
        return;
        }
        if (passwordMatchError) {
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
        const res = await fetch(`${url_fetch}/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
            username: form.username,
            name: form.name,
            email: form.email,
            password: form.password
            })
        });

        if (!res.ok) {
            const data = await res.json();
            setError(data.detail || "Error en el registro.");
        } else {
            // paso siguiente: pedir código
            setStep("verify");
        }
        } catch {
        setError("Error en el registro. Intenta nuevamente.");
        } finally {
        setLoading(false);
        }
    };

    const handleVerify = async e => {
        e.preventDefault();
        setError("");
        setLoading(true);

        if (!code) {
        setError("Ingresa el código de confirmación");
        setLoading(false);
        return;
        }

        try {
        const res = await fetch(`${url_fetch}/confirmEmail`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: form.email, code })
        });
        if (!res.ok) {
            const data = await res.json();
            setError(data.detail || "Código inválido");
        } else {
            setStep("done");
        }
        } catch {
        setError("Error al verificar el código.");
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

            {step === "register" && (
            <>
                <h2 className="text-2xl font-semibold text-center mb-6">Crear una cuenta</h2>
                {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">{error}</div>}
                <form onSubmit={handleRegister} className="space-y-4">
                {/* Inputs de usuario */}
                <AuthInput label="Usuario" name="username" value={form.username} onChange={handleChange} />
                <AuthInput label="Nombre" name="name" value={form.name} onChange={handleChange} />
                <AuthInput label="Correo" name="email" type="email" value={form.email} onChange={handleChange} />
                <AuthInput label="Contraseña" name="password" type="password" value={form.password} onChange={handleChange} />
                <AuthInput label="Repite contraseña" name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange}
                            error={passwordMatchError ? "Las contraseñas no coinciden" : ""} />
                <button type="submit" disabled={loading || passwordMatchError}
                    className={`w-full py-2 rounded-md text-white font-medium ${loading || passwordMatchError ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"}`}>
                    {loading ? "Enviando..." : "Registrarse"}
                </button>
                </form>
                <p className="text-sm text-gray-600 mt-4">
                ¿Ya tienes cuenta? <a href="/" className="text-blue-600">Inicia sesión</a>
                </p>
            </>
            )}

            {step === "verify" && (
            <>
                <h2 className="text-2xl font-semibold text-center mb-6">Verifica tu correo</h2>
                <p className="text-gray-700 mb-4">Te hemos enviado un código a {form.email}. Ingresa abajo:</p>
                {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">{error}</div>}
                <form onSubmit={handleVerify} className="space-y-4">
                <AuthInput label="Código de verificación" name="code" value={code} onChange={e => setCode(e.target.value)} />
                <button type="submit" disabled={loading}
                    className={`w-full py-2 rounded-md text-white font-medium ${loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"}`}>
                    {loading ? "Verificando..." : "Verificar código"}
                </button>
                </form>
            </>
            )}

            {step === "done" && (
            <div className="text-center p-4 bg-green-100 text-green-700 rounded-md">
                ¡Cuenta verificada! Redirigiendo en {countdown}...
            </div>
            )}
        </div>
        </div>
    );
}
