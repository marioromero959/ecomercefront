import { Sequelize, DataTypes } from 'sequelize';

// Crear conexión directa a ecommerce_db
const sequelize = new Sequelize({
  dialect: 'postgres',
  host: 'database',
  port: 5432,
  database: 'ecommerce_db',
  username: 'postgres',
  password: 'postgres123',
  logging: console.log
});

// Definir modelos directamente en el script
const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  firstName: { type: DataTypes.STRING(50), allowNull: false },
  lastName: { type: DataTypes.STRING(50), allowNull: false },
  email: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  password: { type: DataTypes.STRING(255), allowNull: false },
  role: { type: DataTypes.ENUM('customer', 'admin'), defaultValue: 'customer' },
  phone: { type: DataTypes.STRING(20), allowNull: true },
  address: { type: DataTypes.TEXT, allowNull: true }
}, { tableName: 'users' });

const Category = sequelize.define('Category', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  description: { type: DataTypes.TEXT, allowNull: true },
  image: { type: DataTypes.STRING(255), allowNull: true }
}, { tableName: 'categories' });

const Product = sequelize.define('Product', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(100), allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: true },
  price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  stock: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  image: { type: DataTypes.STRING(255), allowNull: true },
  featured: { type: DataTypes.BOOLEAN, defaultValue: false },
  categoryId: { type: DataTypes.INTEGER, allowNull: false }
}, { tableName: 'products' });

const Cart = sequelize.define('Cart', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  productId: { type: DataTypes.INTEGER, allowNull: false }
}, { tableName: 'cart' });

const Order = sequelize.define('Order', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  total: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  status: { type: DataTypes.ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled'), defaultValue: 'pending' },
  shippingAddress: { type: DataTypes.TEXT, allowNull: false },
  userId: { type: DataTypes.INTEGER, allowNull: false }
}, { tableName: 'orders' });

const OrderItem = sequelize.define('OrderItem', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  quantity: { type: DataTypes.INTEGER, allowNull: false },
  price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  orderId: { type: DataTypes.INTEGER, allowNull: false },
  productId: { type: DataTypes.INTEGER, allowNull: false }
}, { tableName: 'order_items' });

// Definir asociaciones
Category.hasMany(Product, { foreignKey: 'categoryId', onDelete: 'CASCADE' });
Product.belongsTo(Category, { foreignKey: 'categoryId' });

User.hasMany(Cart, { foreignKey: 'userId', onDelete: 'CASCADE' });
Cart.belongsTo(User, { foreignKey: 'userId' });

Product.hasMany(Cart, { foreignKey: 'productId', onDelete: 'CASCADE' });
Cart.belongsTo(Product, { foreignKey: 'productId' });

User.hasMany(Order, { foreignKey: 'userId', onDelete: 'CASCADE' });
Order.belongsTo(User, { foreignKey: 'userId' });

Order.hasMany(OrderItem, { foreignKey: 'orderId', onDelete: 'CASCADE' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });

Product.hasMany(OrderItem, { foreignKey: 'productId', onDelete: 'CASCADE' });
OrderItem.belongsTo(Product, { foreignKey: 'productId' });

async function syncDatabase() {
  try {
    console.log('🔄 Iniciando sincronización de base de datos...');
    
    // Conectar a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conectado a ecommerce_db');
    
    // Sincronizar con force: true para recrear las tablas
    await sequelize.sync({ force: true });
    console.log('✅ Base de datos sincronizada exitosamente');
    
    // Verificar que las tablas se crearon
    const [results] = await sequelize.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE'"
    );
    
    console.log('📋 Tablas creadas:', results);
    
    await sequelize.close();
    console.log('🔚 Conexión cerrada');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error sincronizando base de datos:', error);
    process.exit(1);
  }
}

syncDatabase();
