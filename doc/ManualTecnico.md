# Manual Técnico del Proyecto AYD1_Proyecto1_VJ2025_G4

Este manual documenta en detalle la arquitectura, componentes, flujos de trabajo y la configuración de todo el proyecto. El sistema abarca un backend (API) desarrollado en FastAPI, una interfaz de usuario en React + Vite, además de la infraestructura de base de datos y despliegue mediante Docker.

---

## 1. Introducción

El proyecto es una plataforma de gestión de suscripciones que ofrece funcionalidades para:
- Registro, autenticación y gestión de usuarios.
- Administración de servicios, suscripciones y reportes.
- Generación de métricas y análisis estadístico en tiempo real.
- Gestión de gastos y seguimiento financiero.
- Interacción segura y escalable con una base de datos MySQL.

---

## 2. Arquitectura del Sistema

### 2.1. Componentes Principales

- **Backend API (FastAPI):**
  - Manejo de autenticación y autorización.
  - Rutas para registro, inicio de sesión, gestión de usuarios, servicios, suscripciones, reportes y métricas.
  - Uso de middleware CORS para permitir el acceso desde distintos orígenes.
  - Scheduler integrado para tareas programadas (por ejemplo, notificaciones y procesos de mantenimiento).

- **Frontend (React + Vite):**
  - Interfaz basada en componentes reutilizables y páginas dinámicas.
  - Uso de TailwindCSS para estilos modernos y responsivos.
  - Rutas protegidas mediante contexto de autenticación.

- **Base de Datos (MySQL):**
  - Configurada a través de Docker (docker-compose).
  - Esquema incluye tablas para usuarios, servicios, planes, suscripciones, pagos, notificaciones y transacciones de wallet.

- **Deployment e Integraciones:**
  - Docker y docker-compose facilitan la configuración y despliegue.
  - Scheduler para procesos periódicos y tareas en background.
  - Integración con herramientas de logging y monitoreo para depuración y control.

---

## 3. Estructura del Proyecto

```
/home/mario/Escritorio/GitHub/ayd1_proyecto1_vj2025_g4/
│
├── backend/
│   ├── API/
│   │   ├── main.py            // Punto de entrada de la API.
│   │   ├── routes/            // Rutas que incluyen: sistema, administración y usuario.
│   │   │   ├── sistema.py
│   │   │   ├── admin/
│   │   │   │   ├── gestionUsuarios.py
│   │   │   │   ├── gestionSuscripciones.py
│   │   │   │   ├── gestionSerivicios.py
│   │   │   │   ├── reportes.py
│   │   │   │   └── panelControl.py
│   │   │   └── user/
│   │   │       ├── subscriptionUser.py
│   │   │       ├── paymentMethodUser.py
│   │   │       └── billsUser.py
│   │   ├── database.py        // Configuración y pool de conexiones.
│   │   ├── scheduler.py       // Definición e inicio del scheduler.
│   │   ├── Dockerfile         // Imagen Docker para la API.
│   │   └── ...existing code...
│   ├── DB/
│   │   └── DBSubPlatm.sql     // Script SQL para crear el esquema de la base de datos.
│   └── README.md
│
├── frontend/
│   └── SubsManager/
│       ├── src/
│       │   ├── App.jsx        // Punto de entrada de la aplicación React.
│       │   ├── context/       // Contexto de autenticación y otros contextos globales.
│       │   ├── components/    // Componentes reutilizables (NavBar, Sidebar, DashboardLayout).
│       │   ├── pages/         // Páginas o vistas para usuario y administrador.
│       │   ├── routes/        // Definición de rutas y navegación.
│       │   └── ...existing code...
│       ├── vite.config.js     // Configuración de Vite y plugins (React, Tailwind).
│       ├── package.json
│       └── README.md
│
├── docker-compose.yml         // Configuración para orquestar los contenedores (API y DB).
└── TECHNICAL_MANUAL.md        // Este manual técnico.
```

---

## 4. Detalle del Backend (API)

### 4.1. Framework y Bibliotecas
- **FastAPI**: Framework para construir APIs de alto rendimiento.
- **aiomysql**: Para conexión asíncrona a la base de datos MySQL.
- **CORSMiddleware**: Para gestionar CORS y permitir solicitudes de otros dominios.
- **Logging**: Configuración centralizada para el monitoreo de errores y eventos.

### 4.2. Principales Endpoints y Funcionalidades

- **Registro e Inicio de Sesión:**
  - `/register`: Registra un nuevo usuario.
  - `/login`: Valida credenciales e inicia sesión.

- **Gestión de Usuarios:**
  - `/admin/usuarios`: Listar, obtener, actualizar y eliminar usuarios.
  
- **Gestión de Servicios:**
  - `/admin/servicios`: Creación, actualización y eliminación de servicios y planes asociados.
  
- **Gestión de Suscripciones:**
  - `/admin/suscripciones`: Permite visualizar y filtrar suscripciones.
  
- **Métricas y Reportes:**
  - `/admin/metricas`: Devuelve estadísticas globales (total de usuarios, ingresos por mes, suscripciones activas/inactivas).
  - Endpoints para exportar reportes en HTML (rutas definidas en `reportes.py`).

- **Rutas de Usuario:**
  - Suscripción, métodos de pago y facturación, por ejemplo en `subscriptionUser.py`, `paymentMethodUser.py` y `billsUser.py`.

