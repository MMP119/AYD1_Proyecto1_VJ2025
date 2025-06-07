from fastapi import APIRouter, HTTPException, Request
from database import get_db_pool
from pydantic import BaseModel
import bcrypt
from typing import Optional

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


@router.post("/register")
async def register_user(request: Request, user_data: UserData):
    pool, conn = await get_db_connection(request)
    try:
        async with conn.cursor() as cursor:
            await cursor.execute("SELECT * FROM User WHERE Email = %s", (user_data.email,))
            existing_user = await cursor.fetchone()
            if existing_user:
                raise HTTPException(status_code=400, detail="El usuario ya existe")
            
            await cursor.execute("SELECT * FROM User WHERE Username = %s", (user_data.username,))
            existing_username = await cursor.fetchone()
            if existing_username:
                raise HTTPException(status_code=400, detail="El nombre de usuario ya está en uso")

            # Hahsear la contraseña con bcrypt
            hashed_password = bcrypt.hashpw(user_data.password.encode('utf-8'), bcrypt.gensalt())

            await cursor.execute("""
                INSERT INTO User (Username, Name, Email, Rol, Password)
                VALUES (%s, %s, %s, %s, %s)
            """, (user_data.username, user_data.name, user_data.email, user_data.rol, hashed_password))
            await conn.commit()

        return {"status": "success", "message": "Usuario registrado exitosamente"}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error al registrar usuario: {e}")
        raise HTTPException(status_code=500, detail=str(e))
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

            return {
                "status": "success",
                "message": "Login exitoso",
                "user_id": user[0], 
                "user_name": user[1],
                "user_email": user[2],
                "user_rol": user[3],
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