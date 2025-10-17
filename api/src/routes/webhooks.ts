import { Router } from 'express';
import { handleMPWebhook } from '../controllers/webhookController';

const router = Router();

router.post('/mercadopago', handleMPWebhook);

export default router;