import { Component, effect, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { User } from '../../models/interfaces';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatDividerModule,
    MatMenuModule,
    MatBadgeModule,
    MatToolbarModule,
    MatButtonModule,
  // MatFormFieldModule,
  // MatInputModule
  ],
  template: `
    <mat-toolbar color="primary" class="header-toolbar">
      <div class="toolbar-content">
        <!-- Logo -->
        <div class="logo" routerLink="/">
          <mat-icon>store</mat-icon>
          <span>E-Commerce</span>
        </div>

        <!-- Navigation -->
        <div class="nav-links">
          <button mat-button routerLink="/">Inicio</button>
          <button mat-button routerLink="/products">Productos</button>
        </div>

        <div class="user-actions">
          <!-- Cart y menú de usuario: muestra solo si hay usuario autenticado -->
          @if (currentUser()) {
            <button mat-icon-button routerLink="/cart">
              <mat-icon [matBadge]="cartItemCount()" matBadgeColor="warn" [matBadgeHidden]="cartItemCount() === 0">
                shopping_cart
              </mat-icon>
            </button>

            <!-- User Menu -->
            <button mat-button [matMenuTriggerFor]="userMenu">
              <mat-icon>account_circle</mat-icon>
              {{currentUser()?.firstName}}
            </button>

            <mat-menu #userMenu="matMenu">
              <button mat-menu-item routerLink="/profile">
                <mat-icon>person</mat-icon>
                Perfil
              </button>
              <button mat-menu-item routerLink="/change-password">
                <mat-icon>lock_reset</mat-icon>
                Cambiar Contraseña
              </button>
              @if (currentUser()?.role === 'admin') {
                <button mat-menu-item routerLink="/admin">
                  <mat-icon>admin_panel_settings</mat-icon>
                  Admin
                </button>
              }
              <mat-divider></mat-divider>
              <button mat-menu-item (click)="logout()">
                <mat-icon>logout</mat-icon>
                Cerrar Sesión
              </button>
            </mat-menu>
          } @else {
            <div>
              <button mat-button routerLink="/login">Iniciar Sesión</button>
              <button mat-raised-button color="accent" routerLink="/register">Registrarse</button>
            </div>
          }
        </div>
      </div>
    </mat-toolbar>
  `,
  styles: [`
    .header-toolbar {
      position: sticky;
      top: 0;
      z-index: 1000;
    }
    
    .toolbar-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .logo {
      display: flex;
      align-items: center;
      cursor: pointer;
      font-size: 1.2rem;
      font-weight: bold;
    }
    
    .logo mat-icon {
      margin-right: 8px;
    }
    
    .nav-links {
      display: flex;
      gap: 16px;
    }
    
    .header-search-wrap {
      margin: 0 8px;
      flex: 0 1 auto;
      display: flex;
      justify-content: center;
      align-items: center;
    }

  .header-search { width: 100%; max-width: 220px; }
  .header-search.small { max-width: 180px; height: 34px; }
  /* Reduce material form-field paddings so it doesn't expand toolbar height */
  .header-search .mat-form-field-wrapper { padding: 0 2px; }
  .header-search .mat-form-field-infix { padding: 0 4px; line-height: 20px; }
  .header-search input { padding: 2px 6px; height: 20px; line-height: 20px; }
  .header-search .mat-icon-button { width: 28px; height: 28px; }

  /* Ensure toolbar doesn't grow: limit toolbar padding */
  .header-toolbar { padding: 0 8px; }
    /* Material deep overrides moved to global styles.scss */
    /* See src/styles.scss for global form-field / toolbar sizing rules */
    
    .user-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    @media (max-width: 768px) {
      .nav-links {
        display: none;
      }
      
      .toolbar-content {
        padding: 0 16px;
      }
    }
  `]
})
export class HeaderComponent {
  currentUser = signal<User | null>(null);
  cartItemCount = signal<number>(0);

  constructor(
    private authService: AuthService,
    private cartService: CartService,
    private router: Router
  ) {
    // Efecto para sincronizar el usuario actual
    effect(() => {
      this.authService.currentUser$.subscribe(user => {
        this.currentUser.set(user);
        if (user) {
          // Cargar el carrito cuando el usuario está autenticado
          this.cartService.getCart().subscribe();
        }
      });
    });

    // Efecto para sincronizar el contador del carrito
    effect(() => {
      this.cartService.cartItemCount$.subscribe(count => {
        this.cartItemCount.set(count);
      });
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}