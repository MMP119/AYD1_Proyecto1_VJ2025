from fastapi import APIRouter, HTTPException, Request, BackgroundTasks
from database import get_db_pool
from datetime import datetime
import aiomysql

router = APIRouter()

# Función para obtener la conexión a la base de datos
async def get_db_connection(request: Request):
    pool = await get_db_pool(request.app)
    conn = await pool.acquire()
    return pool, conn


@router.get("/subscription/{user_id}")
async def get_history_subscription(request: Request, user_id: int):
    """
    Obtiene el historial de suscripciones del usuario logueado por user_id
    """
    try:
        pool = await get_db_pool(request.app)

        async with pool.acquire() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cursor:
                query = """
                    SELECT
                        s.SubscriptionId as SubscriptionId, 
                        srv.Name as Servicio,
                        p.Type as TipoPlan,
                        s.StartDate as FechaInicio,
                        s.EndDate as FechaFin,
                        s.Status as Estado
                    FROM User u
                    JOIN Subscription s ON u.UserId = s.UserId
                    JOIN Plan p ON s.PlanId = p.PlanId
                    JOIN Service srv ON p.ServiceId = srv.ServiceId
                    WHERE u.UserId = %s
                    ORDER BY s.StartDate DESC;
                """

                await cursor.execute(query, (user_id,))
                suscripciones = await cursor.fetchall()

                return {
                    "success": True,
                    "message": "Historial de suscripciones obtenido exitosamente",
                    "data": suscripciones,
                    "total_registros": len(suscripciones)
                }

    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Error al obtener historial de suscripciones: {str(e)}"
        )


@router.put("/subscription/cancelled/{user_id}/{subscription_id}")
async def cancel_subscription(user_id: int, subscription_id: int, request: Request):
    """
    Cancela una suscripción activa específica de un usuario por su SubscriptionId
    """
    try:
        pool = await get_db_pool(request.app)

        async with pool.acquire() as conn:
            async with conn.cursor() as cursor:
                await cursor.execute("""
                    SELECT SubscriptionId, Status 
                    FROM Subscription 
                    WHERE UserId = %s AND SubscriptionId = %s AND Status = 'active'
                """, (user_id, subscription_id))
                subscription = await cursor.fetchone()

                if not subscription:
                    raise HTTPException(
                        status_code=400, 
                        detail="La suscripción no está activa o no existe."
                    )

                await cursor.execute("""
                    UPDATE Subscription
                    SET Status = 'cancelled', EndDate = %s
                    WHERE SubscriptionId = %s
                """, (datetime.now().strftime('%Y-%m-%d'), subscription_id))
                
                await conn.commit()

                return {
                    "success": True,
                    "message": "Suscripción cancelada exitosamente"
                }

    except Exception as e:
        print(f"Error: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"Error al cancelar suscripción: {str(e)}"
        )
