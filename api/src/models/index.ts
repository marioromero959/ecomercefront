import { User } from './User';
import { Category } from './Category';
import { Product } from './Product';
import { Cart } from './Cart';
import { Order } from './Order';
import { OrderItem } from './OrderItem';

// Definir asociaciones
export const setupAssociations = () => {
  // Category - Product
  Category.hasMany(Product, { foreignKey: 'category_id', onDelete: 'CASCADE' });
  Product.belongsTo(Category, { foreignKey: 'category_id' });

  // User - Cart
  User.hasMany(Cart, { foreignKey: 'user_id', onDelete: 'CASCADE' });
  Cart.belongsTo(User, { foreignKey: 'user_id' });

  // Product - Cart
  Product.hasMany(Cart, { foreignKey: 'product_id', onDelete: 'CASCADE' });
  Cart.belongsTo(Product, { foreignKey: 'product_id' });

  // User - Order
  User.hasMany(Order, { foreignKey: 'user_id', onDelete: 'CASCADE' });
  Order.belongsTo(User, { foreignKey: 'user_id' });

  // Order - OrderItem
  Order.hasMany(OrderItem, { foreignKey: 'order_id', onDelete: 'CASCADE' });
  OrderItem.belongsTo(Order, { foreignKey: 'order_id' });

  // Product - OrderItem
  Product.hasMany(OrderItem, { foreignKey: 'product_id', onDelete: 'CASCADE' });
  OrderItem.belongsTo(Product, { foreignKey: 'product_id' });
};

export {
  User,
  Category,
  Product,
  Cart,
  Order,
  OrderItem
};