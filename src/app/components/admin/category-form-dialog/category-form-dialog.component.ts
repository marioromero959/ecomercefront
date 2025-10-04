import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogActions, MatDialogContent } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CategoryService } from '../../../services/category.service';
import { Category } from '../../../models/interfaces';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatError, MatFormField, MatLabel } from '@angular/material/select';
import { MatIcon } from '@angular/material/icon';

interface DialogData {
  category: Category | null;
}

@Component({
  standalone:true,
  imports: [MatProgressSpinnerModule,MatDialogActions,MatLabel,MatFormField,ReactiveFormsModule,MatError,MatDialogContent],
  selector: 'app-category-form-dialog',
  template: `
    <h2 mat-dialog-title>{{data.category ? 'Editar' : 'Nueva'}} Categoría</h2>
    
    <mat-dialog-content>
      <form [formGroup]="categoryForm" class="category-form">
        <mat-form-field class="full-width">
          <mat-label>Nombre de la Categoría</mat-label>
          <input matInput formControlName="name" required>
          @if(categoryForm.get('name')?.hasError('required')){
            <mat-error>
            El nombre es requerido
            </mat-error>
          }
        </mat-form-field>

        <mat-form-field class="full-width">
          <mat-label>Descripción (Opcional)</mat-label>
          <textarea matInput rows="4" formControlName="description"></textarea>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancelar</button>
      <button mat-raised-button color="primary" 
              [disabled]="categoryForm.invalid || loading" 
              (click)="onSave()">
        @if(loading){
          <mat-spinner diameter="20"></mat-spinner>
        }
        @if(!loading){
          <span>{{data.category ? 'Actualizar' : 'Crear'}}</span>
        }
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
      description: ['']
    });
  }

  ngOnInit(): void {
    if (this.data.category) {
      this.categoryForm.patchValue({
        name: this.data.category.name,
        description: this.data.category.description || ''
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