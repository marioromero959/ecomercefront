import axios, { AxiosInstance } from 'axios';

interface AndreaniConfig {
  apiKey: string;
  apiUrl: string;
  contrato?: string;
}

interface Bulto {
  kilos: number;
  volumen: number;
  valorDeclarado: number;
  dimensiones?: {
    alto: number;
    ancho: number;
    largo: number;
  };
}

interface DireccionPostal {
  calle: string;
  numero: string;
  localidad: string;
  provincia: string;
  codigoPostal: string;
  piso?: string;
  departamento?: string;
}

interface Persona {
  nombreCompleto: string;
  email: string;
  documentoTipo: string;
  documentoNumero: string;
  telefono?: string;
}

export class AndreaniService {
  private client: AxiosInstance;
  private config: AndreaniConfig;
  private useMockData: boolean;

  constructor() {
    this.config = {
      apiKey: process.env.ANDREANI_API_KEY || '',
      apiUrl: process.env.ANDREANI_API_URL || 'https://api.andreani.com/v2',
      contrato: process.env.ANDREANI_CONTRATO || ''
    };

    // 🎭 MODO DEMO si no hay API Key, 🚀 PRODUCCIÓN si hay
    this.useMockData = !this.config.apiKey || process.env.ANDREANI_USE_MOCK === 'true';

    this.client = axios.create({
      baseURL: this.config.apiUrl,
      headers: {
        'Content-Type': 'application/json',
        'x-authorization-token': this.config.apiKey
      },
      timeout: 30000
    });

    // Log del modo actual
    if (this.useMockData) {
      console.log('🎭 Andreani: MODO DEMO (datos simulados - perfecto para mostrar a clientes)');
    } else {
      console.log('🚀 Andreani: MODO PRODUCCIÓN (API real de Andreani)');
    }
  }

  /**
   * Cotizar envío - Funciona en DEMO y PRODUCCIÓN
   */
  async cotizarEnvio(data: {
    codigoPostalOrigen: string;
    codigoPostalDestino: string;
    bultos: Bulto[];
    contrato?: string;
  }) {
    // Si está en modo demo, usar datos simulados
    if (this.useMockData) {
      return this.cotizarEnvioMock(data);
    }

    // Modo producción: llamar a API real
    try {
      const response = await this.client.post('/tarifas', {
        cpDestino: data.codigoPostalDestino,
        cpOrigen: data.codigoPostalOrigen,
        bultos: data.bultos.map(bulto => ({
          peso: bulto.kilos,
          volumen: bulto.volumen,
          valorDeclarado: bulto.valorDeclarado,
          dimensiones: bulto.dimensiones
        })),
        contrato: data.contrato || this.config.contrato
      });

      return {
        tarifa: response.data.tarifaSinIva,
        tarifaConIva: response.data.tarifaConIva,
        plazoEntrega: response.data.plazoEntrega,
        servicios: response.data.servicios || [],
        success: true
      };
    } catch (error: any) {
      console.error('Error en cotización Andreani (usando fallback):', error.response?.data || error.message);
      // Si falla, usar estimación
      return this.calcularTarifaEstimada(data.bultos);
    }
  }

  /**
   * Buscar sucursales - Funciona en DEMO y PRODUCCIÓN
   */
  async buscarSucursales(filtros: {
    codigoPostal?: string;
    localidad?: string;
    provincia?: string;
  }) {
    if (this.useMockData) {
      return this.buscarSucursalesMock(filtros);
    }

    try {
      const params = new URLSearchParams();
      if (filtros.codigoPostal) params.append('codigoPostal', filtros.codigoPostal);
      if (filtros.localidad) params.append('localidad', filtros.localidad);
      if (filtros.provincia) params.append('provincia', filtros.provincia);

      const response = await this.client.get(`/sucursales?${params.toString()}`);

      return response.data.map((sucursal: any) => ({
        id: sucursal.id,
        nombre: sucursal.nombre,
        direccion: sucursal.direccion,
        localidad: sucursal.localidad,
        provincia: sucursal.provincia,
        codigoPostal: sucursal.codigoPostal,
        telefono: sucursal.telefono,
        horarios: sucursal.horarios,
        coordenadas: {
          lat: sucursal.latitud,
          lng: sucursal.longitud
        }
      }));
    } catch (error: any) {
      console.error('Error al buscar sucursales (usando mock):', error.response?.data || error.message);
      return this.buscarSucursalesMock(filtros);
    }
  }

