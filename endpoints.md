# Documentación de Endpoints de la API

A continuación se presentan todos los endpoints usados en la API junto con un ejemplo de entrada (cuando corresponde) y la respuesta esperada.

---

## 1. Registro de Usuario

**Endpoint:** `POST /register`  
**Descripción:** Registra un nuevo usuario.

**Ejemplo de solicitud (JSON):**
```json
{
  "username": "juan123",
  "name": "Juan Pérez",
  "email": "juan@correo.com",
  "rol": "user",
  "password": "contraseñaSecreta"
}
```

**Respuesta exitosa (JSON):**
```json
{
  "status": "success",
  "message": "Usuario registrado exitosamente"
}
```

---

## 2. Inicio de Sesión

**Endpoint:** `POST /login`  
**Descripción:** Valida las credenciales del usuario y realiza el login.

**Ejemplo de solicitud (JSON):**
```json
{
  "email": "juan@correo.com",
  "password": "contraseñaSecreta"
}
```

**Respuesta exitosa (JSON):**
```json
{
  "status": "success",
  "message": "Login exitoso",
  "user_id": 1,
  "rol": "user"
}
```

---

## 3. Actualización de Datos de Usuario

**Endpoint:** `PUT /update_user/{user_id}`  
**Descripción:** Actualiza la información de un usuario existente.

**Ejemplo de solicitud (JSON):**
```json
{
  "username": "juan_updated",
  "name": "Juan Pérez Actualizado",
  "email": "juan_actualizado@correo.com",
  "rol": "user",
  "password": "nuevaContraseña"
}
```

**Respuesta exitosa (JSON):**
```json
{
  "status": "success",
  "message": "Usuario actualizado exitosamente"
}
```

---

## 4. Métricas del Administrador

**Endpoint:** `GET /admin/metricas`  
**Descripción:** Devuelve estadísticas generales del sistema.

**Ejemplo de solicitud:**  
Sin cuerpo (solo consulta GET).

**Respuesta exitosa (JSON):**
```json
{
  "total_users": 120,
  "top_services": [
    {"ServiceId": 1, "Name": "Netflix", "suscripciones": 45},
    {"ServiceId": 2, "Name": "Spotify", "suscripciones": 30}
  ],
  "ingresos_por_mes": [
    {"mes": "2025-01", "ingresos": 200},
    {"mes": "2025-02", "ingresos": 400}
  ],
  "suscripciones_status": {
    "activas": 70,
    "inactivas": 30
  }
}
```

---

## 5. Listado de Usuarios

**Endpoint:** `GET /admin/usuarios`  
**Descripción:** Lista todos los usuarios registrados.

**Ejemplo de solicitud:**  
Sin cuerpo.

**Respuesta exitosa (JSON):**
```json
{
  "usuarios": [
    {
      "UserId": 1,
      "Name": "Ana Pérez",
      "Email": "ana@correo.com",
      "Rol": "user",
      "AccountStatus": "active",
      ...
    },
    { ... }
  ]
}
```

---

## 6. Obtener Información de un Usuario

**Endpoint:** `GET /admin/usuarios/{usuario_id}`  
**Descripción:** Obtiene la información de un usuario específico.

**Ejemplo de solicitud:**  
Sin cuerpo, usando la URL: `/admin/usuarios/1`

**Respuesta exitosa (JSON):**
```json
{
  "usuario": {
    "UserId": 1,
    "Name": "Ana Pérez",
    "Email": "ana@correo.com",
    "Rol": "user",
    "AccountStatus": "active",
    ...
  }
}
```

---

## 7. Editar Usuario (Administrador)

**Endpoint:** `PUT /admin/usuarios/{usuario_id}`  
**Descripción:** Permite editar los datos de un usuario.

**Ejemplo de solicitud (JSON):**
```json
{
  "name": "Ana Modificada",
  "email": "ana_modificada@correo.com",
  "rol": "user",
  "accountStatus": "active",
  "user": "anaUser"
}
```

**Respuesta exitosa (JSON):**
```json
{
  "message": "Usuario actualizado correctamente"
}
```

---

## 8. Eliminar Usuario

**Endpoint:** `DELETE /admin/usuarios/{usuario_id}`  
**Descripción:** Marca la cuenta de un usuario como eliminada (AccountStatus = "deleted").

**Ejemplo de solicitud:**  
Sin cuerpo, usando la URL: `/admin/usuarios/1`

**Respuesta exitosa (JSON):**
```json
{
  "message": "Usuario eliminado correctamente"
}
```

---

## 9. Listado de Suscripciones

**Endpoint:** `GET /admin/suscripciones`  
**Descripción:** Lista todas las suscripciones registradas (el filtrado se realiza en el frontend).

**Ejemplo de solicitud:**  
Sin cuerpo.

**Respuesta exitosa (JSON):**
```json
{
  "suscripciones": [
    {
      "SubscriptionId": 1,
      "UserId": 1,
      "PlanId": 2,
      "StartDate": "2025-01-10T12:00:00",
      "EndDate": "2025-02-10T12:00:00",
      "Status": "active",
      "AmountPaid": 10.99,
      "PaymentMethod": "card"
    },
    { ... }
  ]
}
```
---

## 10. Listo de Servicios

**Endpoint:** `GET /admin/servicios`  
**Descripción:** Lista todos los servicios registrados.

**Ejemplo de solicitud:**  
Sin cuerpo.

**Respuesta exitosa (JSON):**
```json
{
  "servicios": [
    {
      "ServiceId": 1,
      "Name": "Netflix",
      "Category": "Streaming",
      "Description": "Películas y series ilimitadas.",
      "PlanType": "mensual",
      "Price": 10.99
    },
    { ... }
  ]
}
```

---
## 11. Registrar nuevo Servicio
**Endpoint:** `POST /admin/servicios`  
**Descripción:** Registra un nuevo servicio y su plan asociado.

**Ejemplo de solicitud (JSON):**
```json
{
  "name": "HBO Max",
  "category": "Streaming",
  "description": "Películas y series en exclusiva.",
  "price": 11.99,
  "plan_type": "mensual"
}
```

**Respuesta exitosa (JSON):**
```json
{
  "message": "Servicio registrado exitosamente",
  "service_id": 2,
  "plan_id": 5
}
```

---
## 12. Editar un Servicio
**Endpoint:** `PUT /admin/servicios/{service_id}`  
**Descripción:** Edita/actualiza la información de un servicio existente.

**Ejemplo de solicitud (JSON):**
```json
{
  "name": "HBO Max Plus",
  "category": "Streaming",
  "description": "Todos los contenidos de HBO Max con extras.",
  "price": 13.99,
  "plan_type": "mensual"
}
```

**Respuesta exitosa (JSON):**
```json
{
  "message": "Servicio actualizado exitosamente"
}
```

---
## 13. Eliminar un Servicio
**Endpoint:** `DELETE /admin/servicios/{service_id}`  
**Descripción:** Elimina un servicio y su plan asociado.

**Ejemplo de solicitud:**  
Sin cuerpo, utilizando el `service_id` en la URL.

**Respuesta exitosa (JSON):**
```json
{
  "message": "Servicio eliminado exitosamente"
}
```

---

## 14. Endpoint Raíz

**Endpoint:** `GET /`  
**Descripción:** Mensaje de bienvenida simple desde la API.

**Ejemplo de solicitud:**  
GET a la URL raíz.

**Respuesta exitosa (JSON):**
```json
{
  "message": "Hola mundo desde la API"
}
```
---