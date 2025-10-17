import { Request, Response } from 'express';
import { Product } from '../models/Product';
import { Category } from '../models/Category';
import { Op } from 'sequelize';

interface AuthRequest extends Request {
  user?: any;
}

export const getProducts = async (req: Request, res: Response) => {
  try {
    console.log("entro a buscar los productos 1");
    
    const { page = 1, limit = 12, category, search, featured } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const whereClause: any = {};
    
    if (category) {
      whereClause.categoryId = category;
    }
    
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }
    
    if (featured) {
      whereClause.featured = featured === 'true';
    }

    const { count, rows } = await Product.findAndCountAll({
      where: whereClause,
      include: [{ model: Category, attributes: ['id', 'name'] }],
      limit: Number(limit),
      offset,
      order: [['created_at', 'DESC']]
    });

    res.json({
      products: rows,
      totalPages: Math.ceil(count / Number(limit)),
      currentPage: Number(page),
      totalProducts: count
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Failed to get products' });
  }
};

export const getProduct = async (req: Request, res: Response) => {
  try {
    console.log("entro a buscar un solo producto");
    
    const { id } = req.params;
    const product = await Product.findByPk(id, {
      include: [{ model: Category, attributes: ['id', 'name'] }]
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ product });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Failed to get product' });
  }
};

export const createProduct = async (req: AuthRequest, res: Response) => {
  console.log("bodyyy",req);
  try {
    const { name, description, price, stock, categoryId, featured ,image} = req.body;
    
    const product = await Product.create({
      name,
      description,
      image,
      price: parseFloat(price),
      stock: parseInt(stock),
      categoryId: parseInt(categoryId),
      featured: featured === 'true'
    });

    const productWithCategory = await Product.findByPk(product.id, {
      include: [{ model: Category, attributes: ['id', 'name'] }]
    });

    res.status(201).json({
      message: 'Product created successfully',
      product: productWithCategory
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
};

export const updateProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, price, stock, categoryId, featured,image } = req.body;

    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    await product.update({
      name: name || product.name,
      image: image || product.image,
      description: description || product.description,
      price: price ? parseFloat(price) : product.price,
      stock: stock ? parseInt(stock) : product.stock,
      categoryId: categoryId ? parseInt(categoryId) : product.categoryId,
      featured: featured !== undefined ? featured === true : product.featured
    });

    const updatedProduct = await Product.findByPk(id, {
      include: [{ model: Category, attributes: ['id', 'name'] }]
    });

    res.json({
      message: 'Product updated successfully',
      product: updatedProduct
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
};

export const deleteProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    await product.destroy();
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
};
