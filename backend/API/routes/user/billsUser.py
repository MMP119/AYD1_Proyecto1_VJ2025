from fastapi import APIRouter, HTTPException, Request, Query
from database import get_db_pool
from typing import List
from datetime import date, datetime
import aiomysql
from pydantic import BaseModel

router = APIRouter()

async def get_db_connection(request: Request):
    pool = await get_db_pool(request.app)
    conn = await pool.acquire()
    return pool, conn

class ExpenseOut(BaseModel):
    id: int
    categoria: str
    monto: float
    fecha: date

@router.get("/expenses/{user_id}", response_model=List[ExpenseOut])
async def get_expenses(user_id: int, request: Request):
    """
    Devuelve la lista de gastos del usuario, incluyendo deducciones y suscripciones (todos los años y meses).
    """
    try:
        pool = await get_db_pool(request.app)
        async with pool.acquire() as conn:
            async with conn.cursor() as cursor:
                await cursor.execute("""
                    (
                        SELECT 
                            TransactionId AS Id,
                            'Gasto general' AS Categoria,
                            Amount AS Monto,
                            TransactionDate AS Fecha
                        FROM WalletTransaction
                        WHERE UserId = %s AND Type = 'deduction'
                    )
                    UNION ALL
                    (
                        SELECT 
                            s.SubscriptionId AS Id,
                            sv.Category AS Categoria,
                            s.AmountPaid AS Monto,
                            s.StartDate AS Fecha
                        FROM Subscription s
                        JOIN Plan p ON s.PlanId = p.PlanId
                        JOIN Service sv ON p.ServiceId = sv.ServiceId
                        WHERE s.UserId = %s
                    )
                    ORDER BY Fecha DESC
                """, (user_id, user_id))
                gastos = await cursor.fetchall()
        return [
            {
                "id": g[0],
                "categoria": g[1],
                "monto": float(g[2]),
                "fecha": g[3].strftime('%Y-%m-%d') if hasattr(g[3], 'strftime') else str(g[3]),
            }
            for g in gastos
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

