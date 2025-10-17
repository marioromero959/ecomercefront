// src/app.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './swagger';
import { createServer } from 'http';
import path from 'path';
import { sequelize } from './config/database';
import { setupAssociations } from './models';
import { authRoutes } from './routes/auth';
import { productRoutes } from './routes/products';
import { categoryRoutes } from './routes/categories';
import { cartRoutes } from './routes/cart';
import { orderRoutes } from './routes/orders';
import { userRoutes } from './routes/users';
import { errorHandler } from './middleware/errorHandler';
import andreaniRoutes from './routes/andreani';
import webhookRoutes from './routes/webhooks';
import mercadoPagoRoutes from './routes/mercadopago';

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/andreani', andreaniRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/mercadopago', mercadoPagoRoutes);

// Swagger Documentation
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling
app.use(errorHandler);

// Database connection and server start
const startServer = async () => {
  try {
    // Usar la función que crea la base de datos si no existe
    const { testConnection } = require('./config/database');
    const connected = await testConnection(5); // 5 reintentos
    
    if (!connected) {
      throw new Error('Failed to connect to database after 5 attempts');
    }
    
    console.log('Database connected successfully');
    
    // Setup model associations
    setupAssociations();
    console.log('Model associations configured');
    
    await sequelize.sync({ force: false });
    console.log('Database synchronized');
    
    // Initialize Socket.IO
    const { initializeSocket } = require('./config/socket');
    initializeSocket(httpServer);
    
    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;