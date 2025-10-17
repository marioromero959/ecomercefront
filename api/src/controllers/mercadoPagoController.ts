import { Request, Response } from 'express';
import { MercadoPagoConfig, Preference } from 'mercadopago';

const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN || '' });
const preference = new Preference(client);

// Types for MercadoPago
interface MercadoPagoPreference {
  items: Array<{
    title: string;
    description: string;
    unit_price: number;
    quantity: number;
  }>;
  back_urls: {
    success: string;
    failure: string;
    pending?: string;
  };
  payer: {
    name: string;
    email: string;
  };
  auto_return: string;
  binary_mode: boolean;
  notification_url?: string;
  external_reference: string;
}

// Interfaces for our data
interface DataClient {
  name: string;
  email: string;
}

interface Producto {
  nombre: string;
  precio: number;
  cantidad: number;
}

interface DataCompra {
  dataClient: DataClient;
  productos: Producto[];
}

/**
 * @swagger
 * /api/mercadopago/create-preference:
 *   post:
 *     summary: Create MercadoPago preference for purchase
 *     tags: [MercadoPago]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - dataClient
 *               - productos
 *             properties:
 *               dataClient:
 *                 $ref: '#/components/schemas/MercadoPagoClient'
 *               productos:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/MercadoPagoProduct'
 *     responses:
 *       200:
 *         description: Preference created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 preferenceId:
 *                   type: string
 *                   description: MercadoPago preference ID
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
export const comprarProductos = async (req: Request<{}, {}, DataCompra>, res: Response) => {
  const dataCompra = req.body;

  // Generate unique reference for this purchase
  const externalReference = `order_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;

  // Define preference structure with proper typing
  const preferenceData = {
    items: dataCompra.productos.map(producto => ({
      id: `prod_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title: producto.nombre,
      description: producto.nombre,
      unit_price: producto.precio,
      quantity: producto.cantidad,
      currency_id: 'ARS'
    })),
    back_urls: {
      success: "https://impacto-oficial.web.app/home",
      failure: "https://impacto-oficial.web.app/home",
      pending: "https://impacto-oficial.web.app/home",
    },
    payer: {
      name: dataCompra.dataClient.name,
      email: dataCompra.dataClient.email,
    },
    notification_url: process.env.MP_WEBHOOK_URL || 'https://tu-dominio.com/api/webhooks/mercadopago',
    external_reference: externalReference,
    auto_return: "approved",
    binary_mode: true
  };

  try {
    const result = await preference.create({ body: preferenceData });
    const preferenceId = result.id;
    
    return res.json({ preferenceId });
  } catch (error) {
    console.error('MercadoPago error:', error);
    return res.status(500).json({ error: 'Algo salió mal' });
  }
};