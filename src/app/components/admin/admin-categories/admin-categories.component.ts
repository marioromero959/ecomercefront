import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CategoryService } from '../../../services/category.service';
import { Category } from '../../../models/interfaces';
import { CategoryFormDialogComponent } from '../category-form-dialog/category-form-dialog.component';
import { MatIcon } from '@angular/material/icon';
import { MatCard, MatCardActions, MatCardContent, MatCardHeader, MatCardTitle } from '@angular/material/card';

@Component({
  selector: 'app-admin-categories',
  standalone:true,
  imports: [MatIcon,MatCardActions,MatCardContent,MatCardTitle,MatCardHeader,MatCard],
  template: `
    <div class="admin-categories">
      <div class="section-header">
        <h2>Gestión de Categorías</h2>
        <button mat-raised-button color="primary" (click)="openCategoryDialog()">
          <mat-icon>add</mat-icon>
          Nueva Categoría
        </button>
      </div>

      <div class="categories-grid">
      @for(category of categories;track category.id){
        <mat-card class="category-card">
          <mat-card-header>
            <mat-card-title>{{category.name}}</mat-card-title>
          </mat-card-header>
          
          <mat-card-content>
          @if(category.description){
            <p>{{category.description}}</p>
          }@else{
            <p class="no-description">Sin descripción</p>
          }
          </mat-card-content>
          
          <mat-card-actions>
            <button mat-button color="primary" (click)="editCategory(category)">
              <mat-icon>edit</mat-icon>
              Editar
            </button>
            <button mat-button color="warn" (click)="deleteCategory(category)">
              <mat-icon>delete</mat-icon>
              Eliminar
            </button>
          </mat-card-actions>
        </mat-card>
        }
      </div>
    </div>
  `,
  styles: [`
    .admin-categories {
      max-width: 1200px;
    }
    
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }
    
    .section-header h2 {
      margin: 0;
      color: #333;
    }
    
    .categories-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
    }
    
    .category-card {
      transition: transform 0.3s;
    }
    
    .category-card:hover {
      transform: translateY(-2px);
    }
    
    .no-description {
      color: #666;
      font-style: italic;
    }
    
    @media (max-width: 768px) {
      .section-header {
        flex-direction: column;
        gap: 16px;
        text-align: center;
      }
      
      .categories-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class AdminCategoriesComponent implements OnInit {
  categories: Category[] = [];

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
      if (result) {
        this.loadCategories();
      }
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