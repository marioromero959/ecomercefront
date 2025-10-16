import { Component, Input, Output, EventEmitter, OnInit, signal, computed } from '@angular/core';
import { FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { 
  AndreaniService, 
  CalculoEnvioResponse,
  Sucursal,
  codigoPostalValidator 
} from '../../services/andreani.service';
import { NgIf, NgFor } from '@angular/common';

@Component({
  standalone: true,
  imports: [NgIf, NgFor, ReactiveFormsModule],
  selector: 'app-shipping-calculator',
  template: `<div class="shipping-calculator">
  <h4>📦 Calculá tu envío</h4>

  <!-- Input de código postal -->
  <div class="calculator-input">
    <input 
      type="text" 
      [formControl]="codigoPostalControl"
      placeholder="Ingresá tu código postal"
      class="form-control"
      maxlength="4"
      (keyup.enter)="calcularEnvio()"
    >
    <button 
      (click)="calcularEnvio()" 
      [disabled]="codigoPostalControl.invalid || cargando() || !items.length"
      class="btn btn-primary">
      {{ cargando() ? '⏳' : '🔍' }}
    </button>
  </div>

  <!-- Errores de validación -->
  <div *ngIf="codigoPostalControl.touched && codigoPostalControl.invalid" 
       class="error-message">
    <small>Ingresá un código postal válido (4 dígitos)</small>
  </div>

  <!-- Resultado de cotización -->
  <div *ngIf="cotizacion() && !cargando()" class="cotizacion-result">
    
    <!-- Método de envío -->
    <div class="metodo-envio">
      <label>
        <input type="radio" 
               name="metodoEnvio" 
               value="domicilio"
               [checked]="metodoEnvio() === 'domicilio'"
               (change)="cambiarMetodoEnvio('domicilio')">
        <span>🏠 Envío a domicilio</span>
      </label>
      
      <label>
        <input type="radio" 
               name="metodoEnvio" 
               value="sucursal"
               [checked]="metodoEnvio() === 'sucursal'"
               (change)="cambiarMetodoEnvio('sucursal')">
        <span>📍 Retiro en sucursal (20% OFF)</span>
      </label>
    </div>

    <!-- Info de envío a domicilio -->
    <div *ngIf="metodoEnvio() === 'domicilio'" class="shipping-info">
      <div class="info-row">
        <span class="label">Costo de envío:</span>
        <span class="value highlight">{{ costoFormateado() }}</span>
      </div>
      <div class="info-row">
        <span class="label">Llega:</span>
        <span class="value">{{ fechaEstimada() }}</span>
      </div>
      <div class="info-row">
        <span class="label">Plazo:</span>
        <span class="value">{{ cotizacion()?.plazoEntrega }} días hábiles</span>
      </div>
    </div>

    <!-- Lista de sucursales -->
    <div *ngIf="metodoEnvio() === 'sucursal' && mostrarSucursales()" class="sucursales-container">
      <h5>Seleccioná una sucursal:</h5>
      
      <div class="sucursales-list">
        <div *ngFor="let sucursal of sucursales()" 
             class="sucursal-card"
             [class.selected]="sucursalSeleccionada()?.id === sucursal.id"
             (click)="seleccionarSucursal(sucursal)">
          
          <div class="sucursal-header">
            <span class="sucursal-nombre">{{ sucursal.nombre }}</span>
            <span *ngIf="sucursalSeleccionada()?.id === sucursal.id" 
                  class="badge-selected">✓ Seleccionada</span>
          </div>
          
          <p class="sucursal-direccion">
            📍 {{ sucursal.direccion }}, {{ sucursal.localidad }}
          </p>
          
          <div class="sucursal-info">
            <small>🕒 {{ sucursal.horarios }}</small>
            <small *ngIf="sucursal.telefono">📞 {{ sucursal.telefono }}</small>
          </div>

          <div *ngIf="sucursalSeleccionada()?.id === sucursal.id" class="costo-sucursal">
            <strong>Costo: {{ costoFormateado() }}</strong>
            <small class="descuento">¡20% de descuento!</small>
          </div>
        </div>
      </div>

      <div *ngIf="!sucursales().length" class="no-sucursales">
        <p>No se encontraron sucursales cercanas</p>
        <button (click)="cambiarMetodoEnvio('domicilio')" class="btn-link">
          Usar envío a domicilio
        </button>
      </div>
    </div>

    <!-- Advertencia si es estimado -->
    <div *ngIf="cotizacion()?.warning" class="alert alert-warning">
      <small>⚠️ {{ cotizacion()?.warning }}</small>
    </div>

    <!-- Botón limpiar -->
    <button (click)="limpiar()" class="btn btn-link btn-sm">
      🗑️ Calcular otro código postal
    </button>
  </div>

  <!-- Loading -->
  <div *ngIf="cargando() && !cotizacion()" class="loading-state">
    <div class="spinner"></div>
    <p>Calculando envío...</p>
  </div>

  <!-- Estado inicial -->
  <div *ngIf="!cotizacion() && !cargando()" class="initial-state">
    <p>Ingresá tu código postal para conocer el costo y tiempo de entrega</p>
  </div>
</div>`,
  styles: [`
    
.shipping-calculator {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 12px;
  margin: 1rem 0;
}

.shipping-calculator h4 {
  margin: 0 0 1rem 0;
  color: #333;
}

.calculator-input {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.calculator-input input {
  flex: 1;
  padding: 0.75rem;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
}

.calculator-input button {
  padding: 0.75rem 1.5rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1.25rem;
}

.calculator-input button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.error-message {
  color: #dc3545;
  margin-bottom: 1rem;
}

.cotizacion-result {
  margin-top: 1rem;
}

.metodo-envio {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 8px;
}

.metodo-envio label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  transition: background 0.2s;
}

.metodo-envio label:hover {
  background: #f0f0f0;
}

.shipping-info {
  background: white;
  padding: 1rem;
  border-radius: 8px;
  margin-top: 1rem;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f0f0f0;
}

.info-row:last-child {
  border-bottom: none;
}

.value.highlight {
  color: #667eea;
  font-weight: bold;
  font-size: 1.25rem;
}

.sucursales-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;
}

.sucursal-card {
  background: white;
  padding: 1rem;
  border-radius: 8px;
  border: 2px solid #e0e0e0;
  cursor: pointer;
  transition: all 0.3s;
}

.sucursal-card:hover {
  border-color: #667eea;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.2);
}

.sucursal-card.selected {
  border-color: #667eea;
  background: #f8f9ff;
}

.sucursal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.sucursal-nombre {
  font-weight: bold;
  color: #333;
}

.badge-selected {
  background: #667eea;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
}

.sucursal-direccion {
  color: #666;
  margin: 0.5rem 0;
}

.sucursal-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-top: 0.5rem;
}

.sucursal-info small {
  color: #999;
}

.costo-sucursal {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.descuento {
  color: #28a745;
  font-weight: bold;
}

.loading-state {
  text-align: center;
  padding: 2rem;
}

.spinner {
  border: 3px solid #f3f3f3;
  border-top: 3px solid #667eea;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.initial-state {
  text-align: center;
  color: #666;
  padding: 1rem;
}
    `]

})
export class ShippingCalculatorComponent implements OnInit {
  @Input() items: any[] = []; // Items del carrito
  @Output() shippingCalculated = new EventEmitter<CalculoEnvioResponse>();
  @Output() sucursalSelected = new EventEmitter<Sucursal>();

  codigoPostalControl = new FormControl('', [
    Validators.required,
    codigoPostalValidator()
  ]);

  cotizacion = signal<CalculoEnvioResponse | null>(null);
  sucursales = signal<Sucursal[]>([]);
  cargando = signal<boolean>(false);
  mostrarSucursales = signal<boolean>(false);
  metodoEnvio = signal<'domicilio' | 'sucursal'>('domicilio');
  sucursalSeleccionada = signal<Sucursal | null>(null);

  // Computed values
  costoFormateado = computed(() => {
    if (!this.cotizacion()) return '$0';
    return this.andreaniService.formatearPrecio(this.cotizacion()!.costoEnvio);
  });

  fechaEstimada = computed(() => {
    if (!this.cotizacion()) return '';
    const fecha = this.andreaniService.calcularFechaEstimada(this.cotizacion()!.plazoEntrega);
    return this.andreaniService.formatearFecha(fecha);
  });

  constructor(private andreaniService: AndreaniService) {}

  ngOnInit() {
    // Auto-calcular si hay CP guardado
    const cpGuardado = localStorage.getItem('ultimoCP');
    if (cpGuardado) {
      this.codigoPostalControl.setValue(cpGuardado);
      this.calcularEnvio();
    }
  }

  /**
   * Calcula el costo de envío
   */
  async calcularEnvio() {
    if (this.codigoPostalControl.invalid || !this.items.length) {
      return;
    }

    const codigoPostal = this.codigoPostalControl.value || '';
    this.cargando.set(true);
    this.cotizacion.set(null);

    try {
      // Guardar CP para próxima vez
      localStorage.setItem('ultimoCP', codigoPostal);

      // Calcular envío
      const resultado = await this.andreaniService
        .calcularEnvioCarrito({
          items: this.items,
          codigoPostalDestino: codigoPostal
        })
        .toPromise() || null;

      // Emitir evento con la cotización
      if (resultado) {
        this.cotizacion.set(resultado);
        this.shippingCalculated.emit(resultado);
        
        // Si eligió sucursal, buscarlas
        if (this.metodoEnvio() === 'sucursal') {
          await this.buscarSucursales(codigoPostal);
        }
      } else {
        throw new Error('No se pudo obtener la cotización');
      }

    } catch (error) {
      console.error('Error al calcular envío:', error);
      this.cotizacion.set(null);
      alert('No se pudo calcular el envío. Intente nuevamente.');
    } finally {
      this.cargando.set(false);
    }
  }

  /**
   * Busca sucursales cercanas
   */
  async buscarSucursales(codigoPostal: string) {
    try {
      const resultado = await this.andreaniService
        .buscarSucursales(codigoPostal)
        .toPromise() || [];
      
      this.sucursales.set(resultado);
      this.mostrarSucursales.set(resultado.length > 0);
    } catch (error) {
      console.error('Error al buscar sucursales:', error);
    }
  }

  /**
   * Cambia el método de envío
   */
  cambiarMetodoEnvio(metodo: 'domicilio' | 'sucursal') {
    this.metodoEnvio.set(metodo);
    this.sucursalSeleccionada.set(null);

    if (metodo === 'sucursal' && this.codigoPostalControl.valid) {
      const cp = this.codigoPostalControl.value || '';
      this.buscarSucursales(cp);
    } else {
      this.mostrarSucursales.set(false);
    }
  }

  /**
   * Selecciona una sucursal
   */
  seleccionarSucursal(sucursal: Sucursal) {
    this.sucursalSeleccionada.set(sucursal);
    this.sucursalSelected.emit(sucursal);

    // Aplicar descuento por retiro en sucursal
    const cotizacionActual = this.cotizacion();
    if (cotizacionActual) {
      const nuevaCotizacion = {
        ...cotizacionActual,
        costoEnvio: Math.round(cotizacionActual.costoEnvio * 0.8) // 20% off
      };
      this.cotizacion.set(nuevaCotizacion);
    }
  }

  /**
   * Limpia la cotización
   */
  limpiar() {
    this.codigoPostalControl.reset();
    this.cotizacion.set(null);
    this.sucursales.set([]);
    this.mostrarSucursales.set(false);
    this.sucursalSeleccionada.set(null);
    localStorage.removeItem('ultimoCP');
  }
}