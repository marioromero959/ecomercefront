// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/home/home.component')
      .then(m => m.HomeComponent)
  },
  {
    path: 'products',
    loadComponent: () => import('./components/product-list/product-list.component')
      .then(m => m.ProductListComponent)
  },
  {
    path: 'products/:id',
    loadComponent: () => import('./components/product-detail/product-detail.component')
      .then(m => m.ProductDetailComponent)
  },
  {
    path: 'cart',
    loadComponent: () => import('./components/cart/cart.component')
      .then(m => m.CartComponent),
    canActivate: [authGuard]
  },
  {
    path: 'login',
    loadComponent: () => import('./components/auth/login/login.component')
      .then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./components/auth/register/register.component')
      .then(m => m.RegisterComponent)
  },
  {
    path: 'profile',
    loadComponent: () => import('./components/profile/profile.component')
      .then(m => m.ProfileComponent),
    canActivate: [authGuard]
  },
  {
    path: 'change-password',
    loadComponent: () => import('./components/auth/change-password/change-password.component')
      .then(m => m.ChangePasswordComponent),
    canActivate: [authGuard]
  },
  {
    path: 'admin',
    loadComponent: () => import('./components/admin/admin-dashboard/admin-dashboard.component')
      .then(m => m.AdminDashboardComponent),
    canActivate: [adminGuard,authGuard],
    children: [
      {
        path: '',
        redirectTo: 'products',
        pathMatch: 'full'
      },
      {
        path: 'products',
        loadComponent: () => import('./components/admin/admin-products/admin-products.component')
          .then(m => m.AdminProductsComponent)
      },
      {
        path: 'categories',
        loadComponent: () => import('./components/admin/admin-categories/admin-categories.component')
          .then(m => m.AdminCategoriesComponent)
      },
      {
        path: 'orders',
        loadComponent: () => import('./components/admin/admin-orders/admin-orders.component')
          .then(m => m.AdminOrdersComponent)
      },
      {
        path: 'users',
        loadComponent: () => import('./components/admin/admin-users/admin-users.component')
          .then(m => m.AdminUsersComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];