import { Component, Inject, OnInit, viewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CategoryService } from '../../../services/category.service';
import { Category } from '../../../models/interfaces';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';

interface DialogData {
  category: Category | null;
}

@Component({
  selector: 'app-category-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatDividerModule
  ],
  template: `
    <h2 mat-dialog-title>{{data.category ? 'Editar' : 'Nueva'}} Categoría</h2>
    
    <mat-dialog-content>
      <form [formGroup]="categoryForm" class="category-form">
        <mat-form-field class="full-width">
          <mat-label>Nombre de la Categoría</mat-label>
          <input matInput formControlName="name" required>
          <mat-error *ngIf="categoryForm.get('name')?.hasError('required')">
            El nombre es requerido
          </mat-error>
        </mat-form-field>

        <mat-form-field class="full-width">
          <mat-label>Descripción (Opcional)</mat-label>
          <textarea matInput rows="4" formControlName="description"></textarea>
        </mat-form-field>

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
      <button mat-stroked-button (click)="onCancel()">Cancelar</button>
      <button mat-flat-button color="primary" 
              [disabled]="categoryForm.invalid || loading" 
              (click)="onSave()">
        <ng-container *ngIf="loading">
          <mat-spinner diameter="20"></mat-spinner>
        </ng-container>
        <ng-container *ngIf="!loading">
          <span>{{data.category ? 'Actualizar' : 'Crear'}}</span>
        </ng-container>
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .category-form {
      min-width: 400px;
    }
    
    .full-width {
      width: 100%;
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
  `]
})
export class CategoryFormDialogComponent implements OnInit {
  categoryForm: FormGroup;
  loading = false;
  imagenesProducto: File[] = [];
  blobs: { id: string; blob: string | ArrayBuffer }[] = [];
  fileInput = viewChild.required<ElementRef>('fileInput');

  
  constructor(
    private fb: FormBuilder,
    private categoryService: CategoryService,
    private dialogRef: MatDialogRef<CategoryFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private snackBar: MatSnackBar
  ) {
    this.categoryForm = this.fb.group({
      name: ['', [Validators.required]],
      description: ['']
    });
  }

  ngOnInit(): void {
    if (this.data.category) {
      this.categoryForm.patchValue({
        name: this.data.category.name,
        description: this.data.category.description || ''
      });
      
      // Mostrar la imagen existente si hay una
      if (this.data.category.image) {
        this.blobs.push({
          id: '0',
          blob: this.data.category.image
        });
      }
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

    cargarImg(e:FileList | any) {
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
    this.fileInput().nativeElement.value = '';
  }

  eliminarImg(id:number) {
    const image = this.blobs[id].blob;
    // Si la imagen es una URL (imagen existente) y no hay otras imágenes nuevas
    if (typeof image === 'string' && image.startsWith('http') && this.imagenesProducto.length === 0) {
      this.blobs = [];
      this.imagenesProducto = [];
    } else {
      this.imagenesProducto.splice(id, 1);
      this.blobs.splice(id, 1);
    }
  }

  onSave(): void {
    if (this.categoryForm.valid && (this.blobs.length > 0 || this.data.category)) {
      this.loading = true;
      const formData = new FormData();
      
      // Agregar datos básicos
      formData.append('name', this.categoryForm.get('name')?.value);
      formData.append('description', this.categoryForm.get('description')?.value);
      
      // Manejar imágenes
      if (this.imagenesProducto.length > 0) {
        // Si hay una nueva imagen
        formData.append('images', this.imagenesProducto[0]);
      } else if (this.blobs.length > 0) {
        // Si hay una URL existente
        formData.append('image', this.blobs[0].blob as string);
      } else {
        // Si no hay imagen, enviar null para indicar que se debe eliminar
        formData.append('image', '');
      }

      const request = this.data.category 
        ? this.categoryService.updateCategory(this.data.category.id, formData)
        : this.categoryService.createCategory(formData);

      request.subscribe({
        next: (response) => {
          this.snackBar.open(response.message, 'Cerrar', { duration: 3000 });
          this.dialogRef.close(true);
        },
        error: (error) => {
          this.loading = false;
          this.snackBar.open(error.error?.error || 'Error al guardar categoría', 'Cerrar', { 
            duration: 5000 
          });
        }
      });
    }
  }
}