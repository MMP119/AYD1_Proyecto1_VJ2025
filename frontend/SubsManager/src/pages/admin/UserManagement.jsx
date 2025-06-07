import { useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import url_fetch from '../../enviroment';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal de edición
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [editForm, setEditForm] = useState({
    Name: "",
    Email: "",
    Username: "",
    Rol: "",
    AccountStatus: "",
    NewPassword: ""
  });
  const [showConfirm, setShowConfirm] = useState(false);

  // Obtener usuarios del backend
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(`${url_fetch}/admin/usuarios`);
        const data = await response.json();
        setUsers(data.usuarios || []);
      } catch (error) {
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // Abrir modal y cargar datos del usuario
  const openEditModal = (user) => {
    setEditUser(user);
    setEditForm({
      Name: user.Name,
      Email: user.Email,
      Username: user.Username,
      Rol: user.Rol,
      AccountStatus: user.AccountStatus
    });
    setShowModal(true);
  };

  // Cerrar modal
  const closeModal = () => {
    setShowModal(false);
    setEditUser(null);
    setShowConfirm(false);
  };

  // Guardar cambios
  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleSaveClick = () => {
    setShowConfirm(true);
  };

  const saveEdit = async () => {
    try {
      const body = {
        name: editForm.Name,
        email: editForm.Email,
        rol: editForm.Rol,
        accountStatus: editForm.AccountStatus,
        user: editForm.Username
      };
      if (editForm.NewPassword && editForm.NewPassword.trim() !== "") {
        body.newPassword = editForm.NewPassword;
      }
      await fetch(`${url_fetch}/admin/usuarios/${editUser.UserId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      setUsers(users =>
        users.map(user =>
          user.UserId === editUser.UserId
            ? {
                ...user,
                Name: editForm.Name,
                Email: editForm.Email,
                Username: editForm.Username,
                Rol: editForm.Rol,
                AccountStatus: editForm.AccountStatus
              }
            : user
        )
      );
      closeModal();
    } catch (error) {}
  };

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-4">Gestión de Usuarios</h1>

      {loading ? (
        <p>Cargando usuarios...</p>
      ) : users.length === 0 ? (
        <p>No hay usuarios registrados.</p>
      ) : (
        <table className="w-full text-left border">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2">Nombre</th>
              <th className="p-2">Correo</th>
              <th className="p-2">Usuario</th>
              <th className="p-2">Rol</th>
              <th className="p-2">Estado</th>
              <th className="p-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.UserId} className="border-t">
                <td className="p-2">{user.Name}</td>
                <td className="p-2">{user.Email}</td>
                <td className="p-2">{user.Username}</td>
                <td className="p-2">{user.Rol}</td>
                <td className="p-2">
                  {user.AccountStatus === "active" ? (
                    <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 font-semibold text-xs">
                      Activo
                    </span>
                  ) : user.AccountStatus === "deactivated" ? (
                    <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 font-semibold text-xs">
                      Inactivo
                    </span>
                  ) : (
                    <span className="px-2 py-1 rounded-full bg-red-100 text-red-700 font-semibold text-xs">
                      Eliminado
                    </span>
                  )}
                </td>
                <td className="p-2 space-x-2">
                  {user.AccountStatus !== "deleted" && user.Rol !== "administrator" && (
                    <button
                      onClick={() => openEditModal(user)}
                      className="px-2 py-1 rounded text-white bg-blue-600"
                    >
                      Editar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Modal de edición */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Editar Usuario</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium">Nombre</label>
                <input
                  type="text"
                  name="Name"
                  value={editForm.Name}
                  onChange={handleEditChange}
                  className="w-full border px-3 py-2 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Correo</label>
                <input
                  type="email"
                  name="Email"
                  value={editForm.Email}
                  onChange={handleEditChange}
                  className="w-full border px-3 py-2 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Usuario</label>
                <input
                  type="text"
                  name="Username"
                  value={editForm.Username}
                  onChange={handleEditChange}
                  className="w-full border px-3 py-2 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Rol</label>
                <select
                  name="Rol"
                  value={editForm.Rol}
                  onChange={handleEditChange}
                  className="w-full border px-3 py-2 rounded"
                >
                  <option value="user">Usuario</option>
                  <option value="administrator">Administrador</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium">Estado</label>
                <select
                  name="AccountStatus"
                  value={editForm.AccountStatus}
                  onChange={handleEditChange}
                  className="w-full border px-3 py-2 rounded"
                >
                  <option value="active">Activo</option>
                  <option value="deactivated">Inactivo</option>
                  <option value="deleted">Eliminado</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium">Nueva contraseña</label>
                <input
                  type="password"
                  name="NewPassword"
                  value={editForm.NewPassword || ""}
                  onChange={handleEditChange}
                  className="w-full border px-3 py-2 rounded"
                  placeholder="Dejar en blanco para no cambiar"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={closeModal}
                className="px-4 py-2 rounded bg-gray-300"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveClick}
                className="px-4 py-2 rounded bg-green-600 text-white"
              >
                Guardar
              </button>
            </div>
            {/* Confirmación */}
            {showConfirm && (
              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
                <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-xs">
                  <h3 className="text-lg font-semibold mb-4">¿Confirmar cambios?</h3>
                  <p className="mb-4">¿Estás seguro de guardar los cambios en este usuario?</p>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setShowConfirm(false)}
                      className="px-4 py-2 rounded bg-gray-300"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={saveEdit}
                      className="px-4 py-2 rounded bg-green-600 text-white"
                    >
                      Confirmar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}