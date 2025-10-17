import { Request, Response } from 'express';
import { Cart } from '../models/Cart';
import { Product } from '../models/Product';
import { Model, ModelStatic } from 'sequelize';

interface CartModel extends ModelStatic<Cart> {}
interface ProductModel extends ModelStatic<Product> {}

interface AuthRequest extends Request {
  user?: {
    id: number;
  };
  body: any;
  params: any;
}

export const getCart = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    
    const cartItems = await Cart.findAll({
      where: { userId },
      include: [{
        model: Product,
        attributes: ['id', 'name', 'image', 'stock', 'price']
      }]
    });

    // Compute total safely. Depending on the Sequelize setup the included product
    // may be available as `item.product` (alias) or `item.Product` (model name).
    const total = cartItems.reduce((sum: number, item: any) => {
      const quantity = Number(item.quantity) || 0;

      // Try multiple locations for the included product instance
      const includedProduct = item.product ?? item.Product ?? item;

      // Extract price safely and coerce to number
      const priceRaw = includedProduct && (includedProduct.price ?? includedProduct.dataValues?.price);
      const price = priceRaw != null ? Number(priceRaw) : 0;

      return sum + quantity * price;
    }, 0);

    res.json({
      cartItems,
      total: total.toFixed(2)
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ error: 'Failed to get cart' });
  }
};

export const addToCart = async (req: AuthRequest, res: Response) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const userId = req.user!.id;

    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ error: 'Insufficient stock' });
    }

    const existingCartItem = await Cart.findOne({
      where: { userId, productId }
    });

    if (existingCartItem) {
      const newQuantity = existingCartItem.quantity + quantity;
      if (product.stock < newQuantity) {
        return res.status(400).json({ error: 'Insufficient stock' });
      }
      
      await existingCartItem.update({ quantity: newQuantity });
    } else {
      await Cart.create({ userId, productId, quantity });
    }

    res.json({ message: 'Product added to cart successfully' });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ error: 'Failed to add to cart' });
  }
};

export const updateCartItem = async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const quantity = Number(req.body.quantity);
    const userId = req.user!.id;

    // Validaciones básicas
    if (!Number.isInteger(id) || Number.isNaN(id) || !Number.isInteger(quantity) || Number.isNaN(quantity) || quantity < 1) {
      return res.status(400).json({ error: 'Invalid id or quantity' });
    }

    const cartItem = await Cart.findOne({
      where: { id, userId },
      include: [{ model: Product, attributes: ['id', 'name', 'image', 'stock', 'price'] }]
    });

    if (!cartItem) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    // Obtener el producto incluido si existe, o buscarlo por productId como respaldo
    const includedProduct = (cartItem as any).Product ?? (cartItem as any).product ?? null;
    const product = includedProduct ?? await Product.findByPk((cartItem as any).productId);

    const productStock = Number(product?.stock ?? 0);

    // Si la cantidad solicitada es 0, eliminamos el item del carrito
    if (quantity === 0) {
      await cartItem.destroy();
      return res.json({ message: 'Item removed from cart' });
    }

    // Comparar contra el stock del producto
    if (productStock < quantity) {
      return res.status(400).json({ error: 'Insufficient stock' });
    }

    await cartItem.update({ quantity });

    // Recargar el item para incluir datos actualizados del producto
    const updated = await cartItem.reload({ include: [{ model: Product, attributes: ['id', 'name', 'image', 'stock', 'price'] }] });
    return res.json({ message: 'Cart updated successfully', cartItem: updated });
  } catch (error) {
    console.error('Update cart error:', error);
    return res.status(500).json({ error: 'Failed to update cart' });
  }
};

export const removeFromCart = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const cartItem = await Cart.findOne({
      where: { id, userId }
    });

    if (!cartItem) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    await cartItem.destroy();
    res.json({ message: 'Item removed from cart successfully' });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ error: 'Failed to remove from cart' });
  }
};

export const clearCart = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    await Cart.destroy({ where: { userId } });
    res.json({ message: 'Cart cleared successfully' });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ error: 'Failed to clear cart' });
  }
};
