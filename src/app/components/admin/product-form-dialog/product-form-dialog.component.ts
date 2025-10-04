import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProductService } from '../../../services/product.service';
import { Product, Category } from '../../../models/interfaces';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule as MatSpinner } from '@angular/material/progress-spinner';

interface DialogData {
  product: Product | null;
  categories: Category[];
}

@Component({
  selector: 'app-product-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatCardModule
  ],
  template: `
    <h2 mat-dialog-title>{{data.product ? 'Editar' : 'Nuevo'}} Producto</h2>
    
    <mat-dialog-content>
      <form [formGroup]="productForm" class="product-form">
        <mat-form-field class="full-width">
          <mat-label>Nombre del Producto</mat-label>
          <input matInput formControlName="name" required>
          <mat-error *ngIf="productForm.get('name')?.hasError('required')">
            El nombre es requerido
          </mat-error>
        </mat-form-field>

        <mat-form-field class="full-width">
          <mat-label>Descripción</mat-label>
          <textarea matInput rows="4" formControlName="description" required></textarea>
          <mat-error *ngIf="productForm.get('description')?.hasError('required')">
            La descripción es requerida
          </mat-error>
        </mat-form-field>

        <div class="form-row">
          <mat-form-field class="half-width">
            <mat-label>Precio</mat-label>
            <input matInput type="number" step="0.01" formControlName="price" required>
            <span matPrefix>$</span>
              <mat-error *ngIf="productForm.get('price')?.hasError('required')">
                El precio es requerido
              </mat-error>
              <mat-error *ngIf="productForm.get('price')?.hasError('min')">
                El precio debe ser mayor a 0
              </mat-error>
          </mat-form-field>

          <mat-form-field class="half-width">
            <mat-label>Stock</mat-label>
            <input matInput type="number" formControlName="stock" required>
              <mat-error *ngIf="productForm.get('stock')?.hasError('required')">
                El stock es requerido
              </mat-error>
              <mat-error *ngIf="productForm.get('stock')?.hasError('min')">
                El stock debe ser mayor o igual a 0
              </mat-error>
          </mat-form-field>
        </div>

        <mat-form-field class="full-width">
          <mat-label>Categoría</mat-label>
          <mat-select formControlName="categoryId" required>
            <mat-option *ngFor="let category of data.categories" [value]="category.id">
              {{category.name}}
            </mat-option>
          </mat-select>
          <mat-error *ngIf="productForm.get('categoryId')?.hasError('required')">
            La categoría es requerida
          </mat-error>
        </mat-form-field>

        <div class="checkbox-section">
          <mat-checkbox formControlName="featured">
            Producto Destacado
          </mat-checkbox>
        </div>

        <div class="image-section">
          <mat-form-field class="full-width">
            <mat-label>URL de Imagen (Opcional)</mat-label>
            <input matInput formControlName="image" placeholder="https://...">
          </mat-form-field>
        </div>
      </form>
    </mat-dialog-content>
    
    
  <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancelar</button>
      <button mat-raised-button color="primary" 
              [disabled]="productForm.invalid || loading" 
              (click)="onSave()">
        <ng-container *ngIf="loading">
          <mat-spinner diameter="20"></mat-spinner>
        </ng-container>
        <ng-container *ngIf="!loading">
          <span>{{data.product ? 'Actualizar' : 'Crear'}}</span>
        </ng-container>
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .product-form {
      min-width: 500px;
    }
    
    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }
    
    .form-row {
      display: flex;
      gap: 16px;
    }
    
    .half-width {
      flex: 1;
      margin-bottom: 16px;
    }
    
    .checkbox-section {
      margin-bottom: 16px;
    }
    
    .image-section {
      margin-bottom: 16px;
    }
    
    @media (max-width: 600px) {
      .product-form {
        min-width: 300px;
      }
      
      .form-row {
        flex-direction: column;
        gap: 0;
      }
    }
  `]
})
export class ProductFormDialogComponent implements OnInit {
  productForm: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private dialogRef: MatDialogRef<ProductFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private snackBar: MatSnackBar
  ) {
    this.productForm = this.fb.group({
      name: ['', [Validators.required]],
      description: ['', [Validators.required]],
      price: [0, [Validators.required, Validators.min(0.01)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      categoryId: ['', [Validators.required]],
      featured: [false],
      image: ['']
    });
  }

  ngOnInit(): void {
    if (this.data.product) {
      this.productForm.patchValue({
        name: this.data.product.name,
        description: this.data.product.description,
        price: this.data.product.price,
        stock: this.data.product.stock,
        categoryId: this.data.product.categoryId,
        featured: this.data.product.featured,
        image: this.data.product.image || ''
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.productForm.valid) {
      this.loading = true;
      // Build a plain JSON payload so backend receives fields in req.body
      const payload = {
        name: this.productForm.value.name,
        description: this.productForm.value.description,
        price: Number(this.productForm.value.price),
        stock: Number(this.productForm.value.stock),
        categoryId: Number(this.productForm.value.categoryId),
        featured: Boolean(this.productForm.value.featured),
        image: this.productForm.value.image
      };

      const request = this.data.product
        ? this.productService.updateProduct(this.data.product.id, payload)
        : this.productService.createProduct(payload);

      request.subscribe({
        next: (response) => {
          this.snackBar.open(response.message, 'Cerrar', { duration: 3000 });
          this.dialogRef.close(true);
        },
        error: (error) => {
          this.loading = false;
          this.snackBar.open(error.error?.error || 'Error al guardar producto', 'Cerrar', { 
            duration: 5000 
          });
        }
      });
    }
  }
}