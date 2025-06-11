FROM node:22.14.0-slim AS build

#  Especificar el area de trabajo
WORKDIR /app

# Copiar el package.json y package-lock.json
COPY package*.json ./

#  Instalar las dependencias 
RUN npm install

# Copiar el resto del codigo
COPY . .

# Generar el build del proyecto
RUN npm run build

# Etapa 2
FROM nginx:alpine

# Copiar el build generado en la etapa anterior
COPY --from=build /app/dist /usr/share/nginx/html

# Exponer el puerto 80
EXPOSE 80

# Comando para iniciar nginx
CMD ["nginx", "-g", "daemon off;"]
