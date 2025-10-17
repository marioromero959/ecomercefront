import { Request, Response, NextFunction } from 'express';

export const errorHandler = (error: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', error);

  // Errores de validación de Sequelize
  if (error.name === 'SequelizeValidationError') {
    const errors = error.errors.map((err: any) => ({
      field: err.path,
      message: err.message
    }));
    return res.status(400).json({ error: 'Validation error', details: errors });
  }

  // Errores de unicidad de Sequelize
  if (error.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({ error: 'Record already exists' });
  }

  // Errores de clave foránea
  if (error.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({ error: 'Invalid reference to related record' });
  }

  // Error por defecto
  res.status(error.status || 500).json({ 
    error: error.message || 'Internal server error' 
  });
};

// Middleware para rutas no encontradas
export const notFound = (req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
};
