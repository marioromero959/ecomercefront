import { Router } from 'express';
import { 
  getCategories, 
  createCategory, 
  updateCategory, 
  deleteCategory 
} from '../controllers/categoryController';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { uploadImages, processImages } from '../middleware/uploadImage';

const router = Router();

router.get('/', getCategories);
router.post('/', authenticateToken, requireAdmin, uploadImages, processImages, createCategory);
router.put('/:id', authenticateToken, requireAdmin, uploadImages, processImages, updateCategory);
router.delete('/:id', authenticateToken, requireAdmin, deleteCategory);

export { router as categoryRoutes };
