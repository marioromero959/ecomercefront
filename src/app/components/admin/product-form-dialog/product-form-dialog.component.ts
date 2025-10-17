import { Component, Inject, OnInit, ViewChild, ElementRef } from '@angular/core';
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
import { MatIconModule } from '@angular/material/icon';
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
    MatCardModule,
    MatIconModule
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

        <div class="image-upload-section">
          <div class="image-input">
            <input #fileInput 
                   type="file" 
                   (change)="cargarImg($event)" 
                   accept=".png,.jpg,.jpeg" 
                   multiple="multiple"
                   [style.display]="'none'">
            <button mat-raised-button 
                    color="primary" 
                    (click)="fileInput.click()"
                    [disabled]="blobs.length >= 8">
              <mat-icon>add_photo_alternate</mat-icon>
              Agregar Imágenes
            </button>
          </div>
          
          <div class="image-info">
            <p>Imágenes subidas: {{blobs.length}}/8</p>
            <p *ngIf="blobs.length > 0" class="hint-text">Click en la imagen para eliminar</p>
          </div>

          <div class="image-grid">
            <div *ngFor="let img of blobs; let i = index" class="image-container">
              <img [src]="img.blob" 
                   [alt]="'Imagen ' + (i + 1)" 
                   (click)="eliminarImg(i)"
                   class="preview-image">
              <button mat-icon-button 
                      color="warn" 
                      class="delete-button"
                      (click)="eliminarImg(i)">
                <mat-icon>close</mat-icon>
              </button>
            </div>
          </div>
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
    
    .image-upload-section {
      margin: 20px 0;
    }

    .image-input {
      display: flex;
      justify-content: center;
      margin-bottom: 16px;
    }

    .image-info {
      text-align: center;
      margin-bottom: 16px;
    }

    .hint-text {
      color: rgba(0, 0, 0, 0.6);
      font-size: 0.85em;
    }

    .image-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 16px;
      padding: 16px;
    }

    .image-container {
      position: relative;
      aspect-ratio: 1;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      transition: transform 0.2s ease;
    }

    .image-container:hover {
      transform: scale(1.02);
    }

    .preview-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      cursor: pointer;
    }

    .delete-button {
      position: absolute;
      top: 4px;
      right: 4px;
      background-color: rgba(255, 255, 255, 0.9);
    }

    .delete-button:hover {
      background-color: #f44336;
      color: white;
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
  imagenesProducto: File[] = [];
  blobs: { id: string; blob: string | ArrayBuffer }[] = [];
  @ViewChild('fileInput') fileInput!: ElementRef;

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
      featured: [false]
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
        featured: this.data.product.featured
      });

      // Mostrar las imágenes existentes
      if (this.data.product.images && Array.isArray(this.data.product.images)) {
        this.data.product.images.forEach((imageUrl, index) => {
          this.blobs.push({
            id: index.toString(),
            blob: imageUrl
          });
        });
      } else if (this.data.product.image) {
        // Soporte para productos con una sola imagen
        this.blobs.push({
          id: '0',
          blob: this.data.product.image
        });
      }
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  cargarImg(e: FileList | any) {
    let imagenes = e.target.files;
    for (const i in imagenes) {
      if (!isNaN(Number(i))) {
        let reader = new FileReader();
        let url = reader.readAsDataURL(imagenes[i]);
        reader.onloadend = () => {
          if (reader.result && !this.blobs.some(b => b.blob === reader.result))
            this.blobs.push({
              id: i,
              blob: reader.result,
            });
        };  
        if (
          !this.imagenesProducto
            .map((img) => img.name)
            .includes(imagenes[i].name)
        ){
          this.imagenesProducto.push(imagenes[i]);
        }
      }
    }
    this.fileInput.nativeElement.value = '';
  }

  eliminarImg(id: number) {
    const image = this.blobs[id].blob;
    // Si la imagen es una URL (imagen existente) y no hay otras imágenes nuevas
    if (typeof image === 'string' && image.startsWith('http') && this.imagenesProducto.length === 0) {
      // Eliminar de las imágenes existentes
      const existingImages = this.blobs.map(b => b.blob as string);
      existingImages.splice(id, 1);
      // Actualizar el array de blobs
      this.blobs = existingImages.map((url, i) => ({ id: i.toString(), blob: url }));
    } else {
      // Eliminar tanto del array de archivos como de blobs
      this.imagenesProducto.splice(id, 1);
      this.blobs.splice(id, 1);
    }
  }

  onSave(): void {
    if (this.productForm.valid && (this.blobs.length > 0 || this.data.product)) {
      this.loading = true;
      const formData = new FormData();
      
      // Agregar datos básicos
      formData.append('name', this.productForm.value.name);
      formData.append('description', this.productForm.value.description);
      formData.append('price', String(this.productForm.value.price));
      formData.append('stock', String(this.productForm.value.stock));
      formData.append('categoryId', String(this.productForm.value.categoryId));
      formData.append('featured', String(this.productForm.value.featured));
      
      // Agregar imágenes
      if (this.imagenesProducto.length > 0) {
        // Si hay nuevas imágenes, las agregamos
        this.imagenesProducto.forEach((imagen) => {
          formData.append('images', imagen);
        });
      } else if (this.blobs.length > 0) {
        // Si solo hay URLs existentes, las enviamos como array
        this.blobs.forEach(blob => {
          if (typeof blob.blob === 'string') {
            formData.append('images', blob.blob);
          }
        });
      } else {
        // Si no hay imágenes, enviamos null para indicar que se deben eliminar todas
        formData.append('images', '');
      }

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