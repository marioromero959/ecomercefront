import { Request, Response } from 'express';
import { sequelize } from '../config/database';

export const healthCheck = async (req: Request, res: Response) => {
  try {
    // Verificar conexión a la base de datos
    await sequelize.authenticate();
    
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error',
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development'
    });
  }
};
