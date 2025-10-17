import { Request, Response } from 'express';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { getIO } from '../config/socket';

const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN || '' });
const payment = new Payment(client);

interface MercadoPagoNotification {
  action: string;
  api_version: string;
  data: {
    id: string;
  };
  date_created: string;
  id: number;
  live_mode: boolean;
  type: string;
  user_id: string;
}

/**
 * @swagger
 * /webhooks/mercadopago:
 *   post:
 *     summary: Handle MercadoPago payment notifications
 *     description: |
 *       Webhook endpoint that receives payment notifications from MercadoPago.
 *       Processes payment status changes and emits WebSocket events for approved payments.
 *     tags: [Webhooks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MercadoPagoNotification'
 *     responses:
 *       200:
 *         description: Successfully processed webhook notification
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 received:
 *                   type: boolean
 *                   example: true
 *       500:
 *         description: Server error while processing webhook
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error processing webhook"
 */
export const handleMPWebhook = async (req: Request, res: Response) => {
  try {
    const notification = req.body as MercadoPagoNotification;

    if (notification.type === 'payment') {
      const paymentId = notification.data.id;
      const paymentInfo = await payment.get({ id: Number(paymentId) });
      
      if (paymentInfo.status === 'approved') {
        // Emitir evento a través de WebSocket
        const io = getIO();
        io.emit('paymentApproved', {
          orderId: paymentInfo.external_reference,
          status: paymentInfo.status,
          paymentId: paymentInfo.id,
          paymentMethod: paymentInfo.payment_method_id,
          paymentType: paymentInfo.payment_type_id,
          amount: paymentInfo.transaction_amount
        });
      }
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Error processing webhook' });
  }
};