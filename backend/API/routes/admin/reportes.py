import aiomysql
from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel
from database import get_db_pool

"""
Endpoints para generar reportes de suscripciones:
- Suscripciones por usuario
- Suscripciones por categoría
- Total de ingresos por suscripciones
"""

# Modelos de respuesta (opcional, para documentación)
class SuscripcionUsuario(BaseModel):
    Usuario: str
    Servicio: str
    Categoria: str
    TipoPlan: str
    Estado: str

class SuscripcionCategoria(BaseModel):
    Categoria: str
    Servicio: str
    TotalSuscripciones: int
    Activas: int
    Canceladas: int
    Expiradas: int
    IngresosPorServicio: float

class IngresoServicio(BaseModel):
    Servicio: str
    Categoria: str
    TotalSuscripciones: int
    IngresosTotales: float
    PromedioIngreso: float

router = APIRouter()

@router.get("/admin/reportes/suscripciones-por-usuario")
async def suscripciones_por_usuario(request: Request):
    """
    Obtiene un reporte de todas las suscripciones organizadas por usuario
    """
    try:
        pool = await get_db_pool(request.app)

        async with pool.acquire() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cursor:
                query = """
                    SELECT 
                        u.Name as Usuario,
                        srv.Name as Servicio,
                        srv.Category as Categoria,
                        p.Type as TipoPlan,
                        s.Status as Estado
                    FROM User u
                    JOIN Subscription s ON u.UserId = s.UserId
                    JOIN Plan p ON s.PlanId = p.PlanId
                    JOIN Service srv ON p.ServiceId = srv.ServiceId
                    ORDER BY u.Name DESC;
                """
                
                await cursor.execute(query)
                suscripciones = await cursor.fetchall()
                
                return {
                    "success": True,
                    "message": "Reporte de suscripciones por usuario obtenido exitosamente",
                    "data": suscripciones,
                    "total_registros": len(suscripciones)
                }
            
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Error al obtener reporte de suscripciones por usuario: {str(e)}"
        )

@router.get("/admin/reportes/suscripciones-por-categoria")
async def suscripciones_por_categoria(request: Request):
    """
    Obtiene un reporte de suscripciones agrupadas por categoría de servicio
    """
    try:
        pool = await get_db_pool(request.app)

        async with pool.acquire() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cursor:
                query = """
                SELECT 
                    srv.Category as Categoria,
                    srv.Name as Servicio,
                    COUNT(s.SubscriptionId) as TotalSuscripciones,
                    COUNT(CASE WHEN s.Status = 'active' THEN 1 END) as Activas,
                    COUNT(CASE WHEN s.Status = 'cancelled' THEN 1 END) as Canceladas,
                    COUNT(CASE WHEN s.Status = 'expired' THEN 1 END) as Expiradas,
                    COALESCE(SUM(s.AmountPaid), 0) as IngresosPorServicio
                FROM Service srv
                LEFT JOIN Plan p ON srv.ServiceId = p.ServiceId
                LEFT JOIN Subscription s ON p.PlanId = s.PlanId
                GROUP BY srv.Category, srv.ServiceId, srv.Name
                ORDER BY srv.Category, IngresosPorServicio DESC
                """
                
                await cursor.execute(query)
                suscripciones = await cursor.fetchall()
                
                # Agrupar por categoría para mejor organización
                categorias = {}
                for row in suscripciones:
                    categoria = row['Categoria']
                    if categoria not in categorias:
                        categorias[categoria] = []
                    categorias[categoria].append(row)
                
                return {
                    "success": True,
                    "message": "Reporte de suscripciones por categoría obtenido exitosamente",
                    "data": suscripciones,
                    "data_agrupada": categorias,
                    "total_registros": len(suscripciones)
                }
            
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Error al obtener reporte de suscripciones por categoría: {str(e)}"
        )

