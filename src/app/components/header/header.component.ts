import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { User } from '../../models/interfaces';
import { CommonModule, AsyncPipe } from '@angular/common';
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
    AsyncPipe,
    MatIconModule,
    MatDividerModule,
    MatMenuModule,
    MatBadgeModule,
    MatToolbarModule,
    MatButtonModule
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
          <!-- Cart: muestra solo si hay usuario autenticado -->
          <ng-container *ngIf="currentUser$ | async as currentUser">
            <button mat-icon-button routerLink="/cart">
              <mat-icon [matBadge]="cartItemCount" matBadgeColor="warn" [matBadgeHidden]="cartItemCount === 0">shopping_cart</mat-icon>
            </button>

            <!-- User Menu -->
            <button mat-button [matMenuTriggerFor]="userMenu">
              <mat-icon>account_circle</mat-icon>
              {{currentUser.firstName}}
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
              <ng-container *ngIf="currentUser.role === 'admin'">
                <button mat-menu-item routerLink="/admin">
                  <mat-icon>admin_panel_settings</mat-icon>
                  Admin
                </button>
              </ng-container>
              <mat-divider></mat-divider>
              <button mat-menu-item (click)="logout()">
                <mat-icon>logout</mat-icon>
                Cerrar Sesión
              </button>
            </mat-menu>
          </ng-container>

          <!-- Si no hay usuario, muestra botones de auth -->
          <ng-container *ngIf="!(currentUser$ | async)">
            <div>
              <button mat-button routerLink="/login">Iniciar Sesi3n</button>
              <button mat-raised-button color="accent" routerLink="/register">Registrarse</button>
            </div>
          </ng-container>
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
export class HeaderComponent implements OnInit {
  currentUser$: Observable<User | null>;
  cartItemCount = 0;

  constructor(
    private authService: AuthService,
    private cartService: CartService,
    private router: Router
  ) {
    this.currentUser$ = this.authService.currentUser$;
  }

  ngOnInit(): void {
    this.cartService.cartItemCount$.subscribe(count => {
      this.cartItemCount = count;
    });

    // Load cart if user is authenticated
    this.currentUser$.subscribe(user => {
      if (user) {
        this.cartService.getCart().subscribe();
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}