import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatCard } from '@angular/material/card';
import { MatChip } from '@angular/material/chips';
import { MatIcon } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';

@Component({
  selector: 'app-admin-users',
  standalone:true,
  imports: [MatIcon,MatMenuModule,DatePipe,MatChip,MatTableModule,MatCard],
  template: `
    <div class="admin-users">
      <div class="section-header">
        <h2>Gestión de Usuarios</h2>
      </div>

      <mat-card class="users-table-card">
        <div class="table-container">
          <table mat-table [dataSource]="users" class="users-table">
            <!-- Name Column -->
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Nombre</th>
              <td mat-cell *matCellDef="let user">{{user.firstName}} {{user.lastName}}</td>
            </ng-container>

            <!-- Email Column -->
            <ng-container matColumnDef="email">
              <th mat-header-cell *matHeaderCellDef>Email</th>
              <td mat-cell *matCellDef="let user">{{user.email}}</td>
            </ng-container>

            <!-- Role Column -->
            <ng-container matColumnDef="role">
              <th mat-header-cell *matHeaderCellDef>Rol</th>
              <td mat-cell *matCellDef="let user">
                <mat-chip [color]="user.role === 'admin' ? 'primary' : 'default'" selected>
                  {{user.role === 'admin' ? 'Administrador' : 'Cliente'}}
                </mat-chip>
              </td>
            </ng-container>

            <!-- Created Column -->
            <ng-container matColumnDef="created">
              <th mat-header-cell *matHeaderCellDef>Registro</th>
              <td mat-cell *matCellDef="let user">{{user.createdAt | date:'short'}}</td>
            </ng-container>

            <!-- Actions Column -->
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Acciones</th>
              <td mat-cell *matCellDef="let user">
                <button mat-icon-button [matMenuTriggerFor]="userMenu" 
                        [disabled]="user.role === 'admin'">
                  <mat-icon>more_vert</mat-icon>
                </button>
                <mat-menu #userMenu="matMenu">
                  <button mat-menu-item (click)="changeUserRole(user)">
                    <mat-icon>admin_panel_settings</mat-icon>
                    Hacer Admin
                  </button>
                  <button mat-menu-item (click)="viewUserDetails(user)">
                    <mat-icon>visibility</mat-icon>
                    Ver Detalles
                  </button>
                </mat-menu>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
        </div>
      </mat-card>
    </div>
  `,
  styles: [`
    .admin-users {
      max-width: 1200px;
    }
    
    .section-header {
      margin-bottom: 24px;
    }
    
    .section-header h2 {
      margin: 0;
      color: #333;
    }
    
    .users-table-card {
      overflow: hidden;
    }
    
    .table-container {
      overflow-x: auto;
    }
    
    .users-table {
      width: 100%;
      min-width: 600px;
    }
  `]
})
export class AdminUsersComponent implements OnInit {
  users: any[] = [];
  displayedColumns: string[] = ['name', 'email', 'role', 'created', 'actions'];

  constructor(private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    // Simulamos algunos usuarios de ejemplo
    this.users = [
      {
        id: 1,
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'juan@email.com',
        role: 'customer',
        createdAt: new Date('2024-01-10')
      },
      {
        id: 2,
        firstName: 'María',
        lastName: 'González',
        email: 'maria@email.com',
        role: 'customer',
        createdAt: new Date('2024-01-12')
      },
      {
        id: 3,
        firstName: 'Admin',
        lastName: 'Usuario',
        email: 'admin@email.com',
        role: 'admin',
        createdAt: new Date('2024-01-01')
      }
    ];
  }

  changeUserRole(user: any): void {
    if (confirm(`¿Cambiar rol de ${user.firstName} ${user.lastName} a administrador?`)) {
      user.role = 'admin';
      this.snackBar.open(`${user.firstName} ahora es administrador`, 'Cerrar', { 
        duration: 3000 
      });
    }
  }

  viewUserDetails(user: any): void {
    this.snackBar.open(`Ver detalles de ${user.firstName} ${user.lastName}`, 'Cerrar', { 
      duration: 2000 
    });
  }
}