@router.get("/admin/reportes/total-ingresos")
async def total_ingresos_suscripciones(request: Request):
    """
    Obtiene un reporte de ingresos totales por servicio (top 10)
    """
    try:
        pool = await get_db_pool(request.app)

        async with pool.acquire() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cursor:
                query = """
                SELECT 
                    srv.Name as Servicio,
                    srv.Category as Categoria,
                    COUNT(s.SubscriptionId) as TotalSuscripciones,
                    SUM(s.AmountPaid) as IngresosTotales,
                    ROUND(AVG(s.AmountPaid), 2) as PromedioIngreso
                FROM Service srv
                JOIN Plan p ON srv.ServiceId = p.ServiceId
                JOIN Subscription s ON p.PlanId = s.PlanId
                GROUP BY srv.ServiceId, srv.Name, srv.Category
                ORDER BY IngresosTotales DESC
                LIMIT 10
                """
                
                await cursor.execute(query)
                ingresos = await cursor.fetchall()
                
                # Calcular estadísticas adicionales
                total_general = sum(row['IngresosTotales'] for row in ingresos)
                total_suscripciones = sum(row['TotalSuscripciones'] for row in ingresos)
                
                return {
                    "success": True,
                    "message": "Reporte de ingresos totales obtenido exitosamente",
                    "data": ingresos,
                    "estadisticas": {
                        "ingresos_totales": total_general,
                        "total_suscripciones": total_suscripciones,
                        "promedio_general": round(total_general / len(ingresos), 2) if ingresos else 0
                    },
                    "total_registros": len(ingresos)
                }
            
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Error al obtener reporte de ingresos totales: {str(e)}"
        )

# Endpoint adicional para resumen general de reportes
@router.get("/admin/reportes/resumen")
async def resumen_reportes(request: Request):
    """
    Obtiene un resumen general de todos los reportes
    """
    try:
        pool = await get_db_pool(request.app)

        async with pool.acquire() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cursor:
                
                # Total de usuarios
                await cursor.execute("SELECT COUNT(*) as total FROM User")
                total_usuarios = (await cursor.fetchone())['total']
                
                # Total de servicios
                await cursor.execute("SELECT COUNT(*) as total FROM Service")
                total_servicios = (await cursor.fetchone())['total']
                
                # Total de suscripciones
                await cursor.execute("SELECT COUNT(*) as total FROM Subscription")
                total_suscripciones = (await cursor.fetchone())['total']
                
                # Suscripciones activas
                await cursor.execute("SELECT COUNT(*) as total FROM Subscription WHERE Status = 'active'")
                suscripciones_activas = (await cursor.fetchone())['total']
                
                # Ingresos totales
                await cursor.execute("SELECT SUM(AmountPaid) as total FROM Subscription")
                ingresos_totales = (await cursor.fetchone())['total'] or 0
                
                # Categorías más populares
                await cursor.execute("""
                    SELECT srv.Category, COUNT(s.SubscriptionId) as total
                    FROM Service srv
                    JOIN Plan p ON srv.ServiceId = p.ServiceId
                    JOIN Subscription s ON p.PlanId = s.PlanId
                    GROUP BY srv.Category
                    ORDER BY total DESC
                    LIMIT 3
                """)
                top_categorias = await cursor.fetchall()
                
                return {
                    "success": True,
                    "message": "Resumen de reportes obtenido exitosamente",
                    "data": {
                        "usuarios": {
                            "total": total_usuarios
                        },
                        "servicios": {
                            "total": total_servicios
                        },
                        "suscripciones": {
                            "total": total_suscripciones,
                            "activas": suscripciones_activas,
                            "inactivas": total_suscripciones - suscripciones_activas
                        },
                        "ingresos": {
                            "total": float(ingresos_totales),
                            "promedio_por_suscripcion": round(float(ingresos_totales) / total_suscripciones, 2) if total_suscripciones > 0 else 0
                        },
                        "top_categorias": top_categorias
                    }
                }
            
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Error al obtener resumen de reportes: {str(e)}"
        )