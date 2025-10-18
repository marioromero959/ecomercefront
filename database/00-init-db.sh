#!/bin/bash
set -e

echo "Starting database initialization..."

# Función para ejecutar SQL como superusuario postgres
psql_superuser() {
    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "postgres" -c "$1"
}

# Crear la base de datos si no existe
echo "Creating database ecommerce_db..."
psql_superuser "CREATE DATABASE ecommerce_db;" || echo "Database already exists"

# Conectar a la base de datos ecommerce_db y ejecutar el script de inicialización
echo "Executing init.sql..."
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "ecommerce_db" -f /docker-entrypoint-initdb.d/init.sql

echo "Database initialization completed successfully!"