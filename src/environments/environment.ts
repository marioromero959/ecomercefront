import { Environment } from '../app/models/environment.interface';

export const environment: Environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  mercadoPagoPublicKey: 'TU_CLAVE_PUBLICA_DE_MERCADO_PAGO_AQUI'
};