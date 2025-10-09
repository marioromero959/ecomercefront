import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService, ProductsResponse } from '../../services/product.service';
import { CategoryService } from '../../services/category.service';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Product, Category } from '../../models/interfaces';
import { signal, WritableSignal } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatIcon } from '@angular/material/icon';
import { PageEvent } from '@angular/material/paginator';
import { MatCard, MatCardActions, MatCardContent, MatCardHeader, MatCardSubtitle, MatCardTitle } from '@angular/material/card';
import { MatButton } from '@angular/material/button';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatSelect, MatOption } from '@angular/material/select';
import { SlicePipe } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-product-list',
  standalone:true,
  imports: [MatPaginator, MatIcon, MatCardActions, MatCardContent, MatCardSubtitle, MatCardTitle, MatCardHeader, MatCard, MatButton, MatOption, MatSelect, MatFormField, MatLabel, MatInput, SlicePipe, ReactiveFormsModule],
  template: `
    <div class="product-list-container">
      <!-- Filters -->
      <div class="filters-section">
        <mat-card class="filters-card vertical">
          <div class="filters-column">
            <h3 class="filters-title">Filtros</h3>
            <mat-form-field class="filter-field compact">
              <mat-label>Buscar</mat-label>
              <input matInput (keyup.enter)="applyFilters()" [formControl]="searchTerm" placeholder="Buscar...">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>

            <mat-form-field class="filter-field compact">
              <mat-label>Categoría</mat-label>
              <mat-select [(value)]="selectedCategory" (selectionChange)="applyFilters()">
                <mat-option value="">Todas</mat-option>
                @for(category of categories; track category.id){
                  <mat-option [value]="category.id.toString()">{{category.name}}</mat-option>
                }
              </mat-select>
            </mat-form-field>

            <div class="filter-actions">
              <button mat-flat-button color="primary" (click)="applyFilters()">Aplicar</button>
              <button mat-stroked-button color="accent" (click)="clearFilters()">Limpiar</button>
            </div>
          </div>
        </mat-card>
      </div>

      <!-- Products Grid -->
      <div class="products-section">
        <div class="products-header">
          <h2>Productos ({{totalProducts}})</h2>
        </div>

        @if(products.length > 0){
          <div class="products-grid">
          @for(product of products;track product.id){
            <mat-card class="product-card">
            <div class="product-image-container">
            <img [src]="product.image || 'assets/no-image.jpg'" 
            [alt]="product.name" class="product-image">
            <div class="product-overlay">
            <button mat-icon-button color="primary" (click)="viewProduct(product.id)">
            <mat-icon>visibility</mat-icon>
            </button>
            </div>
            </div>
            
            <mat-card-header>
            <mat-card-title>{{product.name}}</mat-card-title>
            <mat-card-subtitle>{{product.Category?.name}}</mat-card-subtitle>
            </mat-card-header>
            
            <mat-card-content>
            <p class="product-description">{{product.description | slice:0:100}}...</p>
            <div class="product-price">\${{product.price}}</div>
            <div class="product-stock" [class.low-stock]="product.stock < 10">
            Stock: {{product.stock}}
            </div>
            </mat-card-content>
            
            <mat-card-actions>
            <button mat-button color="primary" (click)="viewProduct(product.id)">
            Ver Detalles
            </button>
            <button mat-raised-button color="accent" 
            (click)="addToCart(product)" 
            [disabled]="product.stock === 0 || !isAuthenticated"
            class="add-to-cart-btn">
            <mat-icon>add_shopping_cart</mat-icon>
            Agregar
            </button>
            </mat-card-actions>
            </mat-card>
            }  
            </div>
          }@else{
          <div class="no-products-container">
            <div class="no-products">
              <mat-icon class="no-products-icon">inventory_2</mat-icon>
              <h3>No hay productos disponibles</h3>
              <p>No se encontraron productos con los filtros actuales. Intenta:</p>
              <ul class="suggestions">
                <li>Cambiar los términos de búsqueda</li>
                <li>Seleccionar una categoría diferente</li>
                <li>Limpiar todos los filtros</li>
              </ul>
              <button mat-raised-button color="primary" (click)="clearFilters()">
                <mat-icon>refresh</mat-icon>
                Limpiar Filtros
              </button>
            </div>
          </div>
          }

        <!-- Pagination -->
        <div class="products-pagination">
        @if(totalProducts > 0){
          <mat-paginator
            aria-label="Paginador de productos"
            [length]="totalProducts"
            [pageSize]="pageSize"
            [pageIndex]="currentPage - 1"
            [pageSizeOptions]="[12, 24, 48]"
            (page)="onPageChange($event)"
            class="paginator">
          </mat-paginator>
        }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .product-list-container {
      max-width: 1200px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: 300px 1fr;
      gap: 20px;
      padding: 20px;
    }
    
    .filters-card {
      position: sticky;
      top: 20px;
    }
    
  .filters-card.vertical { padding: 12px; max-width: 280px; }
  .filters-column { display:flex; flex-direction:column; gap:10px; }
  .filters-title { margin:0 0 4px 0; font-size:1.05rem; color:#333; }
  .filter-field { width:100%; }
  .filter-field.compact { width:100%; }
  .filter-actions { display:flex; gap:8px; justify-content:stretch; }
  .filter-actions button { flex:1; }
    
    .products-header {
      margin-bottom: 24px;
    }
    
    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 20px;
      margin-bottom: 24px;
    }
    
    .product-card {
      height: 100%;
      display: flex;
      flex-direction: column;
      transition: transform 0.3s, box-shadow 0.3s;
    }
    
    .product-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.15);
    }
    
    .product-image-container {
      position: relative;
      overflow: hidden;
    }
    
    .product-image {
      width: 100%;
      height: 200px;
      object-fit: cover;
      transition: transform 0.3s;
    }
    
    .product-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      opacity: 0;
      transition: opacity 0.3s;
    }
    
    .product-card:hover .product-overlay {
      opacity: 1;
    }
    
    .product-description {
      color: #666;
      margin-bottom: 16px;
    }
    
    .product-price {
      font-size: 1.5rem;
      font-weight: bold;
      color: #1976d2;
      margin-bottom: 8px;
    }
    
    .product-stock {
      color: #4caf50;
      font-weight: 500;
    }
    
    .product-stock.low-stock {
      color: #f44336;
    }
    
    .add-to-cart-btn {
      margin-left: auto;
    }
    
    .no-products-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 300px;
    }
    
    .no-products {
      text-align: center;
      padding: 40px 20px;
      max-width: 500px;
      color: #666;
      background: #f9f9f9;
      border-radius: 16px;
      border: 2px dashed #e0e0e0;
    }
    
    .no-products-icon {
      font-size: 4rem;
      width: 4rem;
      height: 4rem;
      margin-bottom: 16px;
      color: #9e9e9e;
    }
    
    .no-products h3 {
      margin-bottom: 16px;
      color: #333;
      font-weight: 600;
    }
    
    .no-products p {
      margin-bottom: 20px;
      color: #666;
    }
    
    .suggestions {
      text-align: left;
      display: inline-block;
      margin-bottom: 24px;
      color: #555;
    }
    
    .suggestions li {
      margin-bottom: 8px;
    }
    
    .clear-filters-btn {
      margin-top: 16px;
    }
    
    .paginator {
      background: white;
      border-radius: 8px;
    }

    .products-pagination {
      display: flex;
      justify-content: center;
      margin-top: 12px;
    }

    /* Ensure paginator controls remain visible even when single page */
    .mat-paginator-range-label, .mat-paginator-page-size {
      color: rgba(0,0,0,0.87);
    }
    
    @media (max-width: 768px) {
      .product-list-container {
        grid-template-columns: 1fr;
        gap: 16px;
        padding: 16px;
      }
      
      .filters-card {
        position: static;
      }
      
      .products-grid {
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      }
    }
  `]
})
export class ProductListComponent implements OnInit {
  // Signals
  private productsSignal: WritableSignal<Product[]> = signal<Product[]>([]);
  private categoriesSignal: WritableSignal<Category[]> = signal<Category[]>([]);
  private selectedCategorySignal: WritableSignal<string> = signal('');

