import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { User } from '../../models/interfaces';
import { MatIcon } from '@angular/material/icon';
import { MatDivider } from '@angular/material/divider';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatBadge } from '@angular/material/badge';
import { MatToolbar } from '@angular/material/toolbar';
import { MatButton } from '@angular/material/button';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone:true,
  imports: [MatIcon, MatDivider, MatMenu, MatMenuItem, MatMenuTrigger, MatBadge, MatToolbar, MatButton, AsyncPipe, RouterLink],
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

        <!-- User Actions -->
        <div class="user-actions">
          <!-- Cart -->
          @if(currentUser$ | async){
            <button mat-icon-button routerLink="/cart">
            <mat-icon [matBadge]="cartItemCount" matBadgeColor="warn">shopping_cart</mat-icon>
            </button>
            }


          @let user = currentUser$ | async;
          <!-- User Menu -->
          @if(user){
            <div>
            <button mat-button [matMenuTriggerFor]="userMenu">
            <mat-icon>account_circle</mat-icon>
            {{user.firstName}}
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
            @if(user.role === 'admin'){
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
              </div>
            }@else{
          <!-- Auth Buttons -->
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
    this.cartService.cartItems$.subscribe(items => {
      this.cartItemCount = items.reduce((count, item) => count + item.quantity, 0);
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