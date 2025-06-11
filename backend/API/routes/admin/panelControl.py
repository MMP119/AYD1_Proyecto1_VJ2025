import aiomysql
from fastapi import APIRouter, Request, HTTPException
from database import get_db_pool

"""
Devuelve:
- total_users: número total de usuarios en la tabla User.
- top_services: lista de servicios más suscritos (ServiceId, Name, count).
- ingresos_por_mes: lista de { mes: "YYYY-MM", ingresos: total }.
- suscripciones_status: conteo de { activas: X, inactivas: Y }.
"""


router = APIRouter()

@router.get("/admin/metricas")
async def obtener_metricas(request: Request):
    try:
        pool = await get_db_pool(request.app)
        async with pool.acquire() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cursor:
                
                # total de usuarios
                await cursor.execute("SELECT COUNT(*) AS total_users FROM `User`;")
                row = await cursor.fetchone()
                total_users = row["total_users"]

                # servicios más suscritos (tomamos top 5; se ajusta LIMIT según convenga)
                #  hacemos JOIN: Subscription -> Plan -> Service
                top_services_sql = """
                    SELECT
                        s.ServiceId,
                        s.Name,
                        COUNT(sub.SubscriptionId) AS suscripciones
                    FROM Subscription AS sub
                    JOIN Plan AS p ON sub.PlanId = p.PlanId
                    JOIN Service AS s ON p.ServiceId = s.ServiceId
                    GROUP BY s.ServiceId, s.Name
                    ORDER BY suscripciones DESC
                    LIMIT 5;
                """
                await cursor.execute(top_services_sql)
                top_services = await cursor.fetchall()
                # top_services será lista de dicts: [{"ServiceId": ..., "Name": "...", "suscripciones": ...}, ...]

                # ingresos por mes
                #  tomamos StartDate como fecha de cobro; agrupamos por año-mes usando DATE_FORMAT
                ingresos_sql = """
                    SELECT
                        DATE_FORMAT(StartDate, '%Y-%m') AS mes,
                        SUM(AmountPaid) AS ingresos
                    FROM Subscription
                    GROUP BY mes
                    ORDER BY mes;
                """
                await cursor.execute(ingresos_sql)
                ingresos_por_mes = await cursor.fetchall()
                # ejemplo de filas: [{"mes": "2025-01", "ingresos": Decimal('49.99')}, ...]

                # suscripciones activas vs. inactivas
                # definimos 'activas' como Status='active', 'inactivas' como Status<>'active'
                status_sql = """
                    SELECT
                        SUM(CASE WHEN Status = 'active' THEN 1 ELSE 0 END)                AS activas,
                        SUM(CASE WHEN Status <> 'active' THEN 1 ELSE 0 END)               AS inactivas
                    FROM Subscription;
                """
                await cursor.execute(status_sql)
                status_row = await cursor.fetchone()
                suscripciones_status = {
                    "activas": status_row["activas"],
                    "inactivas": status_row["inactivas"]
                }

        # armamos el JSON final
        return {
            "total_users": total_users,
            "top_services": top_services,
            "ingresos_por_mes": ingresos_por_mes,
            "suscripciones_status": suscripciones_status
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener métricas: {str(e)}")
