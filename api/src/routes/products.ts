import { Router } from 'express';
import { 
  getProducts, 
  getProduct, 
  createProduct, 
  updateProduct, 
  deleteProduct 
} from '../controllers/productController';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

router.get('/', getProducts);
router.get('/:id', getProduct);
router.post('/', authenticateToken, requireAdmin, createProduct);
router.put('/:id', authenticateToken, requireAdmin, updateProduct);
router.delete('/:id', authenticateToken, requireAdmin, deleteProduct);

export { router as productRoutes };
