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

@router.get("/admin/suscripciones")  # Listar suscripciones, se deben filtrar en el frontend
async def listar_suscripciones(request: Request):
    try:
        pool = await get_db_pool(request.app)
        async with pool.acquire() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cursor:
                await cursor.execute("""
                    SELECT 
                        s.SubscriptionId,
                        u.Name AS user,
                        u.Email AS email,
                        sv.Name AS service,
                        sv.Category AS category,
                        s.StartDate,
                        s.EndDate,
                        s.Status,
                        s.AmountPaid,
                        s.PaymentMethod
                    FROM Subscription s
                    JOIN User u ON s.UserId = u.UserId
                    JOIN Plan p ON s.PlanId = p.PlanId
                    JOIN Service sv ON p.ServiceId = sv.ServiceId
                """)
                suscripciones = await cursor.fetchall()
                return {"suscripciones": suscripciones}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al listar suscripciones: {str(e)}")


