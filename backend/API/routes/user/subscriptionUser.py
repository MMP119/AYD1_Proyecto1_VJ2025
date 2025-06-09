from fastapi import APIRouter, HTTPException, Request, BackgroundTasks
from database import get_db_pool
from datetime import datetime
import aiomysql
from pydantic import BaseModel
from mailer import send_email

router = APIRouter()

async def get_db_connection(request: Request):
    pool = await get_db_pool(request.app)
    conn = await pool.acquire()
    return pool, conn


class PlanSubscription(BaseModel):
    service_id: int
    plant_type: str  # Tipo de plan (mounthly, annual)
    start_date: str  # Formato 'YYYY-MM-DD'
    end_date: str    # Formato 'YYYY-MM-DD'
    AmountPaid: float # Monto pagado
    PaymentMethod: str # Método de pago



@router.post("/pay/plan/{user_id}")
async def pay_plan_subscription(request: Request, user_id: int, plan_subscription: PlanSubscription, background_tasks: BackgroundTasks):
    """
    Permite a un usuario suscribirse a un plan específico
    """
    pool, conn = await get_db_connection(request)
    try:
        async with conn.cursor(aiomysql.DictCursor) as cursor:

            #plan_subscription es el id del ServiceId, entonces debemos obtener el PlanId a partir de ese ServiceId
            await cursor.execute(
                """
                SELECT PlanId FROM Plan WHERE ServiceId = %s AND Type = %s
                """, (plan_subscription.service_id, plan_subscription.plant_type)
            )
            plan_row = await cursor.fetchone()
            if not plan_row:
                raise HTTPException(404, "Plan no encontrado")
            plan_id = plan_row["PlanId"]

            await cursor.execute(
                """
                INSERT INTO Subscription 
                (UserId, PlanId, StartDate, EndDate, AmountPaid, PaymentMethod)
                VALUES (%s, %s, %s, %s, %s, %s)
                """,
                (
                user_id,
                int(plan_id),
                plan_subscription.start_date,
                plan_subscription.end_date,
                plan_subscription.AmountPaid,
                plan_subscription.PaymentMethod
                )
            )
            await conn.commit()

            #obtener el nombre del cliente, así como su email
            await cursor.execute(
                """
                SELECT Name, Email FROM User WHERE UserId = %s
                """, (user_id,)
            )
            user_info = await cursor.fetchone()
            if not user_info:
                raise HTTPException(status_code=404, detail="Usuario no encontrado")
            user_name = user_info["Name"]
            user_email = user_info["Email"]

            #Enviar confirmación de pago
            background_tasks.add_task(
                send_email,
                "Pago realizado con éxito",
                user_email,
                "confirm_payment.html",
                {
                    "name": user_name, 
                    "amount": plan_subscription.AmountPaid,
                }
            )

        return {"success": True, "message": "Suscripción exitosa"}

    except Exception as e:
        raise HTTPException(500, f"Error al procesar la suscripción: {e}")
    finally:
        pool.release(conn)




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
