import { Router } from 'express';
import { getAllUsers, updateUserRole } from '../controllers/userController';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);
router.use(requireAdmin);

router.get('/', getAllUsers);
router.put('/:id/role', updateUserRole);

export { router as userRoutes };