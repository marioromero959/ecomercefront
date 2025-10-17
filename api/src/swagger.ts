import swaggerJsdoc from 'swagger-jsdoc';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Ecommerce API',
    version: '1.0.0',
    description: 'API Documentation for the Ecommerce platform',
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Development server',
    },
  ],
  components: {
    schemas: {
      OrderItem: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
            description: 'Order item ID'
          },
          orderId: {
            type: 'integer',
            description: 'Order ID'
          },
          productId: {
            type: 'integer',
            description: 'Product ID'
          },
          quantity: {
            type: 'integer',
            description: 'Quantity of product'
          },
          price: {
            type: 'number',
            description: 'Price at time of order'
          },
          Product: {
            $ref: '#/components/schemas/Product'
          }
        }
      },
      Order: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
            description: 'Order ID'
          },
          userId: {
            type: 'integer',
            description: 'User ID'
          },
          total: {
            type: 'number',
            description: 'Total order amount'
          },
          status: {
            type: 'string',
            enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
            description: 'Order status'
          },
          shippingAddress: {
            type: 'string',
            description: 'Shipping address'
          },
          OrderItems: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/OrderItem'
            }
          }
        }
      },
      MercadoPagoProduct: {
        type: 'object',
        required: ['nombre', 'precio', 'cantidad'],
        properties: {
          nombre: {
            type: 'string',
            description: 'Product name'
          },
          precio: {
            type: 'number',
            description: 'Product price'
          },
          cantidad: {
            type: 'integer',
            description: 'Product quantity'
          }
        }
      },
      AndreaniShipmentQuote: {
        type: 'object',
        required: ['codigoPostalOrigen', 'codigoPostalDestino', 'bultos'],
        properties: {
          codigoPostalOrigen: {
            type: 'string',
            description: 'Origin postal code'
          },
          codigoPostalDestino: {
            type: 'string',
            description: 'Destination postal code'
          },
          bultos: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                kilos: {
                  type: 'number',
                  description: 'Package weight in kilograms'
                },
                volumen: {
                  type: 'number',
                  description: 'Package volume in cubic centimeters'
                },
                valorDeclarado: {
                  type: 'number',
                  description: 'Declared value'
                }
              }
            }
          },
          contrato: {
            type: 'string',
            description: 'Contract number (optional)'
          }
        }
      },
      AndreaniShipmentOrder: {
        type: 'object',
        required: ['destino', 'bultos', 'remitente'],
        properties: {
          destino: {
            type: 'object',
            properties: {
              codigoPostal: {
                type: 'string'
              },
              direccion: {
                type: 'string'
              },
              localidad: {
                type: 'string'
              },
              provincia: {
                type: 'string'
              }
            }
          },
          bultos: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                kilos: {
                  type: 'number'
                },
                volumen: {
                  type: 'number'
                }
              }
            }
          },
          remitente: {
            type: 'object',
            properties: {
              nombre: {
                type: 'string'
              },
              email: {
                type: 'string'
              }
            }
          }
        }
      },
      MercadoPagoNotification: {
        type: 'object',
        required: ['type', 'data'],
        properties: {
          action: {
            type: 'string',
            description: 'Notification action'
          },
          api_version: {
            type: 'string',
            description: 'MercadoPago API version'
          },
          data: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                description: 'Payment ID'
              }
            }
          },
          date_created: {
            type: 'string',
            format: 'date-time',
            description: 'Notification creation date'
          },
          id: {
            type: 'integer',
            description: 'Notification ID'
          },
          live_mode: {
            type: 'boolean',
            description: 'Whether the notification is from live or test mode'
          },
          type: {
            type: 'string',
            description: 'Notification type'
          },
          user_id: {
            type: 'string',
            description: 'MercadoPago user ID'
          }
        }
      },
      HealthCheck: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            enum: ['healthy', 'unhealthy'],
            description: 'Current health status'
          },
          timestamp: {
            type: 'string',
            format: 'date-time',
            description: 'Time of health check'
          },
          database: {
            type: 'string',
            enum: ['connected', 'disconnected'],
            description: 'Database connection status'
          },
          uptime: {
            type: 'number',
            description: 'Server uptime in seconds'
          },
          environment: {
            type: 'string',
            description: 'Current environment'
          },
          error: {
            type: 'string',
            description: 'Error message if status is unhealthy'
          }
        }
      },
      MercadoPagoClient: {
        type: 'object',
        required: ['name', 'email'],
        properties: {
          name: {
            type: 'string',
            description: 'Client name'
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'Client email'
          }
        }
      },
      Category: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
            description: 'Category ID'
          },
          name: {
            type: 'string',
            description: 'Category name'
          },
          description: {
            type: 'string',
            description: 'Category description'
          },
          image: {
            type: 'string',
            description: 'Category image URL'
          }
        }
      },
      CartItem: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
            description: 'Cart item ID'
          },
          userId: {
            type: 'integer',
            description: 'User ID'
          },
          productId: {
            type: 'integer',
            description: 'Product ID'
          },
          quantity: {
            type: 'integer',
            description: 'Quantity of product'
          },
          Product: {
            $ref: '#/components/schemas/Product'
          }
        }
      },
      User: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
            description: 'User ID'
          },
          firstName: {
            type: 'string',
            description: 'User first name'
          },
          lastName: {
            type: 'string',
            description: 'User last name'
          },
          email: {
            type: 'string',
            description: 'User email'
          },
          role: {
            type: 'string',
            enum: ['user', 'admin'],
            description: 'User role'
          },
          phone: {
            type: 'string',
            description: 'User phone number'
          },
          address: {
            type: 'string',
            description: 'User address'
          }
        }
      },
      Product: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
            description: 'Product ID'
          },
          name: {
            type: 'string',
            description: 'Product name'
          },
          description: {
            type: 'string',
            description: 'Product description'
          },
          price: {
            type: 'number',
            description: 'Product price'
          },
          stock: {
            type: 'integer',
            description: 'Product stock quantity'
          },
          image: {
            type: 'string',
            description: 'Product image URL'
          },
          categoryId: {
            type: 'integer',
            description: 'Category ID'
          },
          featured: {
            type: 'boolean',
            description: 'Is product featured'
          },
          Category: {
            type: 'object',
            properties: {
              id: {
                type: 'integer'
              },
              name: {
                type: 'string'
              }
            }
          }
        }
      }
    },
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  security: [{
    bearerAuth: [],
  }],
  tags: [
    {
      name: 'Products',
      description: 'Product management'
    },
    {
      name: 'Cart',
      description: 'Shopping cart operations'
    },
    {
      name: 'Categories',
      description: 'Category management'
    },
    {
      name: 'Orders',
      description: 'Order management'
    },
    {
      name: 'Users',
      description: 'User management'
    },
    {
      name: 'MercadoPago',
      description: 'Payment processing'
    },
    {
      name: 'Andreani',
      description: 'Shipping integration'
    },
    {
      name: 'Webhooks',
      description: 'Payment notification webhooks'
    },
    {
      name: 'Health',
      description: 'API health monitoring'
    }
  ],
};

const options: swaggerJsdoc.Options = {
  swaggerDefinition,
  apis: ['./src/controllers/*.ts'], // Rutas a los archivos con documentación
};

export const swaggerSpec = swaggerJsdoc(options);