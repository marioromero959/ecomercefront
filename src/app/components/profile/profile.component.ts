import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/interfaces';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';
import { MatChipsModule } from '@angular/material/chips';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [MatCardModule, MatFormFieldModule, MatInputModule, MatIconModule, MatButtonModule, MatProgressSpinnerModule, MatSnackBarModule, RouterModule, MatChipsModule, DatePipe, ReactiveFormsModule],
  template: `
    <div class="profile-container">
      <div class="profile-header">
        <h1>Mi Perfil</h1>
        @if(currentUser){
          <div class="user-info">
          <mat-icon>account_circle</mat-icon>
          <span>{{currentUser.firstName}} {{currentUser.lastName}}</span>
          </div>
        }
      </div>

      <div class="profile-content">
        <!-- Profile Form -->
        <mat-card class="profile-form-card">
          <mat-card-header>
            <mat-card-title>Información Personal</mat-card-title>
          </mat-card-header>
          
          <mat-card-content>
            <form [formGroup]="profileForm" (ngSubmit)="updateProfile()">
              <div class="form-row">
                <mat-form-field class="half-width">
                  <mat-label>Nombre</mat-label>
                  <input matInput formControlName="firstName" required>
                  @if(profileForm.get('firstName')?.hasError('required')){
                    <mat-error>
                    El nombre es requerido
                    </mat-error>
                  }
                </mat-form-field>

                <mat-form-field class="half-width">
                  <mat-label>Apellido</mat-label>
                  <input matInput formControlName="lastName" required>
                  @if(profileForm.get('lastName')?.hasError('required')){
                    <mat-error>
                    El apellido es requerido
                    </mat-error>
                  }
                </mat-form-field>
              </div>

              <mat-form-field class="full-width">
                <mat-label>Email</mat-label>
                <input matInput formControlName="email" [readonly]="true">
                <mat-hint>El email no se puede modificar</mat-hint>
              </mat-form-field>

              <mat-form-field class="full-width">
                <mat-label>Teléfono</mat-label>
                <input matInput formControlName="phone">
              </mat-form-field>

              <mat-form-field class="full-width">
                <mat-label>Dirección</mat-label>
                <textarea matInput rows="3" formControlName="address"></textarea>
              </mat-form-field>

              <div class="form-actions">
                <button mat-raised-button color="primary" type="submit" 
                        [disabled]="profileForm.invalid || loading">
                  @if(loading){
                    <mat-spinner diameter="20"></mat-spinner>
                    }@else{
                      <span >Actualizar Perfil</span>
                    }
                </button>
                
                <button mat-button type="button" routerLink="/change-password" class="change-password-btn">
                  <mat-icon>lock_reset</mat-icon>
                  Cambiar Contraseña
                </button>
              </div>
            </form>
          </mat-card-content>
        </mat-card>

        <!-- Order History -->
        <mat-card class="orders-card">
          <mat-card-header>
            <mat-card-title>Historial de Pedidos</mat-card-title>
          </mat-card-header>
          
          <mat-card-content>
          @if(orders.length > 0){
            <div class="orders-list">
              @for( order of orders; track order.id){
              <div class="order-item">
                <div class="order-header">
                  <div class="order-id">Pedido #{{order.id}}</div>
                  <div class="order-date">{{order.date | date:'short'}}</div>
                </div>
                <div class="order-details">
                  <div class="order-items">{{order.items}} artículos</div>
                  <div class="order-total">\${{order.total}}</div>
                  <mat-chip-listbox selected>
                    <mat-chip-option [value]="order.status">
                      {{getStatusLabel(order.status)}}
                    </mat-chip-option>
                  </mat-chip-listbox>
                </div>
              </div>
              }
            </div>
          } @else{
            <div >
              <div class="no-orders">
                <mat-icon class="no-orders-icon">shopping_bag</mat-icon>
                <h3>No tienes pedidos aún</h3>
                <p>Cuando realices tu primera compra, aparecerá aquí</p>
                <button mat-raised-button color="primary" routerLink="/products">
                  Comenzar a Comprar
                </button>
              </div>
            </div>
           }

          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .profile-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    
    .profile-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 32px;
    }
    
    .profile-header h1 {
      margin: 0;
      color: #333;
    }
    
    .user-info {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #666;
    }
    
    .profile-content {
      display: grid;
      gap: 32px;
    }
    
    .form-row {
      display: flex;
      gap: 16px;
    }
    
    .half-width {
      flex: 1;
    }
    
    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }
    
    .form-actions {
      margin-top: 24px;
      display: flex;
      gap: 16px;
      align-items: center;
    }
    
    .change-password-btn {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .orders-list {
      display: grid;
      gap: 16px;
    }
    
    .order-item {
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 16px;
    }
    
    .order-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
    }
    
    .order-id {
      font-weight: 500;
      color: #1976d2;
    }
    
    .order-date {
      color: #666;
      font-size: 0.9rem;
    }
    
    .order-details {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .order-total {
      font-weight: 500;
      color: #1976d2;
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
      .profile-header {
        flex-direction: column;
        gap: 16px;
        text-align: center;
      }
      
      .form-row {
        flex-direction: column;
        gap: 0;
      }
      
      .order-details {
        flex-direction: column;
        gap: 8px;
        align-items: flex-start;
      }
    }
  `]
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  currentUser: User | null = null;
  orders: any[] = [];
  loading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: [''],
      phone: [''],
      address: ['']
    });
  }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.profileForm.patchValue({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone || '',
          address: user.address || ''
        });
      }
    });

    this.loadOrderHistory();
  }

  updateProfile(): void {
    if (this.profileForm.valid) {
      this.loading = true;
      const profileData = {
        firstName: this.profileForm.value.firstName,
        lastName: this.profileForm.value.lastName,
        phone: this.profileForm.value.phone,
        address: this.profileForm.value.address
      };

      this.authService.updateProfile(profileData).subscribe({
        next: (response) => {
          this.loading = false;
          this.snackBar.open('Perfil actualizado correctamente', 'Cerrar', { 
            duration: 3000 
          });
        },
        error: (error) => {
          this.loading = false;
          this.snackBar.open(error.error?.error || 'Error al actualizar perfil', 'Cerrar', { 
            duration: 5000 
          });
        }
      });
    }
  }

  loadOrderHistory(): void {
    // Simulamos algunos pedidos de ejemplo
    this.orders = [
      {
        id: 1,
        items: 3,
        total: 299.99,
        status: 'delivered',
        date: new Date('2024-01-10')
      },
      {
        id: 2,
        items: 1,
        total: 89.99,
        status: 'shipped',
        date: new Date('2024-01-15')
      }
    ];
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'pending': 'warn',
      'processing': 'primary',
      'shipped': 'accent',
      'delivered': 'primary',
      'cancelled': 'warn'
    };
    return colors[status] || 'default';
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'pending': 'Pendiente',
      'processing': 'Procesando',
      'shipped': 'Enviado',
      'delivered': 'Entregado',
      'cancelled': 'Cancelado'
    };
    return labels[status] || status;
  }
}