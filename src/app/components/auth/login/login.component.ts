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
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone:true,
  imports: [MatIcon, MatCardActions, MatProgressSpinnerModule, MatLabel, MatFormField, MatError, MatCardContent, MatCardTitle, ReactiveFormsModule, MatCardHeader, MatCard, MatInput, MatButton, RouterLink],
  template: `
    <div class="login-container">
      <mat-card class="login-card">
        <mat-card-header>
          <mat-card-title>Iniciar Sesión</mat-card-title>
        </mat-card-header>
        
        <mat-card-content>
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email" required>
              @if(loginForm.get('email')?.hasError('required')){
                <mat-error>
                Email es requerido
                </mat-error>
              }
              @if(loginForm.get('email')?.hasError('email')){
                <mat-error>
                Email no válido
                </mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Contraseña</mat-label>
              <input matInput [type]="hidePassword ? 'password' : 'text'" 
                     formControlName="password" required>
              <button mat-icon-button matSuffix type="button" 
                      (click)="hidePassword = !hidePassword">
                <mat-icon>{{hidePassword ? 'visibility_off' : 'visibility'}}</mat-icon>
              </button>
              @if(loginForm.get('password')?.hasError('required')){
                <mat-error>
                Contraseña es requerida
                </mat-error>
              }
            </mat-form-field>

            <button mat-raised-button color="primary" type="submit" 
                    class="full-width login-button" [disabled]="loginForm.invalid || loading">
              @if(loading){
                <mat-spinner diameter="20"></mat-spinner>
              }@else{
                <span>Iniciar Sesión</span>
              }
            </button>
          </form>
        </mat-card-content>
        
        <mat-card-actions>
          <p>¿No tienes cuenta? 
            <a routerLink="/register" class="register-link">Regístrate aquí</a>
          </p>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: calc(100vh - 200px);
      padding: 20px;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    }
    
    .login-card {
      width: 100%;
      max-width: 450px;
      padding: 32px;
      border-radius: 16px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
      background: white;
    }
    
    .full-width {
      width: 100%;
      margin-bottom: 20px;
    }
    
    .login-button {
      height: 52px;
      margin-top: 24px;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 500;
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
    
    .register-link {
      color: #1976d2;
      text-decoration: none;
      font-weight: 500;
    }
    
    .register-link:hover {
      text-decoration: underline;
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
      .login-container {
        padding: 10px;
        min-height: calc(100vh - 150px);
      }
      
      .login-card {
        padding: 24px;
        margin: 10px;
      }
    }
  `]
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  hidePassword = true;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    // Redirect if already logged in
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/']);
    }
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.loading = true;
      const { email, password } = this.loginForm.value;
      
      this.authService.login(email, password).subscribe({
        next: (response) => {
          this.loading = false;
          this.snackBar.open('¡Bienvenido! Sesión iniciada correctamente', 'Cerrar', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.router.navigate(['/']);
        },
        error: (error) => {
          this.loading = false;
          let errorMessage = 'Error al iniciar sesión';
          
          if (error.status === 401) {
            errorMessage = 'Credenciales incorrectas';
          } else if (error.status === 403) {
            errorMessage = 'Cuenta bloqueada o inactiva';
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
    Object.keys(this.loginForm.controls).forEach(key => {
      this.loginForm.get(key)?.markAsTouched();
    });
  }
}