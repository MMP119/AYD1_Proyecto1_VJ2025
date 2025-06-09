from fastapi import APIRouter, HTTPException, Request, BackgroundTasks, Body
from database import get_db_pool
from datetime import datetime
import aiomysql
from pydantic import BaseModel
from decimal import Decimal
import random
from typing import Optional

router = APIRouter()

async def get_db_connection(request: Request):
    pool = await get_db_pool(request.app)
    conn = await pool.acquire()
    return pool, conn

class WalletTransactionRequest(BaseModel):
    tipo: str 
    monto: float 

class PaymentMethod(BaseModel):
    user_id: int
    tipo: str  # card, cash, wallet
    numero: Optional[str] = None  # Solo para tarjetas
    titular: Optional[str] = None  # Solo para tarjetas
    vencimiento: Optional[str] = None  # Solo para tarjetas
    balance: float = 0  # Solo para billetera

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
async def add_payment_method(request: Request, metodo: PaymentMethod = Body(...)):
    """
    Agrega un nuevo método de pago (tarjeta, efectivo, billetera).
    Solo se permite un método de efectivo por usuario.
    """
    try:
        user_id = metodo.user_id
        tipo = metodo.tipo
        numero = metodo.numero
        titular = metodo.titular
        vencimiento = metodo.vencimiento

        # Asignar saldo según el tipo de método
        if tipo == "card":
            balance = random.randint(250, 600)
        else:
            balance = metodo.balance if metodo.balance is not None else 0

        pool = await get_db_pool(request.app)
        async with pool.acquire() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cursor:
                if tipo == "cash":
                    # Verificar si ya existe un método efectivo para este usuario
                    await cursor.execute("""
                        SELECT PaymentMethodId FROM PaymentMethod
                        WHERE UserId = %s AND Type = 'cash'
                    """, (user_id,))
                    existe = await cursor.fetchone()
                    if existe:
                        raise HTTPException(status_code=400, detail="Solo puedes tener un método de efectivo. Usa la opción de editar para modificar el saldo.")

                await cursor.execute("""
                    INSERT INTO PaymentMethod (UserId, Type, CardNumber, CardHolder, ExpiryDate, WalletBalance)
                    VALUES (%s, %s, %s, %s, %s, %s)
                """, (user_id, tipo, numero, titular, vencimiento, balance))

                await conn.commit()

        return {
            "success": True,
            "message": "Método de pago agregado exitosamente"
        }

    except HTTPException as e:
        raise e
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


@router.put("/payment-methods/{user_id}/{payment_method_id}")
async def update_payment_method(user_id: int, payment_method_id: int, metodo: dict, request: Request):
    """
    Actualiza los datos de un método de pago específico del usuario.
    """
    try:
        # Permitir tanto camelCase como snake_case desde el frontend
        tipo = metodo.get("tipo") or metodo.get("type")
        numero = metodo.get("numero") or metodo.get("cardNumber")
        titular = metodo.get("titular") or metodo.get("cardHolder")
        vencimiento = metodo.get("vencimiento") or metodo.get("expiryDate")
        balance = metodo.get("balance") or metodo.get("walletBalance")

        pool = await get_db_pool(request.app)
        async with pool.acquire() as conn:
            async with conn.cursor() as cursor:
                await cursor.execute("""
                    UPDATE PaymentMethod
                    SET 
                        Type = %s,
                        CardNumber = %s,
                        CardHolder = %s,
                        ExpiryDate = %s,
                        WalletBalance = %s
                    WHERE UserId = %s AND PaymentMethodId = %s
                """, (
                    tipo,
                    numero,
                    titular,
                    vencimiento,
                    balance,
                    user_id,
                    payment_method_id
                ))
            await conn.commit()

        return {
            "success": True,
            "message": "Método de pago actualizado exitosamente"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al actualizar el método de pago: {str(e)}")


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

@router.post("/wallet/recharge-from-method/{user_id}")
async def recharge_wallet_from_method(user_id: int, data: dict, request: Request):
    """
    Recarga la wallet usando una tarjeta o efectivo como fuente.
    """
    payment_method_id = data.get("payment_method_id")
    monto = Decimal(data.get("monto", 0))
    tipo = data.get("tipo")  # "card" o "cash"

    if monto <= 0:
        raise HTTPException(status_code=400, detail="El monto debe ser mayor a cero.")

    pool = await get_db_pool(request.app)
    async with pool.acquire() as conn:
        async with conn.cursor(aiomysql.DictCursor) as cursor:
            # Verifica el saldo disponible en el método seleccionado
            await cursor.execute("""
                SELECT WalletBalance FROM PaymentMethod
                WHERE PaymentMethodId = %s AND UserId = %s AND Type = %s
            """, (payment_method_id, user_id, tipo))
            metodo = await cursor.fetchone()
            if not metodo:
                raise HTTPException(status_code=404, detail="Método de pago no encontrado.")
            saldo_actual = Decimal(metodo["WalletBalance"] or 0)
            if saldo_actual < monto:
                raise HTTPException(status_code=400, detail="Saldo insuficiente en el método seleccionado.")

            # Descuenta el saldo del método seleccionado
            await cursor.execute("""
                UPDATE PaymentMethod
                SET WalletBalance = WalletBalance - %s
                WHERE PaymentMethodId = %s
            """, (monto, payment_method_id))

            # Suma el saldo a la wallet (tipo 'wallet')
            await cursor.execute("""
                UPDATE PaymentMethod
                SET WalletBalance = WalletBalance + %s
                WHERE UserId = %s AND Type = 'wallet'
            """, (monto, user_id))

            # Registra la transacción en WalletTransaction
            await cursor.execute("""
                INSERT INTO WalletTransaction (UserId, Type, Amount)
                VALUES (%s, %s, %s)
            """, (user_id, "recharge", monto))

        await conn.commit()

    return {"success": True, "message": "Recarga exitosa"}
