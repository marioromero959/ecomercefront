import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { Product } from './Product';
import { User } from './User';

// Asegurarse de que Model tenga el tipo correcto
type CartModel = typeof Model & {
  new (values?: object, options?: object): Cart;
};

interface CartAttributes {
  id: number;
  userId: number;
  productId: number;
  quantity: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface CartCreationAttributes extends Optional<CartAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class Cart extends Model<CartAttributes, CartCreationAttributes> implements CartAttributes {
  public id!: number;
  public userId!: number;
  public productId!: number;
  public quantity!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Declaraciones para asociaciones
  public readonly User?: User;
  public readonly Product?: Product;
}

Cart.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
    field: 'user_id'
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Product,
      key: 'id',
    },
    field: 'product_id'
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
    },
  },
}, {
  sequelize,
  tableName: 'cart',
  underscored: true,
}) as unknown as CartModel;