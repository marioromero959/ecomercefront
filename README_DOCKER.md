# 🐳 Docker Setup - E-Commerce

Este proyecto incluye configuración completa de Docker para desarrollo y producción.

## 📋 Requisitos Previos

### **Windows:**
- Docker Desktop 4.0+
- WSL2 habilitado (recomendado)
- Mínimo 4GB RAM asignada a Docker
- Windows 10/11 o Windows Server 2019+

### **Linux/Mac:**
- Docker 20.0+
- Docker Compose 2.0+
- Mínimo 4GB RAM disponible

## 🚀 Inicio Rápido

### **Opción 1: Script Automático (Recomendado)**

**Windows:**
```cmd
docker-start.bat
```

**Linux/Mac:**
```bash
./docker-start.sh
```

### **Opción 2: Comandos Manuales**

```bash
# 1. Crear archivo de entorno
cp api/.env.docker api/.env

# 2. Construir y levantar servicios
docker-compose up --build -d

# 3. Verificar estado
docker-compose ps
```

## 🏗️ Arquitectura del Sistema

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (Angular)     │───▶│   (Node.js)     │───▶│   (PostgreSQL)  │
│   Port: 80      │    │   Port: 3000    │    │   Port: 5432    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### **Servicios Incluidos:**

- **Frontend**: Angular 20 con Nginx
- **Backend**: Node.js/TypeScript con Express
- **Database**: PostgreSQL 15 Alpine
- **Networks**: Red interna para comunicación entre servicios

## 🔧 Configuración

### **Variables de Entorno**

El archivo `api/.env.docker` contiene todas las configuraciones necesarias:

```env
# Base de datos
DB_HOST=database
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres123
DB_NAME=ecommerce_db

# JWT
JWT_SECRET=ecommerce_jwt_secret_key_2024_very_secure_random_string_12345
JWT_EXPIRES_IN=7d
```

### **Puertos Expuestos**

- **Frontend**: http://localhost
- **Backend API**: http://localhost:3000
- **PostgreSQL**: localhost:5432
- **Health Check**: http://localhost:3000/api/health

## 📊 Monitoreo y Diagnóstico

### **Comandos Útiles**

```bash
# Ver estado de servicios
docker-compose ps

# Ver logs en tiempo real
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs database
docker-compose logs backend
docker-compose logs frontend

# Verificar conectividad
docker-compose exec backend ping database
docker-compose exec backend telnet database 5432

# Reiniciar servicios
docker-compose restart
docker-compose restart database

# Parar todos los servicios
docker-compose down
```

### **Health Checks**

Todos los servicios incluyen health checks automáticos:

```bash
# Verificar estado de health checks
docker-compose ps

# Debe mostrar "healthy" para todos los servicios
```

## 🛠️ Desarrollo

### **Modo Desarrollo**

Para desarrollo con hot reload:

```bash
# Usar configuración de desarrollo
docker-compose -f docker-compose.dev.yml up --build

# O solo la base de datos para desarrollo local
docker-compose up database -d
npm run dev  # En el directorio api/
```

### **Estructura de Volúmenes**

- `postgres_data`: Datos persistentes de PostgreSQL
- `backend_uploads`: Archivos subidos por usuarios
- Montaje de código fuente en modo desarrollo

## 🚨 Solución de Problemas

### **Problemas Comunes**

1. **PostgreSQL no inicia**: Verificar recursos de Docker (2GB RAM mínimo)
2. **Error de conexión**: Verificar variables de entorno y puertos
3. **Performance lenta**: Aumentar recursos asignados a Docker

### **Logs de Diagnóstico**

```bash
# Ver logs detallados
docker-compose logs --tail=100

# Verificar uso de recursos
docker stats

# Limpiar sistema Docker
docker system prune -a
```

### **Documentación Completa**

Ver `DOCKER_SOLUTIONS.md` para soluciones detalladas a problemas específicos.

## 🔄 Comandos de Mantenimiento

### **Backup de Base de Datos**

```bash
# Crear backup
docker-compose exec database pg_dump -U postgres ecommerce_db > backup/ecommerce_db_backup.sql

# Backup con compresión
docker-compose exec database pg_dump -U postgres -Fc ecommerce_db > backup/ecommerce_db_backup.dump
```

### **Restaurar Base de Datos**

```bash
# Restaurar desde SQL
docker-compose exec -T database psql -U postgres ecommerce_db < backup/ecommerce_db_backup.sql

# Restaurar desde dump comprimido
docker-compose exec -T database pg_restore -U postgres -d ecommerce_db < backup/ecommerce_db_backup.dump
```

### **Actualización de Servicios**

```bash
# Reconstruir con última versión
docker-compose down
docker-compose pull
docker-compose up --build -d
```

## 📈 Performance

### **Optimizaciones Incluidas**

- Multi-stage builds para imágenes más pequeñas
- Health checks para reinicio automático
- Configuración de pools de conexión optimizada
- Compresión gzip en Nginx
- Cache de archivos estáticos

### **Monitoreo de Recursos**

```bash
# Ver uso en tiempo real
docker stats

# Información del sistema
docker system df
docker system info
```

## 🔐 Seguridad

### **Configuraciones de Seguridad**

- Variables de entorno para credenciales
- Redes internas para comunicación entre servicios
- Configuración de CORS restrictiva
- Headers de seguridad en Nginx
- Validación de entrada en backend

### **Mejores Prácticas**

- Cambiar contraseñas por defecto en producción
- Usar certificados SSL para producción
- Configurar firewall apropiadamente
- Mantener imágenes actualizadas

---

**💡 Tip:** Para desarrollo local, considera usar solo la base de datos en Docker y ejecutar el backend localmente para mejor debugging.

**📞 Soporte:** Si encuentras problemas, revisa `DOCKER_SOLUTIONS.md` o los logs con `docker-compose logs`.
