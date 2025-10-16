import { Component, Inject, signal, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ShippingCalculatorComponent } from './shipping-calculator.component';
import { CalculoEnvioResponse, Sucursal } from '../../services/andreani.service';

interface CheckoutData {
  cartItems: any[];
  total: number;
}

declare const MercadoPago: any;

@Component({
  selector: 'app-checkout-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule,
    ShippingCalculatorComponent
  ],
  template: `
    <h2 mat-dialog-title>Finalizar Compra</h2>
    
    <mat-dialog-content>
      <form [formGroup]="checkoutForm">
        <!-- Cálculo de envío -->
        <div class="shipping-section">
          <h3>Envío</h3>
          <app-shipping-calculator
            [items]="data.cartItems"
            (shippingCalculated)="onShippingCalculated($event)"
            (sucursalSelected)="onSucursalSelected($event)">
          </app-shipping-calculator>
        </div>

        <!-- Dirección de envío -->
        @if(metodoEnvio() === 'domicilio'){
          <mat-form-field class="full-width">
            <mat-label>Dirección de Envío</mat-label>
            <textarea matInput rows="4" formControlName="shippingAddress" required></textarea>
            @if(checkoutForm.get('shippingAddress')?.hasError('required')){
              <mat-error>
                La dirección de envío es requerida
              </mat-error>
            }
          </mat-form-field>
        }
        
        <!-- Resumen del pedido -->
        <div class="order-summary">
          <h3>Resumen del Pedido</h3>
          @for(item of data.cartItems; track item.id){
            <div class="summary-item">
              <span>{{item.Product.name}} x {{item.quantity}}</span>
              <span>\${{(item.quantity * item.Product.price).toFixed(2)}}</span>
            </div>
          }
          
          <mat-divider></mat-divider>
          
          <!-- Subtotal y envío -->
          <div class="summary-subtotal">
            <div class="summary-item">
              <span>Subtotal:</span>
              <span>\${{data.total.toFixed(2)}}</span>
            </div>
            @if(costoEnvio() > 0){
              <div class="summary-item">
                <span>Envío:</span>
                <span>\${{costoEnvio().toFixed(2)}}</span>
              </div>
            }
          </div>
          
          <mat-divider></mat-divider>
          
          <!-- Total final -->
          <div class="summary-total">
            <span><strong>Total Final:</strong></span>
            <span><strong>\${{(data.total + costoEnvio()).toFixed(2)}}</strong></span>
          </div>

          <!-- Información de envío seleccionada -->
          @if(sucursalSeleccionada()){
            <div class="shipping-info">
              <h4>Retiro en Sucursal:</h4>
              <p>📍 {{sucursalSeleccionada()?.direccion}}</p>
              <p>🕒 {{sucursalSeleccionada()?.horarios}}</p>
            </div>
          }
        </div>
      </form>
    </mat-dialog-content>
    
    <mat-dialog-actions align="end">
      <button mat-button 
              [disabled]="loading()"
              (click)="onCancel()">Cancelar</button>
      
      <!-- Contenedor para el botón de Mercado Pago -->
      @if(preferenceId() && !loading() && costoEnvio() > 0 && 
          (metodoEnvio() === 'sucursal' || 
           (metodoEnvio() === 'domicilio' && checkoutForm.valid))){
        <div class="mercadopago-button-container"></div>
      }

      <!-- Botón de confirmar (visible solo mientras se carga MP) -->
      @if(loading()){
        <button mat-raised-button color="primary" [disabled]="true">
          <mat-spinner diameter="20"></mat-spinner>
        </button>
      }
    </mat-dialog-actions>
  `,
  styles: [`
    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }
    
    .shipping-section {
      margin-bottom: 24px;
    }

    .shipping-section h3 {
      margin-bottom: 16px;
      color: #333;
    }
    
    .order-summary {
      margin-top: 24px;
      padding: 16px;
      background-color: #f5f5f5;
      border-radius: 8px;
    }
    
    .summary-item {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
    }
    
    .summary-subtotal {
      margin: 16px 0;
      padding: 16px 0;
    }
    
    .summary-total {
      margin-top: 16px;
      font-size: 1.1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .shipping-info {
      margin-top: 16px;
      padding: 16px;
      background-color: #fff;
      border-radius: 8px;
      border: 1px solid #e0e0e0;
    }

    .shipping-info h4 {
      margin: 0 0 8px 0;
      color: #333;
    }

    .shipping-info p {
      margin: 4px 0;
      color: #666;
    }

    mat-dialog-content {
      max-height: 80vh;
      overflow-y: auto;
    }

    .mat-mdc-dialog-content {
      max-height: 80vh;
    }

    .mercadopago-button-container {
      min-width: 150px;
      margin-left: 8px;
    }

    /* Estilos para el botón de Mercado Pago */
    :host ::ng-deep .mercadopago-button {
      background-color: #009ee3;
      color: white;
      border-radius: 4px;
      padding: 8px 16px;
      font-family: inherit;
      font-size: 14px;
      font-weight: 500;
      transition: background-color 0.3s ease;
    }

    :host ::ng-deep .mercadopago-button:hover {
      background-color: #007eb5;
    }
  `]
})
export class CheckoutDialogComponent implements AfterViewInit {
  checkoutForm: FormGroup;
  loading = signal<boolean>(false);
  costoEnvio = signal<number>(0);
  metodoEnvio = signal<'domicilio' | 'sucursal'>('domicilio');
  sucursalSeleccionada = signal<Sucursal | null>(null);
  preferenceId = signal<string>('');

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CheckoutDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: CheckoutData,
    private snackBar: MatSnackBar,
    private router: Router,
    private http: HttpClient
  ) {
    this.checkoutForm = this.fb.group({
      shippingAddress: ['', [Validators.required]]
    });
  }

  ngAfterViewInit() {
    this.initMercadoPago();
  }

  private async initMercadoPago() {
    const script = document.createElement('script');
    script.src = 'https://sdk.mercadopago.com/js/v2';
    script.type = 'text/javascript';
    document.body.appendChild(script);

    script.onload = () => {
      this.createPreference();
    };
  }

  private async createPreference() {
    try {
      const response = await this.http.post<{preferenceId: string}>(
        `${environment.apiUrl}/mercadopago`, 
        {
          items: this.data.cartItems,
          shipping: this.costoEnvio(),
          shippingDetails: {
            method: this.metodoEnvio(),
            address: this.metodoEnvio() === 'domicilio' 
              ? this.checkoutForm.get('shippingAddress')?.value 
              : this.sucursalSeleccionada()?.direccion,
            sucursal: this.sucursalSeleccionada()
          }
        }
      ).toPromise();

      if (response?.preferenceId) {
        this.preferenceId.set(response.preferenceId);
        this.initCheckoutButton(response.preferenceId);
      }
    } catch (error) {
      console.error('Error creating preference:', error);
      this.snackBar.open('Error al inicializar el pago. Intente nuevamente.', 'Cerrar', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
    }
  }

  private initCheckoutButton(preferenceId: string) {
    const mp = new MercadoPago(environment.mercadoPagoPublicKey, {
      locale: 'es-AR'
    });

    const checkout = mp.checkout({
      preference: {
        id: preferenceId
      },
      render: {
        container: '.mercadopago-button-container',
        label: 'Pagar con Mercado Pago'
      },
      theme: {
        elementsColor: '#667eea',
        headerColor: '#667eea'
      }
    });
  }

  onShippingCalculated(shipping: CalculoEnvioResponse) {
    this.costoEnvio.set(shipping.costoEnvio);
  }

  onSucursalSelected(sucursal: Sucursal) {
    this.sucursalSeleccionada.set(sucursal);
    this.metodoEnvio.set('sucursal');
    // Limpiar dirección si se selecciona sucursal
    this.checkoutForm.get('shippingAddress')?.clearValidators();
    this.checkoutForm.get('shippingAddress')?.updateValueAndValidity();
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onConfirm(): void {
    if (this.checkoutForm.invalid || this.costoEnvio() === 0) {
      this.snackBar.open('Por favor complete todos los campos requeridos y calcule el costo de envío', 'Cerrar', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    this.loading.set(true);

    // Construir objeto de checkout
    const checkoutInfo = {
      items: this.data.cartItems,
      total: this.data.total + this.costoEnvio(),
      shippingCost: this.costoEnvio(),
      shippingMethod: this.metodoEnvio(),
      shippingAddress: this.metodoEnvio() === 'domicilio' 
        ? this.checkoutForm.get('shippingAddress')?.value 
        : this.sucursalSeleccionada()?.direccion,
      sucursal: this.sucursalSeleccionada()
    };

    // Simulamos la creación de la orden
    try {
      setTimeout(() => {
        this.snackBar.open('¡Pedido realizado con éxito!', 'Cerrar', {
          duration: 5000,
          panelClass: ['success-snackbar']
        });
        this.loading.set(false);
        this.dialogRef.close(checkoutInfo);
        this.router.navigate(['/profile']); // Redirigir al perfil para ver pedidos
      }, 2000);
    } catch (error) {
      this.loading.set(false);
      this.snackBar.open('Error al procesar el pedido. Intente nuevamente.', 'Cerrar', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
    }
  }
}
/*


import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { 
  AndreaniService, 
  CotizacionResponse,
  Sucursal,
  codigoPostalValidator 
} from '../services/andreani.service';
import { CartService } from '../services/cart.service';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {
  checkoutForm!: FormGroup;
  cartItems: any[] = [];
  
  // Andreani data
  costoEnvio: number = 0;
  plazoEntrega: number = 0;
  cotizacionCargando: boolean = false;
  sucursales: Sucursal[] = [];
  mostrarSucursales: boolean = false;
  metodoEnvio: 'domicilio' | 'sucursal' = 'domicilio';

  constructor(
    private fb: FormBuilder,
    private andreaniService: AndreaniService,
    private cartService: CartService
  ) {}

  ngOnInit() {
    this.cartItems = this.cartService.getCart();
    this.initForm();
  }

  initForm() {
    this.checkoutForm = this.fb.group({
      // Datos personales
      nombreCompleto: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', Validators.required],
      documentoTipo: ['DNI', Validators.required],
      documentoNumero: ['', Validators.required],
      
      // Dirección de envío
      codigoPostal: ['', [Validators.required, codigoPostalValidator()]],
      provincia: ['Buenos Aires', Validators.required],
      localidad: ['', Validators.required],
      calle: ['', Validators.required],
      numero: ['', Validators.required],
      piso: [''],
      departamento: [''],
      
      // Método de envío
      metodoEnvio: ['domicilio', Validators.required],
      sucursalSeleccionada: [null]
    });

    // Calcular envío cuando cambia el código postal
    this.checkoutForm.get('codigoPostal')?.valueChanges.subscribe(cp => {
      if (cp && cp.length === 4) {
        this.validarYCalcularEnvio(cp);
      }
    });

    // Buscar sucursales cuando cambia a retiro en sucursal
    this.checkoutForm.get('metodoEnvio')?.valueChanges.subscribe(metodo => {
      this.metodoEnvio = metodo;
      if (metodo === 'sucursal') {
        const cp = this.checkoutForm.get('codigoPostal')?.value;
        if (cp) {
          this.buscarSucursalesCercanas(cp);
        }
      }
    });
  }

  async validarYCalcularEnvio(codigoPostal: string) {
    this.cotizacionCargando = true;

    try {
      // 1. Validar código postal
      const validacion = await this.andreaniService
        .validarCodigoPostal(codigoPostal)
        .toPromise();

      if (validacion?.valido) {
        // Autocompletar localidad y provincia
        this.checkoutForm.patchValue({
          localidad: validacion.localidad,
          provincia: validacion.provincia
        });

        // 2. Calcular costo de envío
        await this.calcularEnvio(codigoPostal);
      } else {
        alert('Código postal inválido');
        this.costoEnvio = 0;
      }
    } catch (error) {
      console.error('Error al validar CP:', error);
    } finally {
      this.cotizacionCargando = false;
    }
  }

   * Calcula el costo de envío para el carrito
  async calcularEnvio(codigoPostal: string) {
    try {
      const response = await this.andreaniService
        .calcularEnvioCarrito({
          items: this.cartItems,
          codigoPostalDestino: codigoPostal
        })
        .toPromise();

      if (response) {
        this.costoEnvio = response.costoEnvio;
        this.plazoEntrega = response.plazoEntrega;
      }
    } catch (error) {
      console.error('Error al calcular envío:', error);
      this.costoEnvio = 0;
    }
  }

   * Busca sucursales cercanas al código postal
  async buscarSucursalesCercanas(codigoPostal: string) {
    try {
      this.sucursales = await this.andreaniService
        .buscarSucursales(codigoPostal)
        .toPromise() || [];
      
      this.mostrarSucursales = this.sucursales.length > 0;
    } catch (error) {
      console.error('Error al buscar sucursales:', error);
      this.sucursales = [];
    }
  }

   * Selecciona una sucursal
  seleccionarSucursal(sucursal: Sucursal) {
    this.checkoutForm.patchValue({
      sucursalSeleccionada: sucursal
    });
    // Envío gratis o descuento al retirar en sucursal
    this.costoEnvio = this.costoEnvio * 0.8; // 20% descuento ejemplo
  }

   * Obtiene el total del carrito
  getSubtotal(): number {
    return this.cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

   * Obtiene el total con envío
  getTotal(): number {
    return this.getSubtotal() + this.costoEnvio;
  }

   * Obtiene fecha estimada de entrega
  getFechaEstimada(): string {
    const fecha = this.andreaniService.calcularFechaEstimada(this.plazoEntrega);
    return this.andreaniService.formatearFecha(fecha);
  }

   * Formatea precio
  formatearPrecio(precio: number): string {
    return this.andreaniService.formatearPrecio(precio);
  }

   * Finalizar compra
  async finalizarCompra() {
    if (this.checkoutForm.invalid) {
      alert('Por favor complete todos los campos requeridos');
      return;
    }

    const formValue = this.checkoutForm.value;
    
    // Preparar datos de la orden
    const ordenData = {
      items: this.cartItems,
      shipping_address: {
        calle: formValue.calle,
        numero: formValue.numero,
        localidad: formValue.localidad,
        provincia: formValue.provincia,
        codigo_postal: formValue.codigoPostal,
        piso: formValue.piso,
        departamento: formValue.departamento
      },
      customer_info: {
        nombre_completo: formValue.nombreCompleto,
        email: formValue.email,
        telefono: formValue.telefono,
        documento_tipo: formValue.documentoTipo,
        documento_numero: formValue.documentoNumero
      },
      shipping_method: formValue.metodoEnvio,
      sucursal: formValue.sucursalSeleccionada,
      generate_andreani_shipment: true // Generar envío en Andreani
    };

    try {
      // Aquí llamarías a tu servicio de órdenes
      // const orden = await this.orderService.createOrder(ordenData).toPromise();
      
      console.log('Orden creada:', ordenData);
      alert('¡Compra realizada con éxito!');
      
      // Limpiar carrito y redirigir
      this.cartService.clearCart();
      // this.router.navigate(['/order-confirmation', orden.id]);
      
    } catch (error) {
      console.error('Error al crear orden:', error);
      alert('Error al procesar la compra. Intente nuevamente.');
    }
  }
}

// ============================================
// TEMPLATE HTML EJEMPLO
// ============================================
<div class="checkout-container">
  <h2>Finalizar Compra</h2>

  <form [formGroup]="checkoutForm" (ngSubmit)="finalizarCompra()">
    
    <!-- Datos Personales -->
    <div class="section">
      <h3>Datos Personales</h3>
      
      <div class="form-group">
        <label>Nombre Completo *</label>
        <input type="text" formControlName="nombreCompleto" class="form-control">
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>Email *</label>
          <input type="email" formControlName="email" class="form-control">
        </div>

        <div class="form-group">
          <label>Teléfono *</label>
          <input type="tel" formControlName="telefono" class="form-control">
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>Tipo Documento *</label>
          <select formControlName="documentoTipo" class="form-control">
            <option value="DNI">DNI</option>
            <option value="CUIT">CUIT</option>
            <option value="PASAPORTE">Pasaporte</option>
          </select>
        </div>

        <div class="form-group">
          <label>Número *</label>
          <input type="text" formControlName="documentoNumero" class="form-control">
        </div>
      </div>
    </div>

    <!-- Método de Envío -->
    <div class="section">
      <h3>Método de Envío</h3>
      
      <div class="form-group">
        <label>
          <input type="radio" formControlName="metodoEnvio" value="domicilio">
          Envío a domicilio
        </label>
        <label>
          <input type="radio" formControlName="metodoEnvio" value="sucursal">
          Retiro en sucursal Andreani
        </label>
      </div>
    </div>

    <!-- Dirección (si envío a domicilio) -->
    @if(metodoEnvio === 'domicilio'){
      <div class="section">
        <h3>Dirección de Envío</h3>
      
      <div class="form-group">
        <label>Código Postal *</label>
        <input type="text" formControlName="codigoPostal" 
               class="form-control" 
               placeholder="1234"
               maxlength="4">
        @if(cotizacionCargando){
          <small>Calculando envío...</small>
        }
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>Provincia *</label>
          <input type="text" formControlName="provincia" class="form-control">
        </div>

        <div class="form-group">
          <label>Localidad *</label>
          <input type="text" formControlName="localidad" class="form-control">
        </div>
      </div>

      <div class="form-row">
        <div class="form-group flex-2">
          <label>Calle *</label>
          <input type="text" formControlName="calle" class="form-control">
        </div>

        <div class="form-group">
          <label>Número *</label>
          <input type="text" formControlName="numero" class="form-control">
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>Piso</label>
          <input type="text" formControlName="piso" class="form-control">
        </div>

        <div class="form-group">
          <label>Depto</label>
          <input type="text" formControlName="departamento" class="form-control">
        </div>
      </div>
    </div>

    <!-- Sucursales (si retiro en sucursal) -->
    @if(metodoEnvio === 'sucursal' && mostrarSucursales){
      <div class="section">
        <h3>Seleccionar Sucursal</h3>
        
        <div class="sucursales-list">
        @for(sucursal of sucursales; track sucursal.id){
          <div class="sucursal-item"
               [class.selected]="checkoutForm.value.sucursalSeleccionada?.id === sucursal.id"
               (click)="seleccionarSucursal(sucursal)">
            <h4>{{ sucursal.nombre }}</h4>
            <p>{{ sucursal.direccion }}</p>
            <p>{{ sucursal.localidad }}, {{ sucursal.provincia }}</p>
            <p><small>{{ sucursal.horarios }}</small></p>
            <p><small>Tel: {{ sucursal.telefono }}</small></p>
          </div>
        }
      </div>
    </div>

    <!-- Resumen -->
    <div class="section resumen">
      <h3>Resumen de Compra</h3>
      
      <div class="resumen-item">
        <span>Subtotal:</span>
        <span>{{ formatearPrecio(getSubtotal()) }}</span>
      </div>

      <div class="resumen-item">
        <span>Envío:</span>
        @if(!cotizacionCargando){
          <span>{{ formatearPrecio(costoEnvio) }}</span>
        } @else {
          <span>Calculando...</span>
        }
      </div>

      <div class="resumen-item total">
        <span><strong>Total:</strong></span>
        <span><strong>{{ formatearPrecio(getTotal()) }}</strong></span>
      </div>

      @if(plazoEntrega > 0){
        <div class="entrega-info">
          <p>📦 Entrega estimada: <strong>{{ getFechaEstimada() }}</strong></p>
          <p><small>({{ plazoEntrega }} días hábiles)</small></p>
        </div>
      }
    </div>

    <!-- Botón Finalizar -->
    <button type="submit" 
            class="btn btn-primary btn-lg btn-block"
            [disabled]="checkoutForm.invalid || cotizacionCargando">
      Finalizar Compra
    </button>
  </form>
</div>
*/