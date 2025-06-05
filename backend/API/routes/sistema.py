from fastapi import APIRouter, HTTPException, Request
from database import get_db_pool
from pydantic import BaseModel
import bcrypt

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


@router.post("/register")
async def register_user(request: Request, user_data: UserData):
    pool, conn = await get_db_connection(request)
    try:
        async with conn.cursor() as cursor:
            await cursor.execute("SELECT * FROM User WHERE Email = %s", (user_data.email,))
            existing_user = await cursor.fetchone()
            if existing_user:
                raise HTTPException(status_code=400, detail="El usuario ya existe")

            # Hahsear la contraseña con bcrypt
            hashed_password = bcrypt.hashpw(user_data.password.encode('utf-8'), bcrypt.gensalt())

            await cursor.execute("""
                INSERT INTO User (Username, Name, Email, Rol, Password)
                VALUES (%s, %s, %s, %s, %s)
            """, (user_data.username, user_data.name, user_data.email, user_data.rol, hashed_password))
            await conn.commit()

        return {"status": "success", "message": "Usuario registrado exitosamente"}
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
            await cursor.execute("SELECT * FROM User WHERE Email = %s AND Password = %s", (login_data.email, login_data.password))
            user = await cursor.fetchone()
            if not user:
                raise HTTPException(status_code=400, detail="Credenciales incorrectas")

            return {
                "status": "success",
                "message": "Login exitoso",
                "user_id": user[0],  # Asumiendo que el ID del usuario es el primer campo
                "rol": user[4]  # Asumiendo que el rol es el quinto campo
            }
    except Exception as e:
        print(f"Error al iniciar sesión: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        pool.release(conn)
