from fastapi import APIRouter, HTTPException, Request, BackgroundTasks
from database import get_db_pool
from datetime import datetime
import aiomysql
from pydantic import BaseModel
from decimal import Decimal

router = APIRouter()

async def get_db_connection(request: Request):
    pool = await get_db_pool(request.app)
    conn = await pool.acquire()
    return pool, conn

class WalletTransactionRequest(BaseModel):
    tipo: str 
    monto: float 

@router.get("/payment-methods/{user_id}")
async def get_payment_method(user_id: int, request: Request):
    """
    Obtiene los métodos de pago registrados para un usuario específico.
    """
    try:
        pool = await get_db_pool(request.app)

        async with pool.acquire() as conn:
            async with conn.cursor() as cursor:
        
                await cursor.execute("""
                    SELECT 
                        pm.PaymentMethodId, 
                        pm.Type, 
                        pm.CardNumber, 
                        pm.CardHolder, 
                        pm.ExpiryDate, 
                        pm.WalletBalance
                    FROM PaymentMethod pm
                    WHERE pm.UserId = %s
                """, (user_id,))

                metodos = await cursor.fetchall()

                if not metodos:
                    return {
                        "success": False,
                        "message": "No se encontraron métodos de pago registrados"
                    }

                return {
                    "success": True,
                    "data": metodos
                }

    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Error al obtener los métodos de pago: {str(e)}"
        )

@router.post("/payment-methods")
async def add_payment_method(request: Request, metodo: dict):
    """
    Agrega un nuevo método de pago (tarjeta, efectivo, billetera)
    """
    try:
        user_id = metodo.get("user_id")
        tipo = metodo.get("tipo")
        numero = metodo.get("numero")
        titular = metodo.get("titular")
        vencimiento = metodo.get("vencimiento")
        balance = metodo.get("balance", 0)

        if tipo == "card":
            pass

        pool = await get_db_pool(request.app)
        async with pool.acquire() as conn:
            async with conn.cursor() as cursor:
                await cursor.execute("""
                    INSERT INTO PaymentMethod (UserId, Type, CardNumber, CardHolder, ExpiryDate, WalletBalance)
                    VALUES (%s, %s, %s, %s, %s, %s)
                """, (user_id, tipo, numero, titular, vencimiento, balance))

                await conn.commit()

        return {
            "success": True,
            "message": "Método de pago agregado exitosamente"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al agregar el método de pago: {str(e)}")

@router.delete("/payment-methods/{user_id}/{payment_method_id}")
async def delete_payment_method(user_id: int, payment_method_id: int, request: Request):
    """
    Elimina un método de pago específico del usuario
    """
    try:
        pool = await get_db_pool(request.app)

        async with pool.acquire() as conn:
            async with conn.cursor() as cursor:
                await cursor.execute("""
                    DELETE FROM PaymentMethod
                    WHERE UserId = %s AND PaymentMethodId = %s
                """, (user_id, payment_method_id))

            await conn.commit()

        return {
            "success": True,
            "message": "Método de pago eliminado exitosamente"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al eliminar el método de pago: {str(e)}")


@router.post("/wallet/update/{user_id}")
async def wallet_update(user_id: int, transaction_data: WalletTransactionRequest, request: Request):
    """
    Recarga o deduce el saldo de la billetera digital de un usuario usando el campo Amount en WalletTransaction.
    """
    try:
        tipo = transaction_data.tipo  
        monto = Decimal(transaction_data.monto)  

        
        if monto <= 0:
            raise HTTPException(status_code=400, detail="El monto debe ser mayor a cero.")

       
        if tipo not in ['recharge', 'deduction']:
            raise HTTPException(status_code=400, detail="Tipo de transacción inválido.")

        pool = await get_db_pool(request.app)

        async with pool.acquire() as conn:
            async with conn.cursor() as cursor:
                
                await cursor.execute("""
                    SELECT SUM(Amount) as total_balance
                    FROM WalletTransaction
                    WHERE UserId = %s AND Type = 'recharge'
                """, (user_id,))
                result = await cursor.fetchone()

                
                total_balance = Decimal(result[0]) if result[0] is not None else Decimal(0)

                
                if tipo == 'recharge':
                    new_balance = total_balance + monto  
                elif tipo == 'deduction':
                    
                    if total_balance < monto:
                        raise HTTPException(status_code=400, detail="Saldo insuficiente para la deducción.")
                    new_balance = total_balance - monto 

                await cursor.execute("""
                    INSERT INTO WalletTransaction (UserId, Type, Amount)
                    VALUES (%s, %s, %s)
                """, (user_id, tipo, monto))

            await conn.commit()

        return {
            "success": True,
            "message": f"Billetera {tipo} exitosa",
            "new_balance": str(new_balance) 
        }

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al actualizar la billetera: {str(e)}")


@router.get("/wallet/transactions/{user_id}")
async def get_transaction(user_id: int, request: Request):
    """
    Obtiene el historial de transacciones de la billetera de un usuario.
    """
    try:
        pool = await get_db_pool(request.app)

        async with pool.acquire() as conn:
            async with conn.cursor() as cursor:
                await cursor.execute("""
                    SELECT TransactionId, Type, Amount, TransactionDate
                    FROM WalletTransaction
                    WHERE UserId = %s
                    ORDER BY TransactionDate DESC
                """, (user_id,))
                transacciones = await cursor.fetchall()

                if not transacciones:
                    return {
                        "success": False,
                        "message": "No se encontraron transacciones para este usuario."
                    }

                return {
                    "success": True,
                    "data": transacciones
                }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener las transacciones: {str(e)}")