  // expose legacy properties (template expects plain properties/syntax)
  get products(): Product[] { return this.productsSignal(); }
  get categories(): Category[] { return this.categoriesSignal(); }
  get selectedCategory(): string { return this.selectedCategorySignal(); }
  set selectedCategory(v: string) { this.selectedCategorySignal.set(v); }

  searchTerm = new FormControl('');
  currentPage = 1;
  pageSize = 12;
  totalProducts = 0;
  totalPages = 0;
  loading = false;

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private cartService: CartService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    // read query params and initialize signals
    this.route.queryParams.subscribe(params => {
      this.selectedCategorySignal.set(params['category'] || '');
      const search = params['search'] || '';
      this.currentPage = parseInt(params['page']) || 1;
      this.searchTerm.setValue(search, { emitEvent: false });
      this.loadProducts();
    });

    // debounce search and trigger filters
    let searchDebounceTimer: any = null;
    this.searchTerm.valueChanges.subscribe(val => {
      if (searchDebounceTimer) clearTimeout(searchDebounceTimer);
      searchDebounceTimer = setTimeout(() => {
        this.applyFilters();
      }, 300);
    });
  }

  get isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (response) => {
        this.categoriesSignal.set(response.categories);
      },
      error: (error) => {
        console.error('Error loading categories:', error);
      }
    });
  }

  loadProducts(): void {
    this.loading = true;
    const filters = {
      page: this.currentPage,
      limit: this.pageSize,
      ...(this.selectedCategorySignal() && { category: parseInt(this.selectedCategorySignal()) }),
      ...(this.searchTerm.value && { search: this.searchTerm.value })
    };

    this.productService.getProducts(filters).subscribe({
      next: (response: ProductsResponse) => {
        this.productsSignal.set(response.products);
        this.totalProducts = response.totalProducts;
        this.totalPages = response.totalPages;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    this.currentPage = 1;
    this.updateUrl();
    this.loadProducts();
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.updateUrl();
    this.loadProducts();
  }

  private updateUrl(): void {
    const queryParams: any = {};
    if (this.selectedCategory) queryParams.category = this.selectedCategory;
    if (this.searchTerm.value) queryParams.search = this.searchTerm.value;
    if (this.currentPage > 1) queryParams.page = this.currentPage;
    
    this.router.navigate([], { 
      relativeTo: this.route, 
      queryParams,
      queryParamsHandling: 'merge'
    });
  }

  viewProduct(id: number): void {
    this.router.navigate(['/products', id]);
  }

  addToCart(product: Product): void {
    if (!this.isAuthenticated) {
      this.snackBar.open('Debes iniciar sesión para agregar productos al carrito', 'Iniciar Sesión', {
        duration: 5000
      }).onAction().subscribe(() => {
        this.router.navigate(['/login']);
      });
      return;
    }

    this.cartService.addToCart(product.id, 1).subscribe({
      next: () => {
        this.snackBar.open('Producto agregado al carrito', 'Ver Carrito', {
          duration: 3000
        }).onAction().subscribe(() => {
          this.router.navigate(['/cart']);
        });
      },
      error: (error) => {
        this.snackBar.open(error.error?.error || 'Error al agregar al carrito', 'Cerrar', {
          duration: 5000
        });
      }
    });
  }

  clearFilters(): void {
    this.searchTerm.setValue('');
    this.selectedCategory = '';
    this.currentPage = 1;
    this.updateUrl();
    this.loadProducts();
  }
}