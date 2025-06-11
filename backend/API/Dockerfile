# Etapa 1: Builder con dependencias
FROM python:3.13.2-slim AS builder

WORKDIR /install

# Copiar solo requirements.txt para aprovechar cache
COPY requirements.txt .

# Instalar dependencias en una ruta separada
RUN pip install --no-cache-dir --prefix=/install/deps -r requirements.txt

# Etapa 2: Imagen final
FROM python:3.13.2-slim

WORKDIR /app

# Copiar dependencias desde el builder
COPY --from=builder /install/deps /usr/local

# Copiar el resto de la aplicación
COPY . /app

EXPOSE 8000

# Ejecutar la aplicación con Uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
