# 🛒 E-Commerce Full Stack

Un sistema de e-commerce completo desarrollado con Angular, Node.js, TypeScript y PostgreSQL.

## 🏗️ Arquitectura del Proyecto

- **Frontend**: Angular 20 con TypeScript
- **Backend**: Node.js con Express y TypeScript
- **Base de Datos**: PostgreSQL 15
- **ORM**: Sequelize
- **Contenedores**: Docker y Docker Compose
- **Pagos**: MercadoPago
- **Envíos**: Andreani

## 🚀 Inicio Rápido

### Prerrequisitos

- Docker y Docker Compose
- Node.js 20+ (para desarrollo local)
- Angular CLI (para desarrollo frontend)

### Instalación y Ejecución

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd ecomercefront
```

2. **Configurar variables de entorno**
```bash
cp api/env.example api/.env
# Editar api/.env con tus configuraciones
```

3. **Ejecutar con Docker**
```bash
# Iniciar todos los servicios
docker-compose up -d

# Ver logs
docker-compose logs -f
```

4. **Acceder a la aplicación**
- Frontend: http://localhost:80
- Backend API: http://localhost:3000
- Base de datos: localhost:5432

## 🛠️ Desarrollo Local

### Backend (API)

```bash
cd api
npm install
npm run dev
```

### Frontend (Angular)

```bash
npm install
ng serve
```

## 📊 Base de Datos

### PostgreSQL

El proyecto utiliza PostgreSQL 15 con las siguientes características:

- **Puerto**: 5432
- **Base de datos**: ecommerce_db
- **Usuario**: postgres
- **Contraseña**: postgres123

### Estructura de Tablas

- `users` - Usuarios del sistema
- `categories` - Categorías de productos
- `products` - Productos del catálogo
- `cart` - Carrito de compras
- `orders` - Órdenes de compra
- `order_items` - Items de las órdenes

### Scripts de Base de Datos

```bash
# Sincronizar base de datos
npm run sync-db

# Ejecutar seed (datos de prueba)
npm run seed
```

## 🔧 Configuración

### Variables de Entorno Principales

```env
# Base de datos
DB_HOST=database
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres123
DB_NAME=ecommerce_db

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# MercadoPago
MERCADOPAGO_ACCESS_TOKEN=your-token
```

## 📁 Estructura del Proyecto

```
├── api/                    # Backend Node.js
│   ├── src/
│   │   ├── controllers/    # Controladores de la API
│   │   ├── models/         # Modelos de Sequelize
│   │   ├── routes/         # Rutas de la API
│   │   ├── services/       # Servicios de negocio
│   │   └── scripts/        # Scripts de base de datos
│   └── Dockerfile
├── src/                    # Frontend Angular
│   ├── app/
│   │   ├── components/     # Componentes Angular
│   │   ├── services/       # Servicios Angular
│   │   └── guards/         # Guards de autenticación
│   └── environments/       # Configuraciones de entorno
├── docker-compose.yml      # Configuración de contenedores
└── README.md
```

## 🚀 Despliegue

### Producción

1. **Configurar variables de entorno de producción**
2. **Ejecutar migraciones de base de datos**
3. **Construir y desplegar contenedores**

```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 🧪 Testing

```bash
# Backend tests
cd api
npm test

# Frontend tests
ng test
```

## 📝 API Endpoints

### Autenticación
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Inicio de sesión
- `GET /api/auth/profile` - Perfil del usuario

### Productos
- `GET /api/products` - Listar productos
- `POST /api/products` - Crear producto (admin)
- `PUT /api/products/:id` - Actualizar producto (admin)

### Carrito
- `GET /api/cart` - Obtener carrito
- `POST /api/cart` - Agregar al carrito
- `PUT /api/cart/:id` - Actualizar cantidad

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 🆘 Soporte

Si tienes problemas o preguntas:

1. Revisar la documentación
2. Buscar en los issues existentes
3. Crear un nuevo issue con detalles del problema

## 🔄 Migración de SQL Server a PostgreSQL

Este proyecto fue migrado de SQL Server a PostgreSQL para mejorar:
- Rendimiento
- Escalabilidad
- Herramientas de administración
- Compatibilidad con Docker

Para más detalles sobre la migración, ver [MIGRATION.md](MIGRATION.md).