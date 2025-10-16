import { Component, OnInit, computed, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { 
  AndreaniService, 
  TrackingResponse,
  TrackingEvento 
} from '../../services/andreani.service';
import { NgClass, NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  imports: [NgClass, NgIf, NgFor, FormsModule],
  selector: 'app-tracking',
  template: `  
  <div class="tracking-container">
  <h2>Seguimiento de Envío</h2>

  <!-- Formulario de búsqueda -->
  <div class="search-box">
    <input 
      type="text" 
      [ngModel]="numeroEnvio()" 
      (ngModelChange)="numeroEnvio.set($event)"
      placeholder="Ingrese número de envío"
      class="form-control"
      (keyup.enter)="buscarTracking()"
    >
    <button 
      (click)="buscarTracking()" 
      [disabled]="cargando()"
      class="btn btn-primary">
      {{ cargando() ? 'Buscando...' : 'Buscar' }}
    </button>
  </div>

  <!-- Error -->
  <div *ngIf="error()" class="alert alert-danger">
    {{ error() }}
  </div>

  <!-- Loading -->
  <div *ngIf="cargando()" class="loading">
    <div class="spinner"></div>
    <p>Obteniendo información del envío...</p>
  </div>

  <!-- Tracking Info -->
  <div *ngIf="tracking() && !cargando()" class="tracking-info">
    
    <!-- Header con estado actual -->
    <div class="tracking-header" [ngClass]="getEstadoInfo(estadoActual()?.estado || '').color">
      <div class="estado-icon">
        {{ getEstadoInfo(estadoActual()?.estado || '').icono }}
      </div>
      <div class="estado-info">
        <h3>{{ getEstadoInfo(estadoActual()?.estado || '').texto }}</h3>
        <p>Envío N° {{ tracking()?.numeroEnvio }}</p>
        <p *ngIf="tracking()?.mock" class="badge-demo">DEMO</p>
      </div>
      <button (click)="refrescar()" class="btn-refresh">
        🔄 Actualizar
      </button>
    </div>

    <!-- Barra de progreso -->
    <div class="progress-container">
      <div class="progress-bar">
        <div class="progress-fill" [style.width.%]="progreso()"></div>
      </div>
      <div class="progress-labels">
        <span [class.active]="progreso() >= 25">Ingresado</span>
        <span [class.active]="progreso() >= 50">En tránsito</span>
        <span [class.active]="progreso() >= 75">En distribución</span>
        <span [class.active]="progreso() === 100">Entregado</span>
      </div>
    </div>

    <!-- Timeline de eventos -->
    <div class="timeline">
      <h4>Historial del envío</h4>
      
      <div *ngFor="let evento of tracking()?.eventos; let i = index" 
           class="timeline-item"
           [class.active]="i === (tracking()?.eventos?.length ?? 0) - 1">
        
        <div class="timeline-marker">
          <span class="marker-icon">
            {{ getEstadoInfo(evento.estado).icono }}
          </span>
        </div>

        <div class="timeline-content">
          <div class="timeline-header">
            <span class="estado-badge" [ngClass]="getEstadoInfo(evento.estado).color">
              {{ evento.estado }}
            </span>
            <span class="fecha">
              {{ formatearFecha(evento.fecha) }} - {{ formatearHora(evento.fecha) }}
            </span>
          </div>
          
          <p class="descripcion">{{ evento.descripcion }}</p>
          
          <p *ngIf="evento.sucursal" class="sucursal">
            📍 {{ evento.sucursal }}
          </p>
        </div>
      </div>
    </div>

    <!-- Mensaje de entrega exitosa -->
    <div *ngIf="isEntregado()" class="alert alert-success">
      <h4>✅ ¡Envío entregado con éxito!</h4>
      <p>Gracias por tu compra</p>
    </div>
  </div>
</div>`,
  styles: [`
    .tracking-container {
  max-width: 800px;
  margin: 2rem auto;
  padding: 2rem;
}

.search-box {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.search-box input {
  flex: 1;
  padding: 0.75rem;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
}

.tracking-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.estado-icon {
  font-size: 3rem;
}

.estado-info h3 {
  margin: 0;
  font-size: 1.5rem;
}

.badge-demo {
  background: #ff6b6b;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  display: inline-block;
  margin-top: 0.5rem;
}

.progress-container {
  margin-bottom: 3rem;
}

.progress-bar {
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 1rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  transition: width 0.5s ease;
}

.progress-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  color: #666;
}

.progress-labels span.active {
  color: #667eea;
  font-weight: bold;
}

.timeline {
  position: relative;
  padding-left: 3rem;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 1rem;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #e0e0e0;
}

.timeline-item {
  position: relative;
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #f0f0f0;
}

.timeline-item.active .timeline-content {
  background: #f8f9ff;
  border-left: 3px solid #667eea;
}

.timeline-marker {
  position: absolute;
  left: -2.5rem;
  top: 0;
  width: 2.5rem;
  height: 2.5rem;
  background: white;
  border: 2px solid #667eea;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

.timeline-content {
  background: white;
  padding: 1rem;
  border-radius: 8px;
  border-left: 3px solid transparent;
  transition: all 0.3s;
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.estado-badge {
  background: #e0e0e0;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 500;
}

.estado-badge.success {
  background: #d4edda;
  color: #155724;
}

.estado-badge.primary {
  background: #cce5ff;
  color: #004085;
}

.estado-badge.warning {
  background: #fff3cd;
  color: #856404;
}

.fecha {
  color: #666;
  font-size: 0.875rem;
}

.descripcion {
  margin: 0.5rem 0;
  color: #333;
}

.sucursal {
  color: #666;
  font-size: 0.875rem;
  margin: 0;
}`],
})
export class TrackingComponent implements OnInit {
  numeroEnvio = signal<string>('');
  tracking = signal<TrackingResponse | null>(null);
  cargando = signal<boolean>(false);
  error = signal<string>('');

