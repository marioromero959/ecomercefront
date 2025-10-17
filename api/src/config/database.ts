import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// Configuración para SQL Server Express
export const sequelize = new Sequelize({
  dialect: 'mssql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '1433'),
  database: process.env.DB_NAME || 'ecommerce_db',
  username: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || '',
  dialectOptions: {
    instanceName: process.env.DB_INSTANCE || 'SQLEXPRESS', // Importante para SQL Express
    options: {
      encrypt: false, // Para desarrollo local
      trustServerCertificate: true, // Importante para desarrollo local
      enableArithAbort: true,
      validateBulkLoadParameters: false,
      requestTimeout: 30000
    }
  },
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  define: {
    timestamps: true,
    underscored: false,
    freezeTableName: true
  }
});

// Test connection con reintentos
export const testConnection = async (retries = 3): Promise<boolean> => {
  for (let i = 0; i < retries; i++) {
    try {
      await sequelize.authenticate();
      console.log('✅ SQL Server connection established successfully');
      
      // Crear la base de datos si no existe
      await createDatabaseIfNotExists();
      
      return true;
    } catch (error: any) {
      console.error(`❌ Connection attempt ${i + 1} failed:`, error.message);
      
      if (i < retries - 1) {
        console.log(`⏳ Retrying in 2 seconds...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }
  return false;
};

// Función para crear la base de datos si no existe
async function createDatabaseIfNotExists() {
  try {
    // Conectar sin especificar base de datos
    const tempSequelize = new Sequelize({
      dialect: 'mssql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '1433'),
      username: process.env.DB_USER || 'sa',
      password: process.env.DB_PASSWORD || '',
      dialectOptions: {
        instanceName: process.env.DB_INSTANCE || 'SQLEXPRESS',
        options: {
          encrypt: false,
          trustServerCertificate: true,
          enableArithAbort: true
        }
      },
      logging: false
    });

    // Verificar si la base de datos existe
    const [results] = await tempSequelize.query(
      `SELECT name FROM sys.databases WHERE name = '${process.env.DB_NAME || 'ecommerce_db'}'`
    );

    if (results.length === 0) {
      // Crear la base de datos
      await tempSequelize.query(
        `CREATE DATABASE [${process.env.DB_NAME || 'ecommerce_db'}]`
      );
      console.log('📦 Database created successfully');
    }

    await tempSequelize.close();
  } catch (error) {
    console.error('Error checking/creating database:', error);
  }
}