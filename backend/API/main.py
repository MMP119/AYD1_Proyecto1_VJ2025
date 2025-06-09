from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from routes.sistema import router as system_router
from database import get_db_pool
import logging
from routes.admin.gestionUsuarios import router as gestionUsuario_router
from routes.admin.gestionSuscripciones import router as gestionSuscripciones_router
from routes.admin.gestionSerivicios import router as gestionServicios_router
from routes.admin.reportes import router as reporter_router
from routes.admin.panelControl import router as panelControl_router
from routes.user.subscriptionUser import router as subscriptionUser_router
from routes.user.paymentMethodUser import router as paymentMethodUser_router
from routes.user.billsUser import router as billsUser_router
from scheduler import start_scheduler



# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Configuración de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Reemplazar por dominios específicos en producción
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir los routers
app.include_router(system_router)
# app.include_router(user_router)
app.include_router(gestionUsuario_router)
app.include_router(gestionSuscripciones_router)
app.include_router(gestionServicios_router)
app.include_router(reporter_router)
app.include_router(panelControl_router)
app.include_router(subscriptionUser_router)

# Incluir los routers de usuario
app.include_router(paymentMethodUser_router)
app.include_router(billsUser_router)

# Evento de inicio de la aplicación para establecer el pool de conexiones
@app.on_event("startup")
async def startup_event():
    try:
        await get_db_pool(app)
        logger.info("Conexión a la base de datos establecida")
        start_scheduler(app)  # Iniciar el scheduler
        logger.info("Scheduler iniciado")
    except Exception as e:
        logger.error(f"Error al: {e}")

# Evento de cierre de la aplicación para cerrar el pool de conexiones
@app.on_event("shutdown")
async def shutdown_event():
    if hasattr(app.state, "db_pool"):
        app.state.db_pool.close()
        await app.state.db_pool.wait_closed()
        logger.info("Conexión a la base de datos cerrada")

# Ruta de ejemplo
@app.get("/")
async def root():
    return {"message": "Hola mundo desde la API"}
