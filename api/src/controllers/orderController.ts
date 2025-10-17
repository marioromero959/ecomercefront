import { Request, Response } from 'express';
import { Order } from '../models/Order';
import { OrderItem } from '../models/OrderItem';
import { Cart } from '../models/Cart';
import { Product } from '../models/Product';
import { sequelize } from '../config/database';

interface AuthRequest extends Request {
  user?: any;
}

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Create a new order from cart items
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - shippingAddress
 *             properties:
 *               shippingAddress:
 *                 type: string
 *                 description: Delivery address for the order
 *     responses:
 *       201:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 order:
 *                   $ref: '#/components/schemas/Order'
 *       400:
 *         description: Cart is empty or insufficient stock
 *       500:
 *         description: Server error
 */
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

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Get all orders (admin gets all, users get their own)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of orders
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 orders:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Order'
 *       500:
 *         description: Server error
 */
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

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Get order by ID
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 order:
 *                   $ref: '#/components/schemas/Order'
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
 */
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

/**
 * @swagger
 * /api/orders/{id}/status:
 *   put:
 *     summary: Update order status (Admin only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, processing, shipped, delivered, cancelled]
 *                 description: New order status
 *     responses:
 *       200:
 *         description: Order status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 order:
 *                   $ref: '#/components/schemas/Order'
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
 */
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