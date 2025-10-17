import { Request, Response } from 'express';
import { andreaniService } from '../services/andreaniService';

export class AndreaniController {
  /**
   * Cotizar envío
   */
  async cotizarEnvio(req: Request, res: Response) {
    try {
      const { 
        codigoPostalOrigen, 
        codigoPostalDestino, 
        bultos,
        contrato 
      } = req.body;

      // Validar datos requeridos
      if (!codigoPostalOrigen || !codigoPostalDestino || !bultos) {
        return res.status(400).json({ 
          message: 'Faltan datos requeridos: codigoPostalOrigen, codigoPostalDestino, bultos' 
        });
      }

      const cotizacion = await andreaniService.cotizarEnvio({
        codigoPostalOrigen,
        codigoPostalDestino,
        bultos,
        contrato: contrato || process.env.ANDREANI_CONTRATO
      });

      res.json(cotizacion);
    } catch (error: any) {
      console.error('Error al cotizar envío:', error);
      res.status(500).json({ 
        message: 'Error al cotizar envío',
        error: error.message 
      });
    }
  }

  /**
   * Buscar sucursales cercanas
   */
  async buscarSucursales(req: Request, res: Response) {
    try {
      const { codigoPostal, localidad, provincia } = req.query;

      if (!codigoPostal) {
        return res.status(400).json({ 
          message: 'El código postal es requerido' 
        });
      }

      const sucursales = await andreaniService.buscarSucursales({
        codigoPostal: codigoPostal as string,
        localidad: localidad as string,
        provincia: provincia as string
      });

      res.json(sucursales);
    } catch (error: any) {
      console.error('Error al buscar sucursales:', error);
      res.status(500).json({ 
        message: 'Error al buscar sucursales',
        error: error.message 
      });
    }
  }

  /**
   * Generar orden de envío
   */
  async generarOrdenEnvio(req: Request, res: Response) {
    try {
      const ordenData = req.body;

      // Validar datos mínimos
      if (!ordenData.destino || !ordenData.bultos || !ordenData.remitente) {
        return res.status(400).json({ 
          message: 'Faltan datos requeridos para la orden' 
        });
      }

      const ordenEnvio = await andreaniService.generarOrdenEnvio(ordenData);

      res.status(201).json(ordenEnvio);
    } catch (error: any) {
      console.error('Error al generar orden de envío:', error);
      res.status(500).json({ 
        message: 'Error al generar orden de envío',
        error: error.message 
      });
    }
  }

  /**
   * Obtener tracking de envío
   */
  async obtenerTracking(req: Request, res: Response) {
    try {
      const { numeroEnvio } = req.params;

      if (!numeroEnvio) {
        return res.status(400).json({ 
          message: 'El número de envío es requerido' 
        });
      }

      const tracking = await andreaniService.obtenerTracking(numeroEnvio);

      res.json(tracking);
    } catch (error: any) {
      console.error('Error al obtener tracking:', error);
      res.status(500).json({ 
        message: 'Error al obtener tracking',
        error: error.message 
      });
    }
  }

  /**
   * Obtener etiqueta de envío
   */
  async obtenerEtiqueta(req: Request, res: Response) {
    try {
      const { numeroEnvio } = req.params;

      if (!numeroEnvio) {
        return res.status(400).json({ 
          message: 'El número de envío es requerido' 
        });
      }

      const etiqueta = await andreaniService.obtenerEtiqueta(numeroEnvio);

      // Enviar el PDF como respuesta
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=etiqueta-${numeroEnvio}.pdf`);
      res.send(etiqueta);
    } catch (error: any) {
      console.error('Error al obtener etiqueta:', error);
      res.status(500).json({ 
        message: 'Error al obtener etiqueta',
        error: error.message 
      });
    }
  }

  /**
   * Calcular costo de envío simple (para el carrito)
   */
  async calcularCostoEnvio(req: Request, res: Response) {
    try {
      const { items, codigoPostalDestino } = req.body;

      if (!items || !codigoPostalDestino) {
        return res.status(400).json({ 
          message: 'Items y código postal destino son requeridos' 
        });
      }

      // Calcular peso y volumen total
      let pesoTotal = 0;
      let volumenTotal = 0;
      let valorTotal = 0;

      items.forEach((item: any) => {
        pesoTotal += (item.weight || 0) * item.quantity;
        
        // Calcular volumen si hay dimensiones
        if (item.dimensions) {
          const dims = item.dimensions.split('x').map((d: string) => parseFloat(d));
          const volumen = dims[0] * dims[1] * dims[2];
          volumenTotal += volumen * item.quantity;
        }
        
        valorTotal += item.price * item.quantity;
      });

      const cotizacion = await andreaniService.cotizarEnvio({
        codigoPostalOrigen: process.env.CODIGO_POSTAL_ORIGEN || '1043',
        codigoPostalDestino,
        bultos: [{
          kilos: pesoTotal,
          volumen: volumenTotal || 1000, // Volumen por defecto si no hay dimensiones
          valorDeclarado: valorTotal
        }],
        contrato: process.env.ANDREANI_CONTRATO
      });

      res.json({
        costoEnvio: cotizacion.tarifaConIva || cotizacion.tarifa || 0,
        plazoEntrega: cotizacion.plazoEntrega || 3,
        servicios: cotizacion.servicios || []
      });
    } catch (error: any) {
      console.error('Error al calcular costo de envío:', error);
      
      // Devolver costo estimado en caso de error
      res.json({
        costoEnvio: 1500, // Costo base de fallback
        plazoEntrega: 3,
        servicios: [],
        warning: 'Costo estimado, no se pudo conectar con Andreani'
      });
    }
  }

  /**
   * Validar código postal
   */
  async validarCodigoPostal(req: Request, res: Response) {
    try {
      const { codigoPostal } = req.query;

      if (!codigoPostal) {
        return res.status(400).json({ 
          message: 'El código postal es requerido' 
        });
      }

      const resultado = await andreaniService.validarCodigoPostal(codigoPostal as string);

      res.json(resultado);
    } catch (error: any) {
      console.error('Error al validar código postal:', error);
      res.status(500).json({ 
        message: 'Error al validar código postal',
        error: error.message 
      });
    }
  }

  /**
   * Cancelar envío
   */
  async cancelarEnvio(req: Request, res: Response) {
    try {
      const { numeroEnvio } = req.params;

      if (!numeroEnvio) {
        return res.status(400).json({ 
          message: 'El número de envío es requerido' 
        });
      }

      const resultado = await andreaniService.cancelarEnvio(numeroEnvio);

      res.json(resultado);
    } catch (error: any) {
      console.error('Error al cancelar envío:', error);
      res.status(500).json({ 
        message: 'Error al cancelar envío',
        error: error.message 
      });
    }
  }
}

export const andreaniController = new AndreaniController();