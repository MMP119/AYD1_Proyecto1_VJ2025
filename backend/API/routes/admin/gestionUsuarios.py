import aiomysql
from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel
from database import get_db_pool

"""
el administrador podrá visualizar un listado de los usuarios registrados, 
podrá editar la información de los usuarios y también podrá activar, 
desactivar o eliminar cuentas de usuario.
"""


class userData(BaseModel):
    name: str
    email: str
    rol: str  
    accountStatus: str  # active, deactivated, deleted
    user: str  # username



router = APIRouter()
@router.get("/admin/usuarios") # Listar usuarios
async def listar_usuarios(request: Request):
    try:
        pool = await get_db_pool(request.app)

        async with pool.acquire() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cursor:
                await cursor.execute("SELECT * FROM User")
                usuarios = await cursor.fetchall()
                return {"usuarios": usuarios}
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al listar usuarios: {str(e)}")



@router.get("/admin/usuarios/{usuario_id}") # Obtener usuario específico
async def obtener_usuario(request: Request, usuario_id: int):
    try:
        pool = await get_db_pool(request.app)

        async with pool.acquire() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cursor:
                await cursor.execute("SELECT * FROM User WHERE UserId=%s", (usuario_id,))
                usuario = await cursor.fetchone()
                if not usuario:
                    raise HTTPException(status_code=404, detail="Usuario no encontrado")
                return {"usuario": usuario}
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener usuario: {str(e)}")
    

        
@router.put("/admin/usuarios/{usuario_id}") # Editar usuario específico
async def editar_usuario(request: Request, usuario_id: int, user_data: userData):
    try:
        pool = await get_db_pool(request.app)

        async with pool.acquire() as conn:
            async with conn.cursor() as cursor:
                await cursor.execute(
                    "UPDATE User SET Name=%s, Email=%s, Rol=%s, AccountStatus=%s User=%s WHERE UserId=%s",
                    (user_data.name, user_data.email, user_data.rol, user_data.accountStatus, user_data.user, usuario_id)
                )
                await conn.commit()
                return {"message": "Usuario actualizado correctamente"}
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al editar usuario: {str(e)}")
    


@router.delete("/admin/usuarios/{usuario_id}") # Eliminar usuario específico, marcando su AccountStatus como "deleted"
async def eliminar_usuario(request: Request, usuario_id: int):
    try:
        pool = await get_db_pool(request.app)

        async with pool.acquire() as conn:
            async with conn.cursor() as cursor:
                await cursor.execute(
                    "UPDATE User SET AccountStatus='deleted' WHERE UserId=%s",
                    (usuario_id,)
                )
                await conn.commit()
                return {"message": "Usuario eliminado correctamente"}
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al eliminar usuario: {str(e)}")
    
