import { User } from './User';
import { Category } from './Category';
import { Product } from './Product';
import { Cart } from './Cart';
import { Order } from './Order';
import { OrderItem } from './OrderItem';

// Definir asociaciones
export const setupAssociations = () => {
  // Category - Product
  Category.hasMany(Product, { foreignKey: 'categoryId', onDelete: 'CASCADE' });
  Product.belongsTo(Category, { foreignKey: 'categoryId' });

  // User - Cart
  User.hasMany(Cart, { foreignKey: 'userId', onDelete: 'CASCADE' });
  Cart.belongsTo(User, { foreignKey: 'userId' });

  // Product - Cart
  Product.hasMany(Cart, { foreignKey: 'productId', onDelete: 'CASCADE' });
  Cart.belongsTo(Product, { foreignKey: 'productId' });

  // User - Order
  User.hasMany(Order, { foreignKey: 'userId', onDelete: 'CASCADE' });
  Order.belongsTo(User, { foreignKey: 'userId' });

  // Order - OrderItem
  Order.hasMany(OrderItem, { foreignKey: 'orderId', onDelete: 'CASCADE' });
  OrderItem.belongsTo(Order, { foreignKey: 'orderId' });

  // Product - OrderItem
  Product.hasMany(OrderItem, { foreignKey: 'productId', onDelete: 'CASCADE' });
  OrderItem.belongsTo(Product, { foreignKey: 'productId' });
};

export {
  User,
  Category,
  Product,
  Cart,
  Order,
  OrderItem
};