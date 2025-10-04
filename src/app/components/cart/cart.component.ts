import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { CartItem } from '../../models/interfaces';
import { CheckoutDialogComponent } from './checkout-dialog.component';
import { MatIcon } from '@angular/material/icon';
import { MatCard, MatCardActions, MatCardContent, MatCardHeader, MatCardTitle } from '@angular/material/card';
import { MatDivider } from '@angular/material/divider';
import { MatOption } from '@angular/material/autocomplete';
import { MatFormField, MatLabel, MatSelect } from '@angular/material/select';

@Component({
  selector: 'app-cart',
  standalone:true,
  imports: [MatIcon,MatCardActions,MatDivider,MatCardContent,MatCardTitle,MatCardHeader,MatCard, MatOption,MatSelect,MatLabel,MatFormField],
  template: `
    <div class="cart-container">
      <div class="cart-header">
        <h1>Mi Carrito de Compras</h1>
        <button mat-button routerLink="/products" class="continue-shopping">
          <mat-icon>arrow_back</mat-icon>
          Continuar Comprando
        </button>
      </div>
      @if(cartItems.length > 0){ 
      <div class="cart-content">
        <div class="cart-items-section">
        @for(item of cartItems;track item.id){
          <mat-card class="cart-item-card">
            <div class="cart-item-content">
              <div class="item-image">
                <img [src]="item.Product.image || 'assets/no-image.jpg'" 
                     [alt]="item.Product.name">
              </div>
              
              <div class="item-details">
                <h3>{{item.Product.name}}</h3>
                <p class="item-price">\${{item.Product.price}}</p>
                <p class="item-stock">Stock disponible: {{item.Product.stock}}</p>
              </div>
              
              <div class="item-quantity">
                <mat-form-field appearance="outline">
                  <mat-label>Cantidad</mat-label>
                  <mat-select [value]="item.quantity" (selectionChange)="updateQuantity(item, $event)">
                    @for(qty of getQuantityOptions(item.Product.stock); track qty){
                      <mat-option>
                      {{qty}}
                      </mat-option>
                    }
                  </mat-select>
                </mat-form-field>
              </div>
              
              <div class="item-total">
                <div class="total-label">Total:</div>
                <div class="total-price">\${{(item.quantity * item.Product.price).toFixed(2)}}</div>
              </div>
              
              <div class="item-actions">
                <button mat-icon-button color="warn" (click)="removeItem(item)" 
                        matTooltip="Eliminar del carrito">
                  <mat-icon>delete</mat-icon>
                </button>
              </div>
            </div>
          </mat-card>
          }
        </div>

        <div class="cart-summary-section">
          <mat-card class="summary-card">
            <mat-card-header>
              <mat-card-title>Resumen del Pedido</mat-card-title>
            </mat-card-header>
            
            <mat-card-content>
              <div class="summary-line">
                <span>Subtotal ({{getTotalItems()}} artículos):</span>
                <span class="summary-price">\${{cartTotal.toFixed(2)}}</span>
              </div>
              
              <div class="summary-line">
                <span>Envío:</span>
                <span class="summary-price">Gratis</span>
              </div>
              
              <mat-divider></mat-divider>
              
              <div class="summary-line total-line">
                <span>Total:</span>
                <span class="summary-price total-price">\${{cartTotal.toFixed(2)}}</span>
              </div>
            </mat-card-content>
            
            <mat-card-actions>
              <button mat-raised-button color="primary" 
                      class="checkout-button" 
                      (click)="proceedToCheckout()"
                      [disabled]="cartItems.length === 0">
                <mat-icon>payment</mat-icon>
                Proceder al Pago
              </button>
              
              <button mat-button color="warn" (click)="clearCart()" class="clear-cart-button">
                <mat-icon>clear_all</mat-icon>
                Vaciar Carrito
              </button>
            </mat-card-actions>
          </mat-card>
        </div>
      </div>
     }@else{
      <div>
      <div class="empty-cart">
      <mat-icon class="empty-cart-icon">shopping_cart</mat-icon>
      <h2>Tu carrito está vacío</h2>
      <p>Agrega algunos productos para comenzar a comprar</p>
      <button mat-raised-button color="primary" routerLink="/products">
      <mat-icon>store</mat-icon>
      Explorar Productos
      </button>
      </div>
      </div>
      }
    </div>
  `,
  styles: [`
    .cart-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    
    .cart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 32px;
    }
    
    .cart-header h1 {
      margin: 0;
      color: #333;
    }
    
    .cart-content {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 32px;
    }
    
    .cart-item-card {
      margin-bottom: 16px;
    }
    
    .cart-item-content {
      display: grid;
      grid-template-columns: 100px 1fr auto auto auto;
      gap: 16px;
      align-items: center;
      padding: 16px;
    }
    
    .item-image img {
      width: 80px;
      height: 80px;
      object-fit: cover;
      border-radius: 4px;
    }
    
    .item-details h3 {
      margin: 0 0 8px 0;
      color: #333;
    }
    
    .item-price {
      font-size: 1.1rem;
      font-weight: 500;
      color: #1976d2;
      margin: 4px 0;
    }
    
    .item-stock {
      font-size: 0.9rem;
      color: #666;
      margin: 0;
    }
    
    .item-quantity mat-form-field {
      width: 80px;
    }
    
    .item-total {
      text-align: right;
    }
    
    .total-label {
      font-size: 0.9rem;
      color: #666;
    }
    
    .total-price {
      font-size: 1.2rem;
      font-weight: bold;
      color: #1976d2;
    }
    
    .summary-card {
      position: sticky;
      top: 20px;
    }
    
    .summary-line {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }
    
    .summary-line.total-line {
      margin-top: 16px;
      font-size: 1.2rem;
      font-weight: bold;
    }
    
    .summary-price {
      font-weight: 500;
    }
    
    .summary-price.total-price {
      font-size: 1.3rem;
      color: #1976d2;
    }
    
    .checkout-button {
      width: 100%;
      height: 48px;
      margin-bottom: 8px;
    }
    
    .clear-cart-button {
      width: 100%;
    }
    
    .empty-cart {
      text-align: center;
      padding: 80px 20px;
      color: #666;
    }
    
    .empty-cart-icon {
      font-size: 4rem;
      width: 4rem;
      height: 4rem;
      margin-bottom: 24px;
      color: #ccc;
    }
    
    .empty-cart h2 {
      margin-bottom: 16px;
      color: #333;
    }
    
    .empty-cart button {
      margin-top: 24px;
    }
    
    @media (max-width: 768px) {
      .cart-content {
        grid-template-columns: 1fr;
      }
      
      .cart-item-content {
        grid-template-columns: 1fr;
        gap: 12px;
        text-align: center;
      }
      
      .cart-header {
        flex-direction: column;
        gap: 16px;
        text-align: center;
      }
    }
  `]
})
export class CartComponent implements OnInit {
  cartItems: CartItem[] = [];
  cartTotal = 0;
  loading = false;

