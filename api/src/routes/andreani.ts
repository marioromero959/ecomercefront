import { Router } from 'express';
import { andreaniController } from '../controllers/AndreaniController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

/**
 * @route   POST /api/andreani/cotizar
 * @desc    Cotizar envío
 * @access  Public (o Private según prefieras)
 */
router.post('/cotizar', andreaniController.cotizarEnvio);

/**
 * @route   GET /api/andreani/sucursales
 * @desc    Buscar sucursales de Andreani
 * @access  Public
 */
router.get('/sucursales', andreaniController.buscarSucursales);

/**
 * @route   POST /api/andreani/calcular-envio
 * @desc    Calcular costo de envío para el carrito
 * @access  Public
 */
router.post('/calcular-envio', andreaniController.calcularCostoEnvio);

/**
 * @route   GET /api/andreani/validar-cp
 * @desc    Validar código postal
 * @access  Public
 */
router.get('/validar-cp', andreaniController.validarCodigoPostal);

// Rutas protegidas (requieren autenticación)

/**
 * @route   POST /api/andreani/generar-envio
 * @desc    Generar orden de envío
 * @access  Private
 */
router.post('/generar-envio', authenticateToken, andreaniController.generarOrdenEnvio);

/**
 * @route   GET /api/andreani/tracking/:numeroEnvio
 * @desc    Obtener tracking de envío
 * @access  Private
 */
router.get('/tracking/:numeroEnvio', authenticateToken, andreaniController.obtenerTracking);

/**
 * @route   GET /api/andreani/etiqueta/:numeroEnvio
 * @desc    Obtener etiqueta de envío
 * @access  Private
 */
router.get('/etiqueta/:numeroEnvio', authenticateToken, andreaniController.obtenerEtiqueta);

/**
 * @route   DELETE /api/andreani/cancelar/:numeroEnvio
 * @desc    Cancelar envío
 * @access  Private (Admin)
 */
router.delete('/cancelar/:numeroEnvio', authenticateToken, andreaniController.cancelarEnvio);

export default router;