import os
import smtplib
import asyncio
from email.message import EmailMessage
from jinja2 import Environment, FileSystemLoader
from dotenv import load_dotenv

# carga variables de entorno
load_dotenv()
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
SMTP_USER = os.getenv("SMTP_USER")
SMTP_PASS = os.getenv("SMTP_PASS")
MAIL_FROM = os.getenv("MAIL_FROM")

# prepara Jinja2 para plantillas
jinja_env = Environment(loader=FileSystemLoader("templates"))

async def send_email(subject: str, to: str, template_name: str, context: dict):
    
    # renderiza la plantilla HTML
    template = jinja_env.get_template(template_name)
    html_content = template.render(**context)

    # construye el mensaje MIME
    msg = EmailMessage()
    msg["From"] = MAIL_FROM
    msg["To"] = to
    msg["Subject"] = subject
    msg.set_content(html_content, subtype="html")

    # función de envío sincrónico
    def _sync_send():
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASS)
            server.send_message(msg)

    # lo ejecutamos en un hilo para no bloquear el event loop
    await asyncio.to_thread(_sync_send)