  constructor(
    private cartService: CartService,
    private authService: AuthService,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadCart();
  }

  loadCart(): void {
    this.loading = true;
    this.cartService.getCart().subscribe({
      next: (response) => {
        this.cartItems = response.cartItems;
        this.cartTotal = parseFloat(response.total);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading cart:', error);
        this.loading = false;
      }
    });
  }

  getQuantityOptions(stock: number): number[] {
    const maxQty = Math.min(stock, 10);
    return Array.from({ length: maxQty }, (_, i) => i + 1);
  }

  updateQuantity(item: CartItem, newQuantity: any): void {
    this.cartService.updateCartItem(item.id, newQuantity.value).subscribe({
      next: () => {
        this.loadCart();
        this.snackBar.open('Cantidad actualizada', 'Cerrar', { duration: 2000 });
      },
      error: (error) => {
        this.snackBar.open(error.error?.error || 'Error al actualizar cantidad', 'Cerrar', {
          duration: 5000
        });
      }
    });
  }

  removeItem(item: CartItem): void {
    this.cartService.removeFromCart(item.id).subscribe({
      next: () => {
        this.loadCart();
        this.snackBar.open('Producto eliminado del carrito', 'Cerrar', { duration: 3000 });
      },
      error: (error) => {
        this.snackBar.open(error.error?.error || 'Error al eliminar producto', 'Cerrar', {
          duration: 5000
        });
      }
    });
  }

  clearCart(): void {
    if (confirm('¿Estás seguro de que quieres vaciar el carrito?')) {
      this.cartService.clearCart().subscribe({
        next: () => {
          this.loadCart();
          this.snackBar.open('Carrito vaciado', 'Cerrar', { duration: 3000 });
        },
        error: (error) => {
          this.snackBar.open(error.error?.error || 'Error al vaciar carrito', 'Cerrar', {
            duration: 5000
          });
        }
      });
    }
  }

  getTotalItems(): number {
    return this.cartItems.reduce((total, item) => total + item.quantity, 0);
  }

  proceedToCheckout(): void {
    const dialogRef = this.dialog.open(CheckoutDialogComponent, {
      width: '500px',
      data: {
        cartItems: this.cartItems,
        total: this.cartTotal
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadCart(); // Refresh cart after successful order
      }
    });
  }
}