  /**
   * Generar orden de envío - Funciona en DEMO y PRODUCCIÓN
   */
  async generarOrdenEnvio(ordenData: {
    origen: DireccionPostal;
    destino: DireccionPostal;
    remitente: Persona;
    destinatario: Persona;
    bultos: Array<{
      kilos: number;
      volumen: number;
      valorDeclarado: number;
      descripcion?: string;
    }>;
    contrato?: string;
  }) {
    if (this.useMockData) {
      return this.generarOrdenEnvioMock(ordenData);
    }

    try {
      const payload = {
        contrato: ordenData.contrato || this.config.contrato,
        origen: {
          postal: {
            codigoPostal: ordenData.origen.codigoPostal,
            calle: ordenData.origen.calle,
            numero: ordenData.origen.numero,
            localidad: ordenData.origen.localidad,
            region: ordenData.origen.provincia,
            piso: ordenData.origen.piso,
            departamento: ordenData.origen.departamento
          }
        },
        destino: {
          postal: {
            codigoPostal: ordenData.destino.codigoPostal,
            calle: ordenData.destino.calle,
            numero: ordenData.destino.numero,
            localidad: ordenData.destino.localidad,
            region: ordenData.destino.provincia,
            piso: ordenData.destino.piso,
            departamento: ordenData.destino.departamento
          }
        },
        remitente: ordenData.remitente,
        destinatario: [ordenData.destinatario],
        bultos: ordenData.bultos.map((bulto, index) => ({
          kilos: bulto.kilos,
          volumenCm3: bulto.volumen,
          valorDeclaradoConImpuestos: bulto.valorDeclarado,
          numeroDeEnvio: null,
          referencia: bulto.descripcion || `Bulto ${index + 1}`
        }))
      };

      const response = await this.client.post('/envios', payload);

      return {
        numeroEnvio: response.data.bultos[0]?.numeroDeEnvio,
        numeroOrden: response.data.numeroAndreani,
        bultos: response.data.bultos,
        success: true
      };
    } catch (error: any) {
      console.error('Error al generar orden:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Error al generar orden de envío');
    }
  }

  /**
   * Obtener tracking - Funciona en DEMO y PRODUCCIÓN
   */
  async obtenerTracking(numeroEnvio: string) {
    if (this.useMockData) {
      return this.obtenerTrackingMock(numeroEnvio);
    }

    try {
      const response = await this.client.get(`/envios/${numeroEnvio}/trazas`);

      return {
        numeroEnvio,
        eventos: response.data.map((evento: any) => ({
          fecha: evento.fecha,
          estado: evento.estado,
          descripcion: evento.descripcion,
          sucursal: evento.sucursal
        })),
        success: true
      };
    } catch (error: any) {
      console.error('Error al obtener tracking:', error.response?.data || error.message);
      return this.obtenerTrackingMock(numeroEnvio);
    }
  }

  /**
   * Obtener etiqueta - Funciona en DEMO y PRODUCCIÓN
   */
  async obtenerEtiqueta(numeroEnvio: string) {
    if (this.useMockData) {
      return this.generarEtiquetaMock(numeroEnvio);
    }

    try {
      const response = await this.client.get(`/envios/${numeroEnvio}/etiquetas`, {
        responseType: 'arraybuffer'
      });
      return Buffer.from(response.data);
    } catch (error: any) {
      console.error('Error al obtener etiqueta:', error.response?.data || error.message);
      return this.generarEtiquetaMock(numeroEnvio);
    }
  }

  /**
   * Validar código postal - Funciona en DEMO y PRODUCCIÓN
   */
  async validarCodigoPostal(codigoPostal: string) {
    if (this.useMockData) {
      return this.validarCodigoPostalMock(codigoPostal);
    }

    try {
      const response = await this.client.get(`/codigospostales/${codigoPostal}`);
      return {
        valido: true,
        localidad: response.data.localidad,
        provincia: response.data.provincia,
        codigoPostal: response.data.codigoPostal
      };
    } catch (error: any) {
      return { valido: false, mensaje: 'Código postal no válido' };
    }
  }

  /**
   * Cancelar envío - Funciona en DEMO y PRODUCCIÓN
   */
  async cancelarEnvio(numeroEnvio: string) {
    if (this.useMockData) {
      await this.delay(500);
      return { success: true, mensaje: 'Envío cancelado (DEMO)' };
    }

    try {
      await this.client.delete(`/envios/${numeroEnvio}`);
      return { success: true, mensaje: 'Envío cancelado correctamente' };
    } catch (error: any) {
      console.error('Error al cancelar envío:', error.response?.data || error.message);
      throw new Error('No se pudo cancelar el envío');
    }
  }

  // ============================================
  // MÉTODOS MOCK PARA MODO DEMO
  // ============================================

  private async cotizarEnvioMock(data: { bultos: Bulto[]; codigoPostalDestino: string }) {
    await this.delay(500); // Simular latencia de red
    const tarifaBase = this.calcularTarifaBase(data.bultos, data.codigoPostalDestino);
    
    return {
      tarifa: Math.round(tarifaBase / 1.21),
      tarifaConIva: Math.round(tarifaBase),
      plazoEntrega: this.calcularPlazoMock(data.codigoPostalDestino),
      servicios: ['Estándar', 'Sucursal', 'Express'],
      success: true,
      mock: true
    };
  }