### 4.3. Conexión y Pool de Base de Datos
- El archivo `database.py` gestiona la creación y reutilización del pool de conexiones.
- Durante el evento `startup` de la API, se establece la conexión con MySQL y se inicia el scheduler.

### 4.4. Scheduler
- El scheduler, definido en `scheduler.py`, se encarga de ejecutar tareas programadas.
- Ejemplo de uso: Notificaciones, limpieza de datos o generación periódica de reportes.

---

## 5. Detalle del Frontend

### 5.1. Tecnologías y Herramientas
- **React**: Librería para construir interfaces de usuario interactivas.
- **Vite**: Herramienta de bundling optimizada para desarrollo con React.
- **TailwindCSS**: Framework CSS para estilos modernos y responsivos.
- **Nivo Charts**: Biblioteca para la visualización de gráficos y reportes interactivos.

### 5.2. Funcionalidades Clave
- **Dashboard del Usuario y Administrador:**
  - Páginas de perfil, suscripciones y explorador de servicios.
  - Rutas protegidas mediante contexto de autenticación.
- **Gestión de Perfil:**
  - Actualización de datos personales y cambio de contraseña.
- **Explorador de Servicios:**
  - Búsqueda, filtrado y suscripción a servicios.
- **Visualización de Gastos:**
  - Seguimiento financiero y análisis de patrones de gasto mediante gráficos.

### 5.3. Organización de Código
- Estructura modular: separación entre páginas, componentes y contexto.
- Cada página cuenta con su propio manejo de estado y validación de datos (por ejemplo, `Perfil.jsx`, `UserSubscriptionManager.jsx`, `UserServiceExplorer.jsx`).

---

## 6. Despliegue y Configuración

### 6.1. Docker y docker-compose
- **docker-compose.yml**: Orquesta la ejecución de la API y la base de datos.
- **Dockerfile (API)**: Usa una estrategia multietapa para instalar dependencias y copiar el código fuente.
- Estos archivos permiten replicar el entorno de producción de forma local y en servidores.

### 6.2. Variables de Entorno
- Se utiliza un archivo `.env` para configurar:
  - Conexión a la base de datos (DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME).
  - Otras variables sensibles y de configuración del entorno.

---

## 7. Pruebas, Calidad de Código y Seguridad

### 7.1. Pruebas
- Se recomienda implementar pruebas unitarias y de integración para rutas y componentes críticos.
- Herramientas sugeridas: Pytest para el backend y Jest/React Testing Library para el frontend.

### 7.2. Linter y Formateo
- **Backend**: PEP8 y otras reglas de estilo mediante flake8 o pylint.
- **Frontend**: ESLint configurado con plugins para React y TailwindCSS.
- Estos mecanismos garantizan calidad y legibilidad en el código.

### 7.3. Seguridad
- Medidas para sanear entradas y evitar inyección SQL mediante uso de consultas parametrizadas.
- Configuración de CORS estricta en producción.
- Implementación de autenticación y autorización en rutas protegidas.

---

## 8. Procesos y Flujo de Trabajo

### 8.1. Desarrollo
- El código se organiza en ramas (feature, develop, main) con integración continua.
- Git y GitLab se utilizan para la colaboración y control de versiones.
- Se recomienda seguir las guías de estilo y documentar cada cambio.

### 8.2. Despliegue
- La integración con Docker permite la construcción de imágenes reproducibles.
- Scripts en el Dockerfile y docker-compose.yml automatizan el setup del entorno.
- Se utilizan variables de entorno y volúmenes para persistencia de datos.

---

## 9. Herramientas y Tecnologías Utilizadas

- **Backend**: Python, FastAPI, aiomysql, bcrypt, Uvicorn.
- **Frontend**: React, Vite, TailwindCSS, Nivo, React-Router.
- **Deployment**: Docker, docker-compose.
- **Control de Versiones**: Git.
- **Monitoreo y Logs**: Configuración centralizada mediante el módulo logging en Python.

---

## 10. Base de Datos

El sistema utiliza MySQL como gestor de base de datos. El esquema se define en el script SQL ubicado en `/backend/DB/DBSubPlatm.sql` e incluye las siguientes tablas principales:

- **User**: Almacena información de los usuarios, incluyendo datos personales, credenciales y estado de la cuenta.
- **Service**: Registra los servicios disponibles en la plataforma, con su categoría y descripción.
- **Plan**: Define los planes asociados a cada servicio (por ejemplo, mensual o anual) y su precio.
- **Subscription**: Guarda la información de las suscripciones, relacionando usuarios y planes, con fechas de inicio, fin, monto pagado y método de pago.
- **PaymentMethod**: Registra los diferentes métodos de pago de los usuarios.
- **WalletTransaction**: Historial de transacciones en la cuenta de wallet del usuario.
- **Notification**: Notificaciones enviadas a los usuarios, con información sobre vencimientos, pagos y otros eventos.

### Modelo Conceptual y Físico

Dentro de la carpeta `/doc/imgs` se encuentran diagramas que representan:

- **Modelo Conceptual**: Define las entidades, sus atributos y relaciones sin decidir la implementación.  
  ![Modelo Conceptual](/doc/imgs/ModeloConptualDB.png)

- **Modelo Físico**: Representa la estructura concreta de la base de datos en MySQL, incluyendo claves primarias, foráneas, tipos de datos y restricciones.  
  ![Modelo Físico](/doc/imgs/ModeloFisicoDB.png)

