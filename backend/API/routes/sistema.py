from fastapi import APIRouter, HTTPException, Request
from database import get_db_pool

router = APIRouter()

# Función para obtener la conexión a la base de datos
async def get_db_connection(request: Request):
    pool = await get_db_pool(request.app)
    return await pool.acquire()

