import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

// ============================================
// INTERFACES
// ============================================

export interface AndreaniAddress {
  calle: string;
  numero: string;
  localidad: string;
  provincia: string;
  codigoPostal: string;
  piso?: string;
  departamento?: string;
}

export interface AndreaniPackage {
  kilos: number;
  volumen: number;
  valorDeclarado: number;
  dimensiones?: {
    alto: number;
    ancho: number;
    largo: number;
  };
  descripcion?: string;
}

export interface AndreaniPerson {
  nombreCompleto: string;
  email: string;
  documentoTipo: 'DNI' | 'CUIT' | 'CUIL' | 'PASAPORTE';
  documentoNumero: string;
  telefono?: string;
}

export interface CotizacionRequest {
  codigoPostalOrigen: string;
  codigoPostalDestino: string;
  bultos: AndreaniPackage[];
  contrato?: string;
}

export interface CotizacionResponse {
  tarifa: number;
  tarifaConIva: number;
  plazoEntrega: number;
  servicios: string[];
  success: boolean;
  mock?: boolean;
  estimado?: boolean;
}

export interface Sucursal {
  id: string;
  nombre: string;
  direccion: string;
  localidad: string;
  provincia: string;
  codigoPostal: string;
  telefono?: string;
  horarios?: string;
  coordenadas: {
    lat: number;
    lng: number;
  };
}

export interface OrdenEnvioRequest {
  origen: AndreaniAddress;
  destino: AndreaniAddress;
  remitente: AndreaniPerson;
  destinatario: AndreaniPerson;
  bultos: AndreaniPackage[];
  contrato?: string;
}

export interface OrdenEnvioResponse {
  numeroEnvio: string;
  numeroOrden: string;
  bultos: any[];
  success: boolean;
  mock?: boolean;
}

export interface TrackingEvento {
  fecha: string;
  estado: string;
  descripcion: string;
  sucursal?: string;
}

export interface TrackingResponse {
  numeroEnvio: string;
  eventos: TrackingEvento[];
  success: boolean;
  mock?: boolean;
}

export interface ValidacionCP {
  valido: boolean;
  localidad?: string;
  provincia?: string;
  codigoPostal?: string;
  mensaje?: string;
}

export interface CalculoEnvioCarrito {
  items: Array<{
    product_id: number;
    name?: string;
    quantity: number;
    price: number;
    weight: number;
    dimensions?: string;
  }>;
  codigoPostalDestino: string;
}

export interface CalculoEnvioResponse {
  costoEnvio: number;
  plazoEntrega: number;
  servicios: string[];
  warning?: string;
}

// ============================================
// SERVICIO ANGULAR
// ============================================

