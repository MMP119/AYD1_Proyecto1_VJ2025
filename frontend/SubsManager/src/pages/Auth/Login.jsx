import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import AuthInput from "../../components/AuthInput";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(""); // Limpiar error al escribir
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validación básica
    if (!form.email || !form.password) {
      setError("Todos los campos son obligatorios");
      setLoading(false);
      return;
    }

    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      
      if (!storedUser || storedUser.email !== form.email || storedUser.password !== form.password) {
        throw new Error("Credenciales incorrectas");
      }

      toast.success("Inicio de sesión exitoso");
      navigate(storedUser.role === "admin" ? "/admin/dashboard" : "/user/dashboard");
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
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

        <h2 className="text-2xl font-semibold text-center mb-6">Iniciar Sesión</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <AuthInput
            label="Correo Electrónico"
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

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 rounded-md text-white font-medium ${
              loading ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
            } transition-colors`}
          >
            {loading ? "Cargando..." : "Iniciar Sesión"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          ¿No tienes una cuenta?{" "}
          <a href="/register" className="text-green-600 hover:underline">
            Regístrate
          </a>
        </div>
      </div>
    </div>
  );
}