import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProductService } from '../../../services/product.service';
import { CategoryService } from '../../../services/category.service';
import { Product, Category } from '../../../models/interfaces';
import { ProductFormDialogComponent } from '../product-form-dialog/product-form-dialog.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatIcon } from '@angular/material/icon';
import { MatChip } from '@angular/material/chips';
import { MatTableModule } from '@angular/material/table';
import { MatCard } from '@angular/material/card';

@Component({
  selector: 'app-admin-products',
  standalone:true,
  imports: [MatPaginatorModule,MatIcon,MatChip,MatTableModule,MatCard,MatIcon],
  template: `
    <div class="admin-products">
      <div class="section-header">
        <h2>Gestión de Productos</h2>
        <button mat-raised-button color="primary" (click)="openProductDialog()">
          <mat-icon>add</mat-icon>
          Nuevo Producto
        </button>
      </div>

      <mat-card class="products-table-card">
        <div class="table-container">
          <table mat-table [dataSource]="products" class="products-table">
            <!-- Image Column -->
            <ng-container matColumnDef="image">
              <th mat-header-cell *matHeaderCellDef>Imagen</th>
              <td mat-cell *matCellDef="let product">
                <img [src]="product.image || 'assets/no-image.jpg'" 
                     [alt]="product.name" class="product-thumbnail">
              </td>
            </ng-container>

            <!-- Name Column -->
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Nombre</th>
              <td mat-cell *matCellDef="let product">
                <div class="product-name">
                  {{product.name}}
                  <mat-chip *ngIf="product.featured" color="accent" selected>Destacado</mat-chip>
                </div>
              </td>
            </ng-container>

            <!-- Category Column -->
            <ng-container matColumnDef="category">
              <th mat-header-cell *matHeaderCellDef>Categoría</th>
              <td mat-cell *matCellDef="let product">{{product.Category?.name}}</td>
            </ng-container>

            <!-- Price Column -->
            <ng-container matColumnDef="price">
              <th mat-header-cell *matHeaderCellDef>Precio</th>
              <td mat-cell *matCellDef="let product">
                <span class="price">\${{product.price}}</span>
              </td>
            </ng-container>

            <!-- Stock Column -->
            <ng-container matColumnDef="stock">
              <th mat-header-cell *matHeaderCellDef>Stock</th>
              <td mat-cell *matCellDef="let product">
                <span class="stock" [class.low-stock]="product.stock < 10">
                  {{product.stock}}
                </span>
              </td>
            </ng-container>

            <!-- Actions Column -->
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Acciones</th>
              <td mat-cell *matCellDef="let product">
                <button mat-icon-button color="primary" 
                        (click)="editProduct(product)" 
                        matTooltip="Editar">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button color="warn" 
                        (click)="deleteProduct(product)" 
                        matTooltip="Eliminar">
                  <mat-icon>delete</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
        </div>

        <mat-paginator 
          [length]="totalProducts"
          [pageSize]="pageSize"
          [pageSizeOptions]="[10, 25, 50]"
          (page)="onPageChange($event)">
        </mat-paginator>
      </mat-card>
    </div>
  `,
  styles: [`
    .admin-products {
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
    
    .products-table-card {
      overflow: hidden;
    }
    
    .table-container {
      overflow-x: auto;
    }
    
    .products-table {
      width: 100%;
      min-width: 600px;
    }
    
    .product-thumbnail {
      width: 50px;
      height: 50px;
      object-fit: cover;
      border-radius: 4px;
    }
    
    .product-name {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    
    .price {
      font-weight: 500;
      color: #1976d2;
    }
    
    .stock {
      font-weight: 500;
      color: #4caf50;
    }
    
    .stock.low-stock {
      color: #f44336;
    }
    
    @media (max-width: 768px) {
      .section-header {
        flex-direction: column;
        gap: 16px;
        text-align: center;
      }
    }
  `]
})
export class AdminProductsComponent implements OnInit {
  products: Product[] = [];
  categories: Category[] = [];
  displayedColumns: string[] = ['image', 'name', 'category', 'price', 'stock', 'actions'];
  totalProducts = 0;
  pageSize = 10;
  currentPage = 1;

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadCategories();
  }

  loadProducts(): void {
    this.productService.getProducts({ 
      page: this.currentPage, 
      limit: this.pageSize 
    }).subscribe({
      next: (response) => {
        this.products = response.products;
        this.totalProducts = response.totalProducts;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.snackBar.open('Error al cargar productos', 'Cerrar', { duration: 5000 });
      }
    });
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (response) => {
        this.categories = response.categories;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
      }
    });
  }

  openProductDialog(product?: Product): void {
    const dialogRef = this.dialog.open(ProductFormDialogComponent, {
      width: '600px',
      data: { 
        product: product || null, 
        categories: this.categories 
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadProducts();
      }
    });
  }

  editProduct(product: Product): void {
    this.openProductDialog(product);
  }

  deleteProduct(product: Product): void {
    if (confirm(`¿Estás seguro de que quieres eliminar "${product.name}"?`)) {
      this.productService.deleteProduct(product.id).subscribe({
        next: () => {
          this.snackBar.open('Producto eliminado correctamente', 'Cerrar', { duration: 3000 });
          this.loadProducts();
        },
        error: (error) => {
          this.snackBar.open(error.error?.error || 'Error al eliminar producto', 'Cerrar', { duration: 5000 });
        }
      });
    }
  }

  onPageChange(event: any): void {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadProducts();
  }
}