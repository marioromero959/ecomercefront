import { Router } from 'express';
import { 
  createOrder, 
  getOrders, 
  getOrder, 
  updateOrderStatus 
} from '../controllers/orderController';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.get('/', getOrders);
router.get('/:id', getOrder);
router.post('/', createOrder);
router.put('/:id/status', requireAdmin, updateOrderStatus);

export { router as orderRoutes };
