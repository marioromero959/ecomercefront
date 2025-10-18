import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { LoadingService } from '../services/loading.service';
import { lastValueFrom } from 'rxjs';

export const adminGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const loadingService = inject(LoadingService);

  try {
    loadingService.show();
    await lastValueFrom(authService.checkAuthStatus());
    
    if (authService.isAdmin()) {
      return true;
    } else {
      router.navigate(['/']);
      return false;
    }
  } finally {
    loadingService.hide();
  }
};