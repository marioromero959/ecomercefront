// Script de prueba para verificar la migración a PostgreSQL
const { Sequelize } = require('sequelize');

console.log('🧪 Probando migración a PostgreSQL...');

// Configuración de prueba
const sequelize = new Sequelize({
  dialect: 'postgres',
  host: 'localhost',
  port: 5432,
  database: 'ecommerce_db',
  username: 'postgres',
  password: 'postgres123',
  logging: console.log
});

async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a PostgreSQL exitosa!');
    
    // Probar una consulta simple
    const [results] = await sequelize.query('SELECT version()');
    console.log('📊 Versión de PostgreSQL:', results[0].version);
    
    await sequelize.close();
    console.log('🎉 Migración verificada correctamente!');
  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
    console.log('💡 Asegúrate de que PostgreSQL esté ejecutándose en localhost:5432');
  }
}

testConnection();
