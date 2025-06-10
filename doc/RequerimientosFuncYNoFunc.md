# Requerimiento Funcionales y No Funcionales

# Requerimientos Funcionales

### Gestión de Usuarios

- El sistema debe permitir el registro de nuevos usuarios proporcionando datos personales
- El sistema debe verificar las cuentas de usuario mediante correo electrónico
- El sistema debe permitir el inicio de sesión con credenciales válidas
- El sistema debe permitir el cierre de sesión
- El sistema debe permitir la actualización de información personal del usuario
- El sistema debe permitir el cambio de contraseña desde el panel de usuario

###  Funcionalidades del Administrador

- El administrador debe poder visualizar un listado de usuarios registrados
- El administrador debe poder editar información de usuarios
- El administrador debe poder activar, desactivar o eliminar cuentas de usuario
- El administrador debe poder ver todas las suscripciones (activas, canceladas, vencidas)
- El administrador debe poder filtrar suscripciones por estado, tipo de servicio o fecha
- El administrador debe poder registrar, editar o eliminar servicios disponibles
- El administrador debe poder visualizar métricas del sistema con gráficos
- El administrador debe poder generar reportes de suscripciones por usuario
- El administrador debe poder generar reportes de suscripciones por categoría
- El administrador debe poder generar reportes de ingresos totales

### Funcionalidades del Usuario

- El usuario debe poder explorar servicios disponibles
- El usuario debe poder buscar servicios por nombre o categoría
- El usuario debe poder suscribirse a servicios eligiendo plan y método de pago
- El usuario debe poder visualizar historial de suscripciones
- El usuario debe poder ver el estado de sus suscripciones
- El usuario debe poder cancelar suscripciones activas
- El usuario debe recibir notificaciones por correo sobre suscripciones próximas a vencer
- El usuario debe recibir confirmaciones de pago por correo
- El usuario debe poder registrar, editar o eliminar métodos de pago
- El usuario debe poder recargar crédito en su cartera digital
- El usuario debe poder visualizar historial de recargas y transacciones
- El usuario debe poder visualizar gráficos de consumo mensual y anual
- El usuario debe poder clasificar suscripciones por categorías

### Gestión de Servicios

- El sistema debe almacenar información de servicios (nombre, categoría, descripción, precio, tipo de plan)
- El sistema debe permitir diferentes tipos de planes (mensual, anual, etc.)
- El sistema debe categorizar los servicios disponibles

### Sistema de Pagos

- El sistema debe simular una cartera digita
- El sistema debe procesar pagos mediante descuento de crédito
- El sistema debe registrar todas las transacciones
- El sistema debe validar fondos suficientes antes de procesar pagos

# Requerimientos No Funcionales

### Usabilidad

- La interfaz debe ser intuitiva y fácil de usar
- El sistema debe ser responsive para diferentes dispositivos
- Los tiempos de respuesta de la interfaz no deben exceder 3 segundos

### Seguridad

- Las contraseñas deben ser encriptadas usando algoritmos seguros
- El sistema debe implementar autenticación y autorización

### Rendimiento

- Los reportes deben generarse en menos de 10 segundos

### Portabilidad

- El sistema puede desplegarse en diferentes entornos (local, nube)
- El sistema puede usar contenedores para facilitar el despliegue