import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import AuthInput from "../../components/AuthInput";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    confirmEmail: "",
    password: "",
    isVerified: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailMatchError, setEmailMatchError] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (form.email && form.confirmEmail) {
      setEmailMatchError(form.email !== form.confirmEmail);
    } else {
      setEmailMatchError(false);
    }
  }, [form.email, form.confirmEmail]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!form.name || !form.email || !form.confirmEmail || !form.password) {
      setError("Todos los campos son obligatorios");
      setLoading(false);
      return;
    }

    if (form.email !== form.confirmEmail) {
      setError("Los correos no coinciden");
      setLoading(false);
      return;
    }

    if (!form.email.includes("@")) {
      setError("Correo electrónico inválido");
      setLoading(false);
      return;
    }

    try {
      localStorage.setItem(
        "user",
        JSON.stringify({
          ...form,
          role: "user",
          isVerified: false,
        })
      );

      toast.success("¡Usuario creado exitosamente!");

      // Esperar un momento antes de redirigir
      setTimeout(() => {
        navigate("/");
      }, 2000); // Redirige a login en 2 segundos
    } catch (err) {
      setError("Error en el registro. Intenta nuevamente.");
      toast.error("Error en el registro");
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

        <form onSubmit={handleSubmit} className="space-y-4">
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
            label="Confirmar correo electrónico"
            type="email"
            value={form.confirmEmail}
            onChange={handleChange}
            name="confirmEmail"
            placeholder="Repite tu correo"
            error={emailMatchError ? "Los correos no coinciden" : ""}
          />

          <AuthInput
            label="Contraseña"
            type="password"
            value={form.password}
            onChange={handleChange}
            name="password"
            placeholder="••••••••"
          />

          <div className="flex items-center">
            <input type="checkbox" id="terms" className="mr-2" required />
            <label htmlFor="terms" className="text-sm text-gray-600">
              Acepto los términos y condiciones
            </label>
          </div>

          <button
            type="submit"
            disabled={loading || emailMatchError}
            className={`w-full py-2 px-4 rounded-md text-white font-medium ${
              loading || emailMatchError
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            } transition-colors`}
          >
            {loading ? "Registrando..." : "Registrarse"}
          </button>
        </form>

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