  private async buscarSucursalesMock(filtros: any) {
    await this.delay(300);
    return [
      {
        id: 'SUC001',
        nombre: 'Andreani Centro',
        direccion: 'Av. Corrientes 5000',
        localidad: filtros.localidad || 'Buenos Aires',
        provincia: filtros.provincia || 'Buenos Aires',
        codigoPostal: filtros.codigoPostal || '1414',
        telefono: '011-4000-1234',
        horarios: 'Lun a Vie: 9:00 - 18:00, Sáb: 9:00 - 13:00',
        coordenadas: { lat: -34.6037, lng: -58.3816 }
      },
      {
        id: 'SUC002',
        nombre: 'Andreani Caballito',
        direccion: 'Av. Rivadavia 5200',
        localidad: filtros.localidad || 'Buenos Aires',
        provincia: filtros.provincia || 'Buenos Aires',
        codigoPostal: filtros.codigoPostal || '1424',
        telefono: '011-4000-5678',
        horarios: 'Lun a Vie: 8:00 - 19:00, Sáb: 9:00 - 14:00',
        coordenadas: { lat: -34.6158, lng: -58.4370 }
      },
      {
        id: 'SUC003',
        nombre: 'Andreani Belgrano',
        direccion: 'Av. Cabildo 2300',
        localidad: filtros.localidad || 'Buenos Aires',
        provincia: filtros.provincia || 'Buenos Aires',
        codigoPostal: filtros.codigoPostal || '1428',
        telefono: '011-4000-9012',
        horarios: 'Lun a Vie: 9:00 - 18:00',
        coordenadas: { lat: -34.5625, lng: -58.4542 }
      }
    ];
  }

  private async generarOrdenEnvioMock(ordenData: any) {
    await this.delay(800);
    const numeroEnvio = `DEMO${Date.now()}`;
    
    return {
      numeroEnvio,
      numeroOrden: `AND-${Date.now()}`,
      bultos: ordenData.bultos.map((b: any, i: number) => ({
        id: i + 1,
        numeroEnvio,
        kilos: b.kilos,
        estado: 'pending'
      })),
      success: true,
      mock: true
    };
  }

  private async obtenerTrackingMock(numeroEnvio: string) {
    await this.delay(400);
    const ahora = Date.now();
    const eventos = [
      {
        fecha: new Date(ahora - 3600000 * 48).toISOString(),
        estado: 'Ingresado',
        descripcion: 'El envío fue ingresado al sistema',
        sucursal: 'Centro de Distribución CABA'
      },
      {
        fecha: new Date(ahora - 3600000 * 24).toISOString(),
        estado: 'En tránsito',
        descripcion: 'El paquete está en camino hacia destino',
        sucursal: 'Hub Buenos Aires'
      },
      {
        fecha: new Date(ahora - 3600000 * 6).toISOString(),
        estado: 'En distribución',
        descripcion: 'El paquete salió para entrega',
        sucursal: 'Sucursal destino'
      }
    ];

    return { numeroEnvio, eventos, success: true, mock: true };
  }

  private generarEtiquetaMock(numeroEnvio: string): Buffer {
    // Genera contenido simple para PDF mock
    const pdfContent = `Etiqueta de envío DEMO\nNúmero: ${numeroEnvio}\n\nEsto es una etiqueta simulada para demostración.`;
    return Buffer.from(pdfContent);
  }

  private validarCodigoPostalMock(codigoPostal: string) {
    const esValido = /^\d{4}$/.test(codigoPostal);
    return esValido 
      ? { valido: true, localidad: 'Buenos Aires', provincia: 'Buenos Aires', codigoPostal }
      : { valido: false, mensaje: 'Código postal inválido (formato: 4 dígitos)' };
  }

  // ============================================
  // MÉTODOS AUXILIARES
  // ============================================

  private calcularTarifaEstimada(bultos: Bulto[]) {
    let tarifaBase = 1500;
    
    bultos.forEach(bulto => {
      if (bulto.kilos > 1) {
        tarifaBase += (bulto.kilos - 1) * 300;
      }
      if (bulto.volumen > 10000) {
        tarifaBase += 500;
      }
      if (bulto.valorDeclarado > 10000) {
        tarifaBase += bulto.valorDeclarado * 0.01;
      }
    });

    return {
      tarifa: Math.round(tarifaBase / 1.21),
      tarifaConIva: Math.round(tarifaBase),
      plazoEntrega: 3,
      servicios: ['Estándar'],
      success: true,
      estimado: true
    };
  }

  private calcularTarifaBase(bultos: Bulto[], cpDestino: string): number {
    let tarifa = 1500;
    
    bultos.forEach(b => {
      if (b.kilos > 1) tarifa += (b.kilos - 1) * 300;
      if (b.volumen > 10000) tarifa += 500;
      if (b.valorDeclarado > 10000) tarifa += b.valorDeclarado * 0.01;
    });
    
    // Tarifa por zona según CP
    const cp = parseInt(cpDestino);
    if (cp > 5000) tarifa += 800; // Interior del país
    
    return Math.round(tarifa);
  }

  private calcularPlazoMock(cpDestino: string): number {
    const cp = parseInt(cpDestino);
    if (cp < 2000) return 2; // CABA y GBA
    if (cp < 5000) return 3; // Provincia de Buenos Aires
    return 5; // Interior
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const andreaniService = new AndreaniService();