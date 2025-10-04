import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../services/auth.service';
import { MatIcon } from '@angular/material/icon';
import { MatCard, MatCardActions, MatCardContent, MatCardHeader, MatCardTitle } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatInput } from '@angular/material/input';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatButton } from '@angular/material/button';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone:true,
  imports: [MatIcon, MatCardActions, MatProgressSpinnerModule, MatLabel, MatFormField, MatError, MatCardContent, MatCardTitle, ReactiveFormsModule, MatCardHeader, MatCard, MatInput, MatButton, RouterLink],
  template: `
    <div class="register-container">
      <mat-card class="register-card">
        <mat-card-header>
          <mat-card-title>Registro</mat-card-title>
        </mat-card-header>
        
        <mat-card-content>
          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
            <div class="name-row">
              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Nombre</mat-label>
                <input matInput formControlName="firstName" required>
                @if(registerForm.get('firstName')?.hasError('required')){
                  <mat-error>
                  Nombre es requerido
                  </mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Apellido</mat-label>
                <input matInput formControlName="lastName" required>
                @if(registerForm.get('lastName')?.hasError('required')){
                  <mat-error>
                  Apellido es requerido
                  </mat-error>
                }
              </mat-form-field>
            </div>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email" required>
              @if(registerForm.get('email')?.hasError('required')){
                <mat-error>
                Email es requerido
                </mat-error>
              }
              @if(registerForm.get('email')?.hasError('email')){
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
              @if(registerForm.get('password')?.hasError('required')){
                <mat-error>
                Contraseña es requerida
                </mat-error>
              }
              @if(registerForm.get('password')?.hasError('minlength')){
                <mat-error>
                Contraseña debe tener al menos 6 caracteres
                </mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Teléfono (Opcional)</mat-label>
              <input matInput formControlName="phone">
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Dirección (Opcional)</mat-label>
              <textarea matInput rows="3" formControlName="address"></textarea>
            </mat-form-field>

            <button mat-raised-button color="primary" type="submit" 
                    class="full-width register-button" [disabled]="registerForm.invalid || loading">
              @if(loading){
                <mat-spinner diameter="20"></mat-spinner>
              }@else{ 
                <span>Registrarse</span>
              }
            </button>
          </form>
        </mat-card-content>
        
        <mat-card-actions>
          <p>¿Ya tienes cuenta? 
            <a routerLink="/login" class="login-link">Inicia sesión aquí</a>
          </p>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .register-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: calc(100vh - 200px);
      padding: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    
    .register-card {
      width: 100%;
      max-width: 550px;
      padding: 32px;
      border-radius: 16px;
      box-shadow: 0 15px 35px rgba(0,0,0,0.15);
      background: white;
    }
    
    .name-row {
      display: flex;
      gap: 20px;
    }
    
    .half-width {
      flex: 1;
    }
    
    .full-width {
      width: 100%;
      margin-bottom: 20px;
    }
    
    .register-button {
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
    
    .login-link {
      color: #1976d2;
      text-decoration: none;
      font-weight: 500;
    }
    
    .login-link:hover {
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
      .register-container {
        padding: 10px;
        min-height: calc(100vh - 150px);
      }
      
      .register-card {
        padding: 24px;
        margin: 10px;
      }
      
      .name-row {
        flex-direction: column;
        gap: 0;
      }
    }
  `]
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  hidePassword = true;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      phone: [''],
      address: ['']
    });
  }

  ngOnInit(): void {
    // Redirect if already logged in
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/']);
    }
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.loading = true;
      
      this.authService.register(this.registerForm.value).subscribe({
        next: (response) => {
          this.loading = false;
          this.snackBar.open('¡Registro creado exitosamente! Ya puedes iniciar sesión', 'Cerrar', {
            duration: 4000,
            panelClass: ['success-snackbar']
          });
          this.router.navigate(['/login']);
        },
        error: (error) => {
          this.loading = false;
          let errorMessage = 'Error al registrarse';
          
          if (error.status === 409) {
            errorMessage = 'Este email ya está registrado';
          } else if (error.status === 422) {
            errorMessage = error.error?.error || 'Datos de entrada no válidos';
          } else if (error.status === 400) {
            errorMessage = error.error?.error || 'Datos incompletos';
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
    Object.keys(this.registerForm.controls).forEach(key => {
      this.registerForm.get(key)?.markAsTouched();
    });
  }
}