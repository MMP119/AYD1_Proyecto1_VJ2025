import aiomysql
from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel
from database import get_db_pool

"""
el administrador podrá registrar, editar o eliminar servicios 
con nombre, categoría, descripción, precio y tipo de plan
(mensual, anual, etc.).
"""

class Service(BaseModel):
    name: str
    category: str
    description: str
    price: float
    plan_type: str  #mensual, anual

router = APIRouter()

@router.get("/admin/servicios")  # Listar servicios
async def listar_servicios(request: Request):
    try:
        pool = await get_db_pool(request.app)

        async with pool.acquire() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cursor:
                get_services_sql = """
                    SELECT s.ServiceId, s.Name, s.Category, s.Description, 
                            p.Type AS PlanType, p.Price
                    FROM Service s
                    JOIN Plan p ON s.ServiceId = p.ServiceId
                """
                await cursor.execute(get_services_sql)
                servicios = await cursor.fetchall()

                return {"servicios": servicios}
                
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al listar servicios: {str(e)}")


@router.post("/admin/servicios")  # Registrar un nuevo servicio
async def registrar_servicio(request: Request, servicio: Service):
    try:
        pool = await get_db_pool(request.app)
        async with pool.acquire() as conn:
            async with conn.cursor() as cursor:

                insert_service_sql = """
                    INSERT INTO Service (Name, Category, Description)
                    VALUES (%s, %s, %s)
                """
                await cursor.execute(
                    insert_service_sql,
                    (servicio.name, servicio.category, servicio.description)
                )
                # obtengo el id generado
                service_id = cursor.lastrowid

                # insertar en Plan, vinculando al Service recién creado
                insert_plan_sql = """
                    INSERT INTO Plan (ServiceId, Type, Price)
                    VALUES (%s, %s, %s)
                """
                await cursor.execute(
                    insert_plan_sql,
                    (service_id, servicio.plan_type, servicio.price)
                )

                await conn.commit()

                return {
                    "message": "Servicio registrado exitosamente",
                    "service_id": service_id,
                    "plan_id": cursor.lastrowid
                }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al registrar servicio: {str(e)}")



@router.put("/admin/servicios/{service_id}")  # Editar un servicio existente
async def editar_servicio(request: Request, service_id: int, servicio: Service):
    try:
        pool = await get_db_pool(request.app)

        async with pool.acquire() as conn:
            async with conn.cursor() as cursor:

                update_service_sql = """
                    UPDATE Service
                    SET Name=%s, Category=%s, Description=%s
                    WHERE ServiceId=%s
                """
                await cursor.execute(
                    update_service_sql,
                    (servicio.name, servicio.category, servicio.description, service_id)
                )

                # actualizar el plan asociado
                update_plan_sql = """
                    UPDATE Plan
                    SET Type=%s, Price=%s
                    WHERE ServiceId=%s
                """
                await cursor.execute(
                    update_plan_sql,
                    (servicio.plan_type, servicio.price, service_id)
                )

                await conn.commit()

                return {"message": "Servicio actualizado exitosamente"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al editar servicio: {str(e)}")
    


@router.delete("/admin/servicios/{service_id}")  # Eliminar un servicio
async def eliminar_servicio(request: Request, service_id: int):
    try:
        pool = await get_db_pool(request.app)

        async with pool.acquire() as conn:
            async with conn.cursor() as cursor:

                # eliminar el servicio y su plan asociado
                delete_service_sql = """
                    DELETE FROM Service WHERE ServiceId=%s
                """
                await cursor.execute(delete_service_sql, (service_id,))

                delete_plan_sql = """
                    DELETE FROM Plan WHERE ServiceId=%s
                """
                await cursor.execute(delete_plan_sql, (service_id,))

                await conn.commit()

                return {"message": "Servicio eliminado exitosamente"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al eliminar servicio: {str(e)}")