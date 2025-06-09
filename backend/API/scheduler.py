from apscheduler.schedulers.asyncio import AsyncIOScheduler
from datetime import datetime, timedelta
import aiomysql
from database import get_db_pool
from mailer import send_email
from apscheduler.triggers.cron import CronTrigger
import pytz
from fastapi import Request

"""
Scheduler para enviar correos de suscripciones que están por vencer
"""

async def job_notify_expiring(app):
    pool = await get_db_pool(app)
    async with pool.acquire() as conn:
        async with conn.cursor(aiomysql.DictCursor) as cursor:
            
            #Calcula la fecha en 3 días
            cursor_date = (datetime.utcnow() + timedelta(days=3)).strftime("%Y-%m-%d")

            #Busca suscripciones que venzan ese día y que aún estén 'active'
            await cursor.execute("""
                SELECT u.Email, u.Name, s.EndDate, p.Type, s.AmountPaid
                FROM Subscription AS s
                JOIN `User` AS u ON s.UserId = u.UserId
                JOIN Plan AS p ON s.PlanId = p.PlanId
                WHERE s.Status = 'active'
                AND DATE(s.EndDate) = %s;
            """, (cursor_date,))
            rows = await cursor.fetchall()

    #para cada fila, envía un correo
    for row in rows:

        #traducir el plan_type
        if row["Type"] == "monthly":
            row["Type"] = "Mensual"
        elif row["Type"] == "annual":
            row["Type"] = "Anual"
        else:
            row["Type"] = "Desconocido"
        
        #formatea el cuerpo 
        context = {
            "name": row["Name"],
            "end_date": row["EndDate"].strftime("%Y-%m-%d"),
            "plan_type": row["Type"],
            "amount": row["AmountPaid"],
        }
        # encola el envío (no bloquea)
        await send_email(
            subject="Tu suscripción vence pronto",
            to=row["Email"],
            template_name="expiring.html",
            context=context
        )

def start_scheduler(app):
    #define la zona horaria de Guatemala
    tz = pytz.timezone("America/Guatemala")

    scheduler = AsyncIOScheduler(timezone=tz)
    
    #crea un trigger cron a las 12:00pm en esa zona
    trigger = CronTrigger(hour=00, minute=46, timezone=tz)

    scheduler.add_job(job_notify_expiring, trigger, args=[app])
    scheduler.start()
