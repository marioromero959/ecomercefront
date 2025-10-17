-- ===========================================
-- SCRIPT DE INICIALIZACIÓN DE BASE DE DATOS POSTGRESQL
-- ===========================================

-- Crear la base de datos si no existe
SELECT 'CREATE DATABASE ecommerce_db'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'ecommerce_db')\gexec

-- Conectar a la base de datos ecommerce_db
\c ecommerce_db;

-- Crear extensiones útiles si no existen
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Configuraciones adicionales para PostgreSQL
-- Configurar timezone
SET timezone = 'UTC';

-- Mostrar información de la base de datos
SELECT 'Base de datos ecommerce_db inicializada exitosamente' as status;
