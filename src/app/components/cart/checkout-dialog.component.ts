import { Component, Inject } from '@angular/core';
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

interface CheckoutData {
  cartItems: any[];
  total: number;
}

@Component({
  selector: 'app-checkout-dialog',
  standalone:true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <h2 mat-dialog-title>Finalizar Compra</h2>
    
    <mat-dialog-content>
      <form [formGroup]="checkoutForm">
        <mat-form-field class="full-width">
          <mat-label>Dirección de Envío</mat-label>
          <textarea matInput rows="4" formControlName="shippingAddress" required></textarea>
          @if(checkoutForm.get('shippingAddress')?.hasError('required')){
            <mat-error>
            La dirección de envío es requerida
            </mat-error>
          }
        </mat-form-field>
        
        <div class="order-summary">
          <h3>Resumen del Pedido</h3>
          @for(item of data.cartItems; track item.id){
            <div class="summary-item">
            <span>{{item.Product.name}} x {{item.quantity}}</span>
            <span>\${{(item.quantity * item.Product.price).toFixed(2)}}</span>
            </div>
          }
          <mat-divider></mat-divider>
          <div class="summary-total">
            <span><strong>Total: \${{data.total.toFixed(2)}}</strong></span>
          </div>
        </div>
      </form>
    </mat-dialog-content>
    
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancelar</button>
      <button mat-raised-button color="primary" 
              [disabled]="checkoutForm.invalid || loading" 
              (click)="onConfirm()">
        @if(loading){
          <mat-spinner diameter="20"></mat-spinner>
        }
        @if(!loading){
          <span>Confirmar Pedido</span>
        }
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .full-width {
      width: 100%;
      margin-bottom: 16px;
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
    
    .summary-total {
      margin-top: 16px;
      font-size: 1.1rem;
    }
  `]
})
export class CheckoutDialogComponent {
  checkoutForm: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CheckoutDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: CheckoutData,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    this.checkoutForm = this.fb.group({
      shippingAddress: ['', [Validators.required]]
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onConfirm(): void {
    if (this.checkoutForm.valid) {
      this.loading = true;
      // Aquí iría la lógica para crear la orden
      // Por ahora simularemos el proceso
      setTimeout(() => {
        this.snackBar.open('¡Pedido realizado con éxito!', 'Cerrar', {
          duration: 5000,
          panelClass: ['success-snackbar']
        });
        this.dialogRef.close(true);
        this.router.navigate(['/profile']); // Redirigir al perfil para ver pedidos
      }, 2000);
    }
  }
}