from fastapi import APIRouter, HTTPException, Request, BackgroundTasks
from database import get_db_pool
from pydantic import BaseModel, EmailStr
import bcrypt
from typing import Optional
from mailer import send_email
import secrets
from datetime import datetime, timedelta
import aiomysql

router = APIRouter()

# Función para obtener la conexión a la base de datos
async def get_db_connection(request: Request):
    pool = await get_db_pool(request.app)
    conn = await pool.acquire()
    return pool, conn


class UserData(BaseModel):
    username: str
    name: str
    email: str
    rol : str = "user"
    password: str

class LoginUser(BaseModel):
    email: str
    password: str

class UpdateUserData(BaseModel):
    username: Optional[str] = None
    name: Optional[str] = None
    email: Optional[str] = None
    rol : str = "user"
    password: Optional[str] = None


class ConfirmData(BaseModel):
    email: EmailStr
    code: str


@router.post("/register")
async def register_user(request: Request, user_data: UserData, background_tasks: BackgroundTasks):
    pool, conn = await get_db_connection(request)
    try:
        async with conn.cursor() as cursor:
            # Verificar email y username
            await cursor.execute("SELECT 1 FROM `User` WHERE Email = %s", (user_data.email,))
            if await cursor.fetchone():
                raise HTTPException(status_code=400, detail="El usuario ya existe")

            await cursor.execute("SELECT 1 FROM `User` WHERE Username = %s", (user_data.username,))
            if await cursor.fetchone():
                raise HTTPException(status_code=400, detail="El nombre de usuario ya está en uso")

            # Hashear la contraseña
            hashed_password = bcrypt.hashpw(
                user_data.password.encode('utf-8'),
                bcrypt.gensalt()
            )

            # Insertar el usuario
            await cursor.execute("""
                INSERT INTO `User` (Username, Name, Email, Rol, Password)
                VALUES (%s, %s, %s, %s, %s)
            """, (
                user_data.username,
                user_data.name,
                user_data.email,
                user_data.rol,
                hashed_password
            ))
            await conn.commit()

            # Obtener el UserId recién creado
            await cursor.execute("SELECT UserId FROM User WHERE Email = %s", (user_data.email,))
            user_row = await cursor.fetchone()
            user_id = user_row[0] if user_row else None

            # Crear wallet con saldo 0
            if user_id:
                await cursor.execute("""
                    INSERT INTO PaymentMethod (UserId, Type, WalletBalance)
                    VALUES (%s, 'wallet', 0)
                """, (user_id,))
                await conn.commit()

            # Generar y guardar el código
            codigo = secrets.token_hex(4).upper()

            await cursor.execute("""
                UPDATE User
                SET ConfirmationCode = %s
                WHERE Email = %s
            """, (codigo, user_data.email))
            await conn.commit()

            # Enviar email
            background_tasks.add_task(
                send_email,
                "Confirma tu cuenta",
                user_data.email,
                "confirm.html",
                {"name": user_data.name, "code": codigo}
            )

        return {"status": "success", "message": "Usuario registrado. Revisa tu correo."}
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error al registrar usuario: {e}")
        raise HTTPException(status_code=500, detail="Error interno al registrar usuario")
    finally:
        pool.release(conn)



@router.post("/confirmEmail")#para confirmar el email al registrarse
async def confirm_email(request: Request, data: ConfirmData):

    pool, conn = await get_db_connection(request)
    try:
        async with conn.cursor(aiomysql.DictCursor) as cursor:
            await cursor.execute("""
                SELECT ConfirmationCode
                FROM User
                WHERE Email = %s
            """, (data.email,))

            row = await cursor.fetchone()

            if not row or row["ConfirmationCode"] != data.code:
                raise HTTPException(400, "Código inválido")

            # Marcar usuario como confirmado 
            await cursor.execute("""
                UPDATE User
                SET ConfirmationCode = NULL, ConfirmedEmail = 'yes'
                WHERE Email = %s
            """, (data.email,))
            await conn.commit()

        return {"status": "success", "message": "Correo confirmado"}
    finally:
        pool.release(conn)



@router.post("/login")
async def login_user(request: Request, login_data: LoginUser):
    pool, conn = await get_db_connection(request)
    try:
        async with conn.cursor() as cursor:
            await cursor.execute(
                "SELECT * FROM User WHERE Email = %s OR Username = %s",
                (login_data.email, login_data.email)
            )
            user = await cursor.fetchone()
            if not user:
                raise HTTPException(status_code=400, detail="Credenciales incorrectas")
            
            hashed_password = user[6]  # Ajusta el índice si la contraseña está en otra columna
            if not bcrypt.checkpw(login_data.password.encode('utf-8'), hashed_password.encode('utf-8')):
                raise HTTPException(status_code=400, detail="Credenciales incorrectas")
            
            activo = False if user[4] or user[5] == 'inactive' else True
            rol = 'admin' if user[3] == 'administrator' else 'user'

            return {
                "status": "success",
                "message": "Login exitoso",
                "user_id": user[0], 
                "user_name": user[1],
                "user_email": user[2],
                "user_rol": rol,
                "user_username": user[8],
                "activo": activo     
            }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error al iniciar sesión: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        pool.release(conn)


@router.put("/update_user/{user_id}")
async def update_user(request: Request, user_id: int, update_data: UpdateUserData):
    pool, conn = await get_db_connection(request)
    try:
        async with conn.cursor() as cursor:
            # Verificar si el usuario existe
            await cursor.execute("SELECT * FROM User WHERE UserId = %s", (user_id,))
            user = await cursor.fetchone()
            if not user:
                raise HTTPException(status_code=404, detail="Usuario no encontrado")
            
            # Verificar si el nuevo email ya está en uso por otro usuario
            if update_data.email:
                await cursor.execute(
                    "SELECT * FROM User WHERE Email = %s AND UserId != %s",
                    (update_data.email, user_id)
                )
                existing_email = await cursor.fetchone()
                if existing_email:
                    raise HTTPException(status_code=400, detail="El correo electrónico ya está en uso por otro usuario")
            
            # Verificar si el nuevo username ya está en uso por otro usuario
            if update_data.username:
                await cursor.execute(
                    "SELECT * FROM User WHERE Username = %s AND UserId != %s",
                    (update_data.username, user_id)
                )
                existing_username = await cursor.fetchone()
                if existing_username:
                    raise HTTPException(status_code=400, detail="El nombre de usuario ya está en uso por otro usuario")

            # Actualizar los campos proporcionados
            if update_data.username:
                await cursor.execute("UPDATE User SET Username = %s WHERE UserId = %s", (update_data.username, user_id))
            if update_data.name:
                await cursor.execute("UPDATE User SET Name = %s WHERE UserId = %s", (update_data.name, user_id))
            if update_data.email:
                await cursor.execute("UPDATE User SET Email = %s WHERE UserId = %s", (update_data.email, user_id))
            if update_data.password:
                hashed_password = bcrypt.hashpw(update_data.password.encode('utf-8'), bcrypt.gensalt())
                await cursor.execute("UPDATE User SET Password = %s WHERE UserId = %s", (hashed_password.decode('utf-8'), user_id))

            await conn.commit()

        return {"status": "success", "message": "Usuario actualizado exitosamente"}
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error al actualizar usuario: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        pool.release(conn)
