import { Component, Inject, OnInit } from '@angular/core';
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

        <mat-form-field class="full-width">
          <mat-label>URL de Imagen (Opcional)</mat-label>
          <input matInput formControlName="image" placeholder="https://...">
        </mat-form-field>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancelar</button>
      <button mat-raised-button color="primary" 
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
  `]
})
export class CategoryFormDialogComponent implements OnInit {
  categoryForm: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private categoryService: CategoryService,
    private dialogRef: MatDialogRef<CategoryFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private snackBar: MatSnackBar
  ) {
    this.categoryForm = this.fb.group({
      name: ['', [Validators.required]],
      description: [''],
      image: ['']
    });
  }

  ngOnInit(): void {
    if (this.data.category) {
      this.categoryForm.patchValue({
        name: this.data.category.name,
        description: this.data.category.description || '',
        image: this.data.category.image || ''
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.categoryForm.valid) {
      this.loading = true;
      const formData = this.categoryForm.value;

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