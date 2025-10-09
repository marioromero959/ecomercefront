import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatOption } from '@angular/material/autocomplete';
import { MatButton } from '@angular/material/button';
import { MatCard, MatCardActions, MatCardContent, MatCardHeader, MatCardSubtitle, MatCardTitle } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatLabel, MatSelect } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-admin-orders',
  standalone:true,
  imports: [MatIcon,MatCardActions,MatOption,MatSelect,MatLabel,MatFormField,ReactiveFormsModule,MatCardContent,DatePipe,MatCardSubtitle,MatCardTitle,MatCardHeader,MatCard, MatButton],
  template: `
    <div class="admin-orders">
      <div class="section-header">
        <h2>Gestión de Pedidos</h2>
      </div>

      <mat-card class="orders-card">
      @if(orders.length > 0){
        <div class="orders-content">
        @for(order of orders; track order.id){
          <div class="order-item">
            <mat-card class="order-card">
              <mat-card-header>
                <mat-card-title>Pedido #{{order.id}}</mat-card-title>
                <mat-card-subtitle>{{order.date | date:'short'}}</mat-card-subtitle>
              </mat-card-header>
              
              <mat-card-content>
                <div class="order-details">
                  <div class="order-info">
                    <p><strong>Cliente:</strong> {{order.customer}}</p>
                    <p><strong>Total:</strong> $ {{order.total}}</p>
                    <p><strong>Items:</strong> {{order.items}} productos</p>
                  </div>
                  
                  <div class="order-status">
                    <mat-form-field>
                      <mat-label>Estado</mat-label>
                      <mat-select [(value)]="order.status" (selectionChange)="updateOrderStatus(order, $event.value)">
                        <mat-option value="pending">Pendiente</mat-option>
                        <mat-option value="processing">Procesando</mat-option>
                        <mat-option value="shipped">Enviado</mat-option>
                        <mat-option value="delivered">Entregado</mat-option>
                        <mat-option value="cancelled">Cancelado</mat-option>
                      </mat-select>
                    </mat-form-field>
                  </div>
                </div>
              </mat-card-content>
              
              <mat-card-actions>
                <button mat-button color="primary" (click)="viewOrderDetails(order)">
                  Ver Detalles
                </button>
              </mat-card-actions>
            </mat-card>
          </div>
         }
         </div>
         }@else{
         <div>
         <div class="no-orders">
         <mat-icon class="no-orders-icon">shopping_bag</mat-icon>
         <h3>No hay pedidos</h3>
         <p>Los pedidos aparecerán aquí cuando los clientes realicen compras</p>
         </div>
         </div>
         }
      </mat-card>
    </div>
  `,
  styles: [`
    .admin-orders {
      max-width: 1200px;
    }
    
    .section-header {
      margin-bottom: 24px;
    }
    
    .section-header h2 {
      margin: 0;
      color: #333;
    }
    
    .orders-content {
      display: grid;
      gap: 16px;
    }
    
    .order-card {
      margin-bottom: 16px;
    }
    
    .order-details {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 24px;
      align-items: center;
    }
    
    .order-info p {
      margin: 4px 0;
    }
    
    .order-status mat-form-field {
      min-width: 150px;
    }
    
    .no-orders {
      text-align: center;
      padding: 60px 20px;
      color: #666;
    }
    
    .no-orders-icon {
      font-size: 4rem;
      width: 4rem;
      height: 4rem;
      margin-bottom: 16px;
      color: #ccc;
    }
    
    @media (max-width: 768px) {
      .order-details {
        grid-template-columns: 1fr;
        gap: 16px;
      }
    }
  `]
})
export class AdminOrdersComponent implements OnInit {
  orders: any[] = [];

  constructor(private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    // Simulamos algunos pedidos de ejemplo
    this.orders = [
      {
        id: 1,
        customer: 'Juan Pérez',
        total: 299.99,
        items: 3,
        status: 'pending',
        date: new Date('2024-01-15')
      },
      {
        id: 2,
        customer: 'María González',
        total: 159.50,
        items: 2,
        status: 'processing',
        date: new Date('2024-01-14')
      },
      {
        id: 3,
        customer: 'Carlos Rodríguez',
        total: 89.99,
        items: 1,
        status: 'shipped',
        date: new Date('2024-01-13')
      }
    ];
  }

  updateOrderStatus(order: any, newStatus: string): void {
    order.status = newStatus;
    this.snackBar.open(`Estado del pedido #${order.id} actualizado`, 'Cerrar', { 
      duration: 3000 
    });
  }

  viewOrderDetails(order: any): void {
    this.snackBar.open(`Ver detalles del pedido #${order.id}`, 'Cerrar', { 
      duration: 2000 
    });
  }
}