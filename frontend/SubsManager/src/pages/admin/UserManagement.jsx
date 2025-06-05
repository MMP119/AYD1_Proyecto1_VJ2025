import { useState } from "react";

export default function UserManagement() {
  const [users, setUsers] = useState([
    {
      name: "Ana Pérez",
      email: "ana@correo.com",
      isVerified: true,
      role: "user",
    },
    {
      name: "Luis Martínez",
      email: "luis@correo.com",
      isVerified: false,
      role: "user",
    },
    {
      name: "Sofía García",
      email: "sofia@correo.com",
      isVerified: true,
      role: "user",
    },
  ]);

  const toggleStatus = (email) => {
    const updated = users.map((user) =>
      user.email === email ? { ...user, isVerified: !user.isVerified } : user
    );
    setUsers(updated);
  };

  const deleteUser = (email) => {
    const updated = users.filter((user) => user.email !== email);
    setUsers(updated);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Gestión de Usuarios</h1>

      {users.length === 0 ? (
        <p>No hay usuarios registrados.</p>
      ) : (
        <table className="w-full text-left border">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2">Nombre</th>
              <th className="p-2">Correo</th>
              <th className="p-2">Estado</th>
              <th className="p-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.email} className="border-t">
                <td className="p-2">{user.name}</td>
                <td className="p-2">{user.email}</td>
                <td className="p-2">
                  {user.isVerified ? "Activo" : "Inactivo"}
                </td>
                <td className="p-2 space-x-2">
                  <button
                    onClick={() => toggleStatus(user.email)}
                    className={`px-2 py-1 rounded text-white ${
                      user.isVerified ? "bg-yellow-500" : "bg-green-600"
                    }`}
                  >
                    {user.isVerified ? "Desactivar" : "Activar"}
                  </button>
                  <button
                    onClick={() => deleteUser(user.email)}
                    className="px-2 py-1 rounded text-white bg-red-600"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
