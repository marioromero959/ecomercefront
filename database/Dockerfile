FROM postgres:15-alpine

# Instalar dos2unix para convertir archivos de Windows a Unix
RUN apk add --no-cache dos2unix

# Copiar scripts de inicialización
COPY . /docker-entrypoint-initdb.d/

# Convertir archivos de Windows a Unix y dar permisos de ejecución
RUN dos2unix /docker-entrypoint-initdb.d/*.sh && \
    chmod +x /docker-entrypoint-initdb.d/*.sh

# Configurar el usuario postgres
USER postgres
