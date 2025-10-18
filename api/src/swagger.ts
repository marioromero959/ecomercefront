import { Express } from 'express';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import * as path from 'path';
import * as fs from 'fs';

// Función para escanear automáticamente los controladores y rutas
function scanControllers() {
  const appContent = fs.readFileSync(path.join(__dirname, 'app.ts'), 'utf8');
  const routes = new Map();
  
  // Extraer las rutas definidas en app.ts usando expresiones regulares
  const routeRegex = /app\.use\('?(\/api\/[^']+)'?,\s*(\w+)Routes\)/g;
  let match;
  
  while ((match = routeRegex.exec(appContent)) !== null) {
    const [_, route, controllerPrefix] = match;
    routes.set(controllerPrefix.toLowerCase(), route);
  }
  
  const controllersPath = path.join(__dirname, 'controllers');
  const controllerFiles = fs.readdirSync(controllersPath);
  
  const paths: any = {};
  
  controllerFiles.forEach(file => {
    if (file.endsWith('Controller.ts')) {
      const controllerName = file.replace('Controller.ts', '').toLowerCase();
      // Usar la ruta real del app.ts o crear una por defecto
      const basePath = routes.get(controllerName) || `/api/${controllerName}s`;
      
      // Rutas automáticas basadas en los métodos comunes
      paths[basePath] = {
        get: {
          tags: [controllerName],
          summary: `Get all ${controllerName}s`,
          responses: {
            200: {
              description: `List of ${controllerName}s retrieved successfully`,
            },
            500: {
              description: 'Internal server error',
            },
          },
        },
        post: {
          tags: [controllerName],
          summary: `Create a new ${controllerName}`,
          security: [{ bearerAuth: [] }],
          responses: {
            201: {
              description: `${controllerName} created successfully`,
            },
            500: {
              description: 'Internal server error',
            },
          },
        },
      };

      paths[`${basePath}/{id}`] = {
        get: {
          tags: [controllerName],
          summary: `Get ${controllerName} by ID`,
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: {
                type: 'integer',
              },
              description: `${controllerName} ID`,
            },
          ],
          responses: {
            200: {
              description: `${controllerName} found`,
            },
            404: {
              description: `${controllerName} not found`,
            },
          },
        },
        put: {
          tags: [controllerName],
          summary: `Update ${controllerName}`,
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: {
                type: 'integer',
              },
              description: `${controllerName} ID`,
            },
          ],
          responses: {
            200: {
              description: `${controllerName} updated successfully`,
            },
            404: {
              description: `${controllerName} not found`,
            },
          },
        },
        delete: {
          tags: [controllerName],
          summary: `Delete ${controllerName}`,
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: {
                type: 'integer',
              },
              description: `${controllerName} ID`,
            },
          ],
          responses: {
            200: {
              description: `${controllerName} deleted successfully`,
            },
            404: {
              description: `${controllerName} not found`,
            },
          },
        },
      };
    }
  });

  return paths;
}

// Función para escanear automáticamente los modelos
function scanModels() {
  const modelsPath = path.join(__dirname, 'models');
  const modelFiles = fs.readdirSync(modelsPath);
  
  const schemas: any = {};
  
  modelFiles.forEach(file => {
    if (file.endsWith('.ts') && file !== 'index.ts') {
      const modelName = file.replace('.ts', '');
      const model = require(path.join(modelsPath, file)).default;
      
      if (model && model.rawAttributes) {
        schemas[modelName] = {
          type: 'object',
          properties: {},
        };
        
        // Convertir atributos del modelo a esquema Swagger
        Object.entries(model.rawAttributes).forEach(([key, value]: [string, any]) => {
          const type = value.type.constructor.name.toLowerCase();
          schemas[modelName].properties[key] = {
            type: type === 'integer' ? 'integer' : 
                  type === 'float' || type === 'double' ? 'number' : 
                  type === 'boolean' ? 'boolean' : 'string',
            description: value.comment || `${key} field`,
          };
        });
      }
    }
  });

  return schemas;
}

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'E-commerce API',
    version: '1.0.0',
    description: 'Automatic API Documentation',
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Development server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: scanModels(),
  },
  paths: scanControllers(),
};

export const swaggerSpec = swaggerJsdoc({
  swaggerDefinition,
  apis: [], // No necesitamos escanear archivos ya que lo hacemos automáticamente
});

export function setupSwagger(app: Express) {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customSiteTitle: 'E-commerce API Documentation',
  }));
}