@Injectable({
  providedIn: 'root'
})
export class AndreaniService {
  private apiUrl = environment.apiUrl || 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  /**
   * Obtiene headers con token de autenticación si existe
   */
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    
    return headers;
  }

  // ============================================
  // MÉTODOS PÚBLICOS (sin autenticación)
  // ============================================

  /**
   * Cotizar envío
   * Calcula el costo y plazo de entrega
   */
  cotizarEnvio(request: CotizacionRequest): Observable<CotizacionResponse> {
    return this.http.post<CotizacionResponse>(
      `${this.apiUrl}/andreani/cotizar`,
      request
    );
  }

  /**
   * Buscar sucursales de Andreani
   * @param codigoPostal - Código postal para filtrar (opcional)
   * @param localidad - Localidad para filtrar (opcional)
   * @param provincia - Provincia para filtrar (opcional)
   */
  buscarSucursales(
    codigoPostal?: string,
    localidad?: string,
    provincia?: string
  ): Observable<Sucursal[]> {
    let params = '';
    if (codigoPostal) params += `codigoPostal=${codigoPostal}`;
    if (localidad) params += `${params ? '&' : ''}localidad=${localidad}`;
    if (provincia) params += `${params ? '&' : ''}provincia=${provincia}`;

    const url = `${this.apiUrl}/andreani/sucursales${params ? '?' + params : ''}`;
    return this.http.get<Sucursal[]>(url);
  }

  /**
   * Calcular costo de envío para el carrito de compras
   * Usa los items del carrito y el CP destino
   */
  calcularEnvioCarrito(request: CalculoEnvioCarrito): Observable<CalculoEnvioResponse> {
    return this.http.post<CalculoEnvioResponse>(
      `${this.apiUrl}/andreani/calcular-envio`,
      request
    );
  }

  /**
   * Validar código postal argentino
   * @param codigoPostal - Código postal a validar
   */
  validarCodigoPostal(codigoPostal: string): Observable<ValidacionCP> {
    return this.http.get<ValidacionCP>(
      `${this.apiUrl}/andreani/validar-cp?codigoPostal=${codigoPostal}`
    );
  }

  // ============================================
  // MÉTODOS PRIVADOS (requieren autenticación)
  // ============================================

  /**
   * Generar orden de envío en Andreani
   * Requiere autenticación
   */
  generarOrdenEnvio(request: OrdenEnvioRequest): Observable<OrdenEnvioResponse> {
    return this.http.post<OrdenEnvioResponse>(
      `${this.apiUrl}/andreani/generar-envio`,
      request,
      { headers: this.getHeaders() }
    );
  }

  /**
   * Obtener tracking de un envío
   * @param numeroEnvio - Número de envío de Andreani
   */
  obtenerTracking(numeroEnvio: string): Observable<TrackingResponse> {
    return this.http.get<TrackingResponse>(
      `${this.apiUrl}/andreani/tracking/${numeroEnvio}`,
      { headers: this.getHeaders() }
    );
  }

  /**
   * Descargar etiqueta de envío en PDF
   * @param numeroEnvio - Número de envío de Andreani
   */
  descargarEtiqueta(numeroEnvio: string): Observable<Blob> {
    return this.http.get(
      `${this.apiUrl}/andreani/etiqueta/${numeroEnvio}`,
      {
        headers: this.getHeaders(),
        responseType: 'blob'
      }
    );
  }

  /**
   * Cancelar envío
   * @param numeroEnvio - Número de envío a cancelar
   */
  cancelarEnvio(numeroEnvio: string): Observable<{ success: boolean; mensaje: string }> {
    return this.http.delete<{ success: boolean; mensaje: string }>(
      `${this.apiUrl}/andreani/cancelar/${numeroEnvio}`,
      { headers: this.getHeaders() }
    );
  }

  // ============================================
  // MÉTODOS AUXILIARES
  // ============================================

  /**
   * Formatea un número de precio para mostrar
   * @param precio - Precio a formatear
   */
  formatearPrecio(precio: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(precio);
  }

  /**
   * Calcula el plazo de entrega en días laborables
   * @param dias - Cantidad de días
   */
  calcularFechaEstimada(dias: number): Date {
    const fecha = new Date();
    let diasAgregados = 0;
    
    while (diasAgregados < dias) {
      fecha.setDate(fecha.getDate() + 1);
      // Saltar sábados (6) y domingos (0)
      if (fecha.getDay() !== 0 && fecha.getDay() !== 6) {
        diasAgregados++;
      }
    }
    
    return fecha;
  }

  /**
   * Formatea fecha para mostrar
   * @param fecha - Fecha a formatear
   */
  formatearFecha(fecha: Date | string): string {
    const date = typeof fecha === 'string' ? new Date(fecha) : fecha;
    return new Intl.DateTimeFormat('es-AR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }).format(date);
  }

  /**
   * Valida formato de código postal argentino
   * @param cp - Código postal a validar
   */
  validarFormatoCP(cp: string): boolean {
    // Formato: 4 dígitos o letra + 4 dígitos
    return /^[A-Z]?\d{4}$/.test(cp.toUpperCase());
  }

  /**
   * Calcula peso y volumen total de items
   * @param items - Items del carrito
   */
  calcularTotales(items: Array<{ quantity: number; weight: number; dimensions?: string }>) {
    let pesoTotal = 0;
    let volumenTotal = 0;

    items.forEach(item => {
      pesoTotal += item.weight * item.quantity;

      if (item.dimensions) {
        const [largo, ancho, alto] = item.dimensions
          .split('x')
          .map(d => parseFloat(d.trim()));
        const volumen = largo * ancho * alto;
        volumenTotal += volumen * item.quantity;
      }
    });

    return { pesoTotal, volumenTotal };
  }

  /**
   * Obtiene el estado del tracking en español
   * @param estado - Estado del envío
   */
  obtenerEstadoTraducido(estado: string): { texto: string; color: string; icono: string } {
    const estados: { [key: string]: { texto: string; color: string; icono: string } } = {
      'Ingresado': { texto: 'Ingresado al sistema', color: 'info', icono: '📝' },
      'En tránsito': { texto: 'En camino', color: 'primary', icono: '🚚' },
      'En distribución': { texto: 'Salió para entrega', color: 'warning', icono: '📦' },
      'Entregado': { texto: 'Entregado', color: 'success', icono: '✅' },
      'Cancelado': { texto: 'Cancelado', color: 'danger', icono: '❌' },
      'Retenido': { texto: 'Retenido en sucursal', color: 'warning', icono: '⏸️' }
    };

    return estados[estado] || { texto: estado, color: 'secondary', icono: '❓' };
  }
}

// ============================================
// GUARDS Y VALIDADORES (opcional)
// ============================================

/**
 * Validador personalizado para formularios reactivos
 * Valida formato de código postal argentino
 */
export function codigoPostalValidator() {
  return (control: any) => {
    if (!control.value) return null;
    
    const valido = /^[A-Z]?\d{4}$/.test(control.value.toUpperCase());
    return valido ? null : { codigoPostalInvalido: true };
  };
}

/**
 * Validador de peso mínimo
 */
export function pesoMinimoValidator(pesoMinimo: number) {
  return (control: any) => {
    if (!control.value) return null;
    
    const peso = parseFloat(control.value);
    return peso >= pesoMinimo ? null : { pesoMinimo: { requiredPeso: pesoMinimo, actualPeso: peso } };
  };
}