import { Router } from 'express';
import { 
  getProducts, 
  getProduct, 
  createProduct, 
  updateProduct, 
  deleteProduct 
} from '../controllers/productController';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { uploadImages, processImages } from '../middleware/uploadImage';

const router = Router();

router.get('/', getProducts);
router.get('/:id', getProduct);
router.post('/', authenticateToken, requireAdmin, uploadImages, processImages, createProduct);
router.put('/:id', authenticateToken, requireAdmin, uploadImages, processImages, updateProduct);
router.delete('/:id', authenticateToken, requireAdmin, deleteProduct);

export { router as productRoutes };
