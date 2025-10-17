# Dockerfile para el backend Node.js/TypeScript
FROM node:20-alpine

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar TODAS las dependencias (incluyendo devDependencies para el build)
RUN npm install

# Crear directorio para uploads
RUN mkdir -p uploads

# Copiar código fuente
COPY . .

# Compilar TypeScript y limpiar caché de npm
RUN npm run build && \
    npm cache clean --force

# Exponer puerto
EXPOSE 3000

# Variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=3000

# Comando para iniciar la aplicación
CMD ["npm", "start"]
