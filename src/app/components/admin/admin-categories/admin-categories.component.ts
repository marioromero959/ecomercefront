import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CategoryService } from '../../../services/category.service';
import { Category } from '../../../models/interfaces';
import { CategoryFormDialogComponent } from '../category-form-dialog/category-form-dialog.component';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatIconModule,
    MatCardModule,
    MatButtonModule,
    MatSnackBarModule,
    MatTooltipModule
  ],
  template: `
    <div class="admin-categories">
      <div class="section-header">
        <h2>Gestión de Categorías</h2>
        <button mat-raised-button color="primary" (click)="openCategoryDialog()">
          <mat-icon>add</mat-icon>
          Nueva Categoría
        </button>
      </div>

      <mat-card class="categories-table-card">
        <div class="table-container">
          <table mat-table [dataSource]="categories" class="categories-table">

            <!-- Image Column -->
            <ng-container matColumnDef="image">
              <th mat-header-cell *matHeaderCellDef>Imagen</th>
              <td mat-cell *matCellDef="let category">
                <img [src]="category.image || 'assets/category-default.jpg'" [alt]="category.name" class="category-thumb">
              </td>
            </ng-container>

            <!-- Name Column -->
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Nombre</th>
              <td mat-cell *matCellDef="let category">{{category.name}}</td>
            </ng-container>

            <!-- Description Column -->
            <ng-container matColumnDef="description">
              <th mat-header-cell *matHeaderCellDef>Descripción</th>
              <td mat-cell *matCellDef="let category">{{category.description || '—'}}</td>
            </ng-container>

            <!-- Actions Column -->
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Acciones</th>
              <td mat-cell *matCellDef="let category">
                <button mat-icon-button color="primary" (click)="editCategory(category)" matTooltip="Editar">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button color="warn" (click)="deleteCategory(category)" matTooltip="Eliminar">
                  <mat-icon>delete</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
        </div>
      </mat-card>
    </div>
  `,
  styles: [
    `
    .admin-categories { max-width: 1200px; }
    .section-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:24px; }
    .section-header h2 { margin:0; color:#333; }
    .categories-table-card { overflow:hidden; }
    .table-container { overflow-x:auto; }
    .categories-table { width:100%; min-width:600px; }
    .category-thumb { width:48px; height:48px; object-fit:cover; border-radius:6px; }
    @media (max-width:768px) { .section-header { flex-direction:column; gap:16px; text-align:center; } }
    `
  ]
})
export class AdminCategoriesComponent implements OnInit {
  categories: Category[] = [];
  displayedColumns: string[] = ['image', 'name', 'description', 'actions'];

  constructor(
    private categoryService: CategoryService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (response) => {
        this.categories = response.categories;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.snackBar.open('Error al cargar categorías', 'Cerrar', { duration: 5000 });
      }
    });
  }

  openCategoryDialog(category?: Category): void {
    const dialogRef = this.dialog.open(CategoryFormDialogComponent, {
      width: '500px',
      data: { category: category || null }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) this.loadCategories();
    });
  }

  editCategory(category: Category): void {
    this.openCategoryDialog(category);
  }

  deleteCategory(category: Category): void {
    if (confirm(`¿Estás seguro de que quieres eliminar la categoría "${category.name}"?`)) {
      this.categoryService.deleteCategory(category.id).subscribe({
        next: () => {
          this.snackBar.open('Categoría eliminada correctamente', 'Cerrar', { duration: 3000 });
          this.loadCategories();
        },
        error: (error) => {
          this.snackBar.open(error.error?.error || 'Error al eliminar categoría', 'Cerrar', { duration: 5000 });
        }
      });
    }
  }
}
