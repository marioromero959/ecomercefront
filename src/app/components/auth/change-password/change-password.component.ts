import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../services/auth.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIcon } from '@angular/material/icon';
import { MatCard, MatCardActions, MatCardContent, MatCardHeader, MatCardTitle } from '@angular/material/card';
import { MatInput } from '@angular/material/input';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [
    MatIcon,
    MatCardActions,
    MatProgressSpinnerModule,
    MatLabel,
    MatFormField,
    MatError,
    MatCardContent,
    MatCardTitle,
    ReactiveFormsModule,
    MatCardHeader,
    MatCard,
    MatInput,
    MatButton
  ],
  template: `
    <div class="change-password-container">
      <mat-card class="change-password-card">
        <mat-card-header>
          <mat-card-title>Cambiar Contraseña</mat-card-title>
        </mat-card-header>
        
        <mat-card-content>
          <form [formGroup]="changePasswordForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Contraseña Actual</mat-label>
              <input matInput [type]="hideCurrentPassword ? 'password' : 'text'" 
                     formControlName="currentPassword" required>
              <button mat-icon-button matSuffix type="button" 
                      (click)="hideCurrentPassword = !hideCurrentPassword">
                <mat-icon>{{hideCurrentPassword ? 'visibility_off' : 'visibility'}}</mat-icon>
              </button>
              @if(changePasswordForm.get('currentPassword')?.hasError('required')) {
                <mat-error>
                  Contraseña actual es requerida
                </mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Nueva Contraseña</mat-label>
              <input matInput [type]="hideNewPassword ? 'password' : 'text'" 
                     formControlName="newPassword" required>
              <button mat-icon-button matSuffix type="button" 
                      (click)="hideNewPassword = !hideNewPassword">
                <mat-icon>{{hideNewPassword ? 'visibility_off' : 'visibility'}}</mat-icon>
              </button>
              @if(changePasswordForm.get('newPassword')?.hasError('required')) {
                <mat-error>
                  Nueva contraseña es requerida
                </mat-error>
              }
              @if(changePasswordForm.get('newPassword')?.hasError('minlength')) {
                <mat-error>
                  La contraseña debe tener al menos 6 caracteres
                </mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Confirmar Nueva Contraseña</mat-label>
              <input matInput [type]="hideConfirmPassword ? 'password' : 'text'" 
                     formControlName="confirmPassword" required>
              <button mat-icon-button matSuffix type="button" 
                      (click)="hideConfirmPassword = !hideConfirmPassword">
                <mat-icon>{{hideConfirmPassword ? 'visibility_off' : 'visibility'}}</mat-icon>
              </button>
              @if(changePasswordForm.get('confirmPassword')?.hasError('required')) {
                <mat-error>
                  Confirmar contraseña es requerida
                </mat-error>
              }
              @if(changePasswordForm.hasError('passwordMismatch')) {
                <mat-error>
                  Las contraseñas no coinciden
                </mat-error>
              }
            </mat-form-field>

            <div class="password-requirements">
              <h4>Requisitos de la contraseña:</h4>
              <ul>
                <li [class.valid]="changePasswordForm.get('newPassword')?.value?.length >= 6">
                  Al menos 6 caracteres
                </li>
                <li [class.valid]="arePasswordsDifferent()">
                  Diferente a la contraseña actual
                </li>
              </ul>
            </div>

            <button mat-raised-button color="primary" type="submit" 
                    class="full-width change-password-button" 
                    [disabled]="changePasswordForm.invalid || loading">
              @if(loading) {
                <mat-spinner diameter="20"></mat-spinner>
              } @else {
                <ng-container>
                <mat-icon>lock_reset</mat-icon>
                <span>Cambiar Contraseña</span>
                </ng-container>
              }
            </button>
          </form>
        </mat-card-content>
        
        <mat-card-actions>
          <button mat-button routerLink="/profile">
            <mat-icon>arrow_back</mat-icon>
            Volver al Perfil
          </button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .change-password-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: calc(100vh - 200px);
      padding: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    
    .change-password-card {
      width: 100%;
      max-width: 500px;
      padding: 32px;
      border-radius: 16px;
      box-shadow: 0 15px 35px rgba(0,0,0,0.15);
      background: white;
    }
    
    .full-width {
      width: 100%;
      margin-bottom: 20px;
    }
    
    .change-password-button {
      height: 52px;
      margin-top: 24px;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 500;
    }
    
    .change-password-button mat-icon {
      margin-right: 8px;
    }
    
    .password-requirements {
      margin: 20px 0;
      padding: 16px;
      background: #f5f5f5;
      border-radius: 8px;
      border-left: 4px solid #1976d2;
    }
    
    .password-requirements h4 {
      margin-bottom: 12px;
      color: #333;
      font-size: 14px;
      font-weight: 600;
    }
    
    .password-requirements ul {
      margin: 0;
      padding-left: 20px;
      color: #666;
    }
    
    .password-requirements li {
      margin-bottom: 4px;
      font-size: 13px;
      transition: color 0.3s;
    }
    
    .password-requirements li.valid {
      color: #4caf50;
      font-weight: 500;
    }
    
    .password-requirements li.valid::before {
      content: "✓ ";
      color: #4caf50;
    }
    
    :host ::ng-deep .mat-form-field-appearance-outline .mat-form-field-outline {
      color: #e0e0e0;
    }
    
    :host ::ng-deep .mat-form-field-appearance-outline.mat-focused .mat-form-field-outline-thick {
      color: #1976d2;
    }
    
    :host ::ng-deep .mat-card-title {
      font-size: 28px;
      font-weight: 600;
      color: #333;
      text-align: center;
      margin-bottom: 0;
    }
    
    mat-card-actions {
      text-align: center;
      padding-top: 20px;
      margin-top: 16px;
      border-top: 1px solid #f0f0f0;
    }
    
    mat-card-actions button {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    :host ::ng-deep .error-snackbar {
      background: #f44336;
      color: white;
    }
    
    :host ::ng-deep .success-snackbar {
      background: #4caf50;
      color: white;
    }
    
    @media (max-width: 600px) {
      .change-password-container {
        padding: 10px;
        min-height: calc(100vh - 150px);
      }
      
      .change-password-card {
        padding: 24px;
        margin: 10px;
      }
    }
  `]
})
export class ChangePasswordComponent implements OnInit {
  changePasswordForm: FormGroup;
  hideCurrentPassword = true;
  hideNewPassword = true;
  hideConfirmPassword = true;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.changePasswordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    // Redirect if not authenticated
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
    }
  }

  passwordMatchValidator(group: FormGroup) {
    const newPassword = group.get('newPassword');
    const confirmPassword = group.get('confirmPassword');
    
    if (!newPassword || !confirmPassword) return null;
    
    return newPassword.value === confirmPassword.value ? null : { passwordMismatch: true };
  }

  arePasswordsDifferent(): boolean {
    const currentPassword = this.changePasswordForm.get('currentPassword')?.value;
    const newPassword = this.changePasswordForm.get('newPassword')?.value;
    
    return currentPassword && newPassword && currentPassword !== newPassword;
  }

  onSubmit(): void {
    if (this.changePasswordForm.valid) {
      this.loading = true;
      const { currentPassword, newPassword } = this.changePasswordForm.value;
      
      // Check if new password is different from current
      if (currentPassword === newPassword) {
        this.loading = false;
        this.snackBar.open('La nueva contraseña debe ser diferente a la contraseña actual', 'Cerrar', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        return;
      }
      
      this.authService.changePassword({ currentPassword, newPassword }).subscribe({
        next: (response) => {
          this.loading = false;
          this.snackBar.open('¡Contraseña cambiada exitosamente!', 'Cerrar', {
            duration: 4000,
            panelClass: ['success-snackbar']
          });
          this.router.navigate(['/profile']);
        },
        error: (error) => {
          this.loading = false;
          let errorMessage = 'Error al cambiar la contraseña';
          
          if (error.status === 401) {
            errorMessage = 'Contraseña actual incorrecta';
          } else if (error.status === 403) {
            errorMessage = 'No tienes permisos para cambiar la contraseña';
          } else if (error.status === 422) {
            errorMessage = error.error?.error || 'Datos de entrada no válidos';
          } else if (error.status === 0) {
            errorMessage = 'No se puede conectar al servidor';
          } else if (error.error?.error) {
            errorMessage = error.error.error;
          }
          
          this.snackBar.open(errorMessage, 'Cerrar', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.changePasswordForm.controls).forEach(key => {
      this.changePasswordForm.get(key)?.markAsTouched();
    });
  }
}
