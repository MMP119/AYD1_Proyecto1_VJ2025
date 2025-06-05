import aiomysql
from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel
from database import get_db_pool

"""
el administrador podrá ver todas las suscripciones activas, 
canceladas o vencidas de todos los usuarios, podrá filtrarlas 
por estado,tipo de servicio o fecha de vencimiento.
"""

router = APIRouter()

@router.get("/admin/suscripciones")  # Listar suscripciones, se deben filtar en el frontend
async def listar_suscripciones(request: Request):
    try:
        pool = await get_db_pool(request.app)

        async with pool.acquire() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cursor:
                await cursor.execute("SELECT * FROM Subscription")
                suscripciones = await cursor.fetchall()
                return {"suscripciones": suscripciones}
                
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al listar suscripciones: {str(e)}")
    

