import aiomysql
from dotenv import load_dotenv
import os

load_dotenv(".env")

db_host = os.getenv("DB_HOST")
db_port = int(os.getenv("DB_PORT"))
db_user = os.getenv("DB_USER")
db_password = os.getenv("DB_PASSWORD")
db_name = os.getenv("DB_NAME")


async def get_db_pool(app):
    """Establece la conexión a la base de datos y devuelve el pool de conexiones."""
    if not hasattr(app.state, "db_pool"): 
        app.state.db_pool = await aiomysql.create_pool(
            host=db_host,  # Nombre del servicio del contenedor (en docker-compose)
            port=db_port,   # Puerto de MySQL
            user=db_user,  # Usuario de MySQL
            password=db_password,  # Contraseña de root
            db=db_name,  # Nombre de la base de datos
            autocommit=True  # Autocommit solucion a bug????
        )
    return app.state.db_pool

