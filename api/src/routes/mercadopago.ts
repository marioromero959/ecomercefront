import { Router } from 'express';
import { comprarProductos } from '../controllers/mercadoPagoController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Ruta protegida por autenticación para crear preferencia de pago
router.post('/create-preference', authenticateToken, comprarProductos);

export default router;