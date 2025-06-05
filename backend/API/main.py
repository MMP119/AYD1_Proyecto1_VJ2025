from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from routes.sistema import router as system_router
from database import get_db_pool
import logging
from routes.admin.gestionUsuarios import router as gestionUsuario_router

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
# app.include_router(admin_router)
app.include_router(gestionUsuario_router)


# Evento de inicio de la aplicación para establecer el pool de conexiones
@app.on_event("startup")
async def startup_event():
    try:
        await get_db_pool(app)
        logger.info("Conexión a la base de datos establecida")
    except Exception as e:
        logger.error(f"Error al conectar a la base de datos: {e}")

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
