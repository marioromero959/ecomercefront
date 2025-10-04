import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogActions, MatDialogContent } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProductService } from '../../../services/product.service';
import { Product, Category } from '../../../models/interfaces';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardActions } from '@angular/material/card';
import { MatError, MatFormField, MatLabel, MatOption, MatSelect } from '@angular/material/select';
import { MatCheckbox } from '@angular/material/checkbox';

interface DialogData {
  product: Product | null;
  categories: Category[];
}

@Component({
  selector: 'app-product-form-dialog',
  standalone:true,
  imports: [MatProgressSpinnerModule,MatDialogActions,MatLabel,MatFormField,MatCheckbox,MatError,MatOption,MatSelect,ReactiveFormsModule,MatDialogContent],
  template: `
    <h2 mat-dialog-title>{{data.product ? 'Editar' : 'Nuevo'}} Producto</h2>
    
    <mat-dialog-content>
      <form [formGroup]="productForm" class="product-form">
        <mat-form-field class="full-width">
          <mat-label>Nombre del Producto</mat-label>
          <input matInput formControlName="name" required>
          @if(productForm.get('name')?.hasError('required')){
            <mat-error>
            El nombre es requerido
            </mat-error>
          }
        </mat-form-field>

        <mat-form-field class="full-width">
          <mat-label>Descripción</mat-label>
          <textarea matInput rows="4" formControlName="description" required></textarea>
          @if(productForm.get('description')?.hasError('required')){
            <mat-error>
            La descripción es requerida
            </mat-error>
          }
        </mat-form-field>

        <div class="form-row">
          <mat-form-field class="half-width">
            <mat-label>Precio</mat-label>
            <input matInput type="number" step="0.01" formControlName="price" required>
            <span matPrefix>$</span>
            @if(productForm.get('price')?.hasError('required')){
              <mat-error>
              El precio es requerido
              </mat-error>
            }
            @if(productForm.get('price')?.hasError('min')){
              <mat-error>
              El precio debe ser mayor a 0
              </mat-error>
            }
          </mat-form-field>

          <mat-form-field class="half-width">
            <mat-label>Stock</mat-label>
            <input matInput type="number" formControlName="stock" required>
            @if(productForm.get('stock')?.hasError('required')){
              <mat-error>
              El stock es requerido
              </mat-error>
            }
            @if(productForm.get('stock')?.hasError('min')){
              <mat-error>
              El stock debe ser mayor o igual a 0
              </mat-error>
            }
          </mat-form-field>
        </div>

        <mat-form-field class="full-width">
          <mat-label>Categoría</mat-label>
          <mat-select formControlName="categoryId" required>
            <mat-option *ngFor="let category of data.categories" [value]="category.id">
              {{category.name}}
            </mat-option>
          </mat-select>
          @if(productForm.get('categoryId')?.hasError('required')){
            <mat-error>
            La categoría es requerida
            </mat-error>
          }
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
        @if(loading){
          <mat-spinner diameter="20"></mat-spinner>
        }@else{
          <span>{{data.product ? 'Actualizar' : 'Crear'}}</span>
        }
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
      const formData = new FormData();
      
      Object.keys(this.productForm.value).forEach(key => {
        formData.append(key, this.productForm.value[key]);
      });

      const request = this.data.product 
        ? this.productService.updateProduct(this.data.product.id, formData)
        : this.productService.createProduct(formData);

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