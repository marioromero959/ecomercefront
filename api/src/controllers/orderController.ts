import { Request, Response } from 'express';
import { Order } from '../models/Order';
import { OrderItem } from '../models/OrderItem';
import { Cart } from '../models/Cart';
import { Product } from '../models/Product';
import { sequelize } from '../config/database';

interface AuthRequest extends Request {
  user?: any;
}

export const createOrder = async (req: AuthRequest, res: Response) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { shippingAddress } = req.body;
    const userId = req.user!.id;

    const cartItems = await Cart.findAll({
      where: { userId },
      include: [Product],
      transaction
    });

    if (cartItems.length === 0) {
      await transaction.rollback();
      return res.status(400).json({ error: 'Cart is empty' });
    }

    let total = 0;
    const orderItems = [];

    for (const cartItem of cartItems) {
      
      const product = await Product.findOne({
        where: { id: cartItem.productId },
        include: [Product],
        transaction
      });
      
    if (product?.stock && product.stock < cartItem.quantity) {
        await transaction.rollback();
        return res.status(400).json({ 
          error: `Insufficient stock for product: ${product?.name}` 
        });
      }

      const itemTotal = cartItem.quantity * parseFloat(product?.price?.toString() || '0');
      total += itemTotal;

      orderItems.push({
        productId: product?.id || 0,
        quantity: cartItem.quantity,
        price: product?.price || 0
      });

      await product?.update(
        { stock: product?.stock - cartItem.quantity },
        { transaction }
      );
    }

    const order = await Order.create({
      userId,
      total,
      shippingAddress
    }, { transaction });

    for (const orderItem of orderItems) {
      await OrderItem.create({
        orderId: order.id,
        productId: orderItem.productId || 0,
        quantity: orderItem.quantity,
        price: orderItem.price || 0
      }, { transaction });
    }

    await Cart.destroy({ where: { userId }, transaction });

    await transaction.commit();

    const orderWithItems = await Order.findByPk(order.id, {
      include: [{
        model: OrderItem,
        include: [{ model: Product, attributes: ['id', 'name', 'image'] }]
      }]
    });

    res.status(201).json({
      message: 'Order created successfully',
      order: orderWithItems
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
};

export const getOrders = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const isAdmin = req.user!.role === 'admin';

    const whereClause = isAdmin ? {} : { userId };

    const orders = await Order.findAll({
      where: whereClause,
      include: [{
        model: OrderItem,
        include: [{ model: Product, attributes: ['id', 'name', 'image'] }]
      }],
      order: [['createdAt', 'DESC']]
    });

    res.json({ orders });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Failed to get orders' });
  }
};

export const getOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const isAdmin = req.user!.role === 'admin';

    const whereClause: any = { id };
    if (!isAdmin) {
      whereClause.userId = userId;
    }

    const order = await Order.findOne({
      where: whereClause,
      include: [{
        model: OrderItem,
        include: [{ model: Product, attributes: ['id', 'name', 'image', 'price'] }]
      }]
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({ order });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ error: 'Failed to get order' });
  }
};

export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    await order.update({ status });
    res.json({ 
      message: 'Order status updated successfully',
      order 
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
};