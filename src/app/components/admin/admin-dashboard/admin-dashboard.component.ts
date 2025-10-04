import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../models/interfaces';
import { RouterModule, RouterOutlet } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { MatListItem, MatListModule, MatNavList } from '@angular/material/list';

@Component({
  selector: 'app-admin-dashboard',
  standalone:true,
  imports: [RouterOutlet,MatIcon,MatListItem,MatNavList, MatListModule,RouterModule ],
  template: `
    <div class="admin-dashboard">
      <!-- Admin Header -->
      <div class="admin-header">
        <h1>Panel de Administración</h1>
        @if(currentUser){
          <div class="admin-user-info">
          <mat-icon>admin_panel_settings</mat-icon>
          <span>Bienvenido, {{currentUser.firstName}} {{currentUser.lastName}}</span>
          </div>
        }
      </div>

      <!-- Admin Navigation -->
      <div class="admin-layout">
        <nav class="admin-nav">
          <mat-nav-list>
            <mat-list-item routerLink="/admin/products" routerLinkActive="active">
              <mat-icon matListIcon>inventory</mat-icon>
              <span matLine>Productos</span>
            </mat-list-item>
            
            <mat-list-item routerLink="/admin/categories" routerLinkActive="active">
              <mat-icon matListIcon>category</mat-icon>
              <span matLine>Categorías</span>
            </mat-list-item>
            
            <mat-list-item routerLink="/admin/orders" routerLinkActive="active">
              <mat-icon matListIcon>shopping_bag</mat-icon>
              <span matLine>Pedidos</span>
            </mat-list-item>
            
            <mat-list-item routerLink="/admin/users" routerLinkActive="active">
              <mat-icon matListIcon>people</mat-icon>
              <span matLine>Usuarios</span>
            </mat-list-item>
          </mat-nav-list>
          
          <div class="nav-actions">
            <button mat-stroked-button routerLink="/" class="back-to-store">
              <mat-icon>store</mat-icon>
              Volver a la Tienda
            </button>
          </div>
        </nav>

        <!-- Admin Content -->
        <main class="admin-content">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .admin-dashboard {
      min-height: 100vh;
      background-color: #f5f5f5;
    }
    
    .admin-header {
      background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
      color: white;
      padding: 24px 32px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    
    .admin-header h1 {
      margin: 0;
      font-weight: 300;
    }
    
    .admin-user-info {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .admin-layout {
      display: grid;
      grid-template-columns: 250px 1fr;
      min-height: calc(100vh - 80px);
    }
    
    .admin-nav {
      background: white;
      border-right: 1px solid #e0e0e0;
      padding: 16px 0;
      display: flex;
      flex-direction: column;
    }
    
    .admin-nav mat-list-item {
      margin-bottom: 4px;
    }
    
    .admin-nav mat-list-item.active {
      background-color: #e3f2fd;
      color: #1976d2;
    }
    
    .nav-actions {
      margin-top: auto;
      padding: 16px;
    }
    
    .back-to-store {
      width: 100%;
    }
    
    .admin-content {
      padding: 24px;
      overflow-y: auto;
    }
    
    @media (max-width: 768px) {
      .admin-layout {
        grid-template-columns: 1fr;
      }
      
      .admin-nav {
        display: none;
      }
      
      .admin-header {
        padding: 16px;
      }
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  currentUser: User | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }
}