  // Computed values
  estadoActual = computed(() => {
    const trackingData = this.tracking();
    if (!trackingData || trackingData.eventos.length === 0) {
      return null;
    }
    return trackingData.eventos[trackingData.eventos.length - 1];
  });

  progreso = computed(() => {
    const estado = this.estadoActual();
    if (!estado) return 0;

    const estados: { [key: string]: number } = {
      'Ingresado': 25,
      'En tránsito': 50,
      'En distribución': 75,
      'Entregado': 100,
      'Retenido': 60,
      'Cancelado': 0
    };

    return estados[estado.estado] || 0;
  });

  isEntregado = computed(() => {
    const estado = this.estadoActual();
    return estado?.estado === 'Entregado';
  });

  constructor(
    private route: ActivatedRoute,
    private andreaniService: AndreaniService
  ) {}

  ngOnInit() {
    // Obtener número de envío desde la URL o formulario
    this.route.params.subscribe(params => {
      if (params['numeroEnvio']) {
        this.numeroEnvio.set(params['numeroEnvio']);
        this.buscarTracking();
      }
    });
  }

  /**
   * Busca el tracking del envío
   */
  async buscarTracking() {
    if (!this.numeroEnvio()) {
      this.error.set('Por favor ingrese un número de envío');
      return;
    }

    this.cargando.set(true);
    this.error.set('');
    this.tracking.set(null);

    try {
      const trackingResult = await this.andreaniService
        .obtenerTracking(this.numeroEnvio())
        .toPromise() || null;

      this.tracking.set(trackingResult);

      if (!trackingResult || trackingResult.eventos.length === 0) {
        this.error.set('No se encontró información para este envío');
      }
    } catch (error) {
      console.error('Error al obtener tracking:', error);
      this.error.set('No se pudo obtener información del envío. Verifique el número ingresado.');
    } finally {
      this.cargando.set(false);
    }
  }

  /**
   * Obtiene el estado traducido con color e icono
   */
  getEstadoInfo(estado: string) {
    return this.andreaniService.obtenerEstadoTraducido(estado);
  }

  /**
   * Formatea fecha para mostrar
   */
  formatearFecha(fecha: string): string {
    return this.andreaniService.formatearFecha(new Date(fecha));
  }

  /**
   * Formatea hora
   */
  formatearHora(fecha: string): string {
    const date = new Date(fecha);
    return date.toLocaleTimeString('es-AR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  /**
   * Actualiza el tracking (refrescar)
   */
  refrescar() {
    this.buscarTracking();
  }
}