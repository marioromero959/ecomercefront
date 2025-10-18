import { Component, OnInit, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { CategoryService } from '../../services/category.service';
import { Product, Category } from '../../models/interfaces';
import { MatCard, MatCardActions, MatCardContent, MatCardHeader, MatCardSubtitle, MatCardTitle } from '@angular/material/card';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { DecimalPipe, SlicePipe } from '@angular/common';
import { ProductSkeletonComponent } from '../shared/product-skeleton/product-skeleton.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    MatCardActions, 
    MatCardTitle, 
    MatCardHeader, 
    MatCard, 
    MatCardContent, 
    MatCardSubtitle, 
    MatButton, 
    MatIcon, 
    RouterModule, 
    DecimalPipe,
    ProductSkeletonComponent
  ],
  template: `
    <div class="home-container">
      <!-- Hero Section -->
      <section class="hero-section">
        <div class="hero-content">
          <h1>Bienvenido a nuestro E-Commerce</h1>
          <p>Encuentra los mejores productos al mejor precio</p>
          <button mat-raised-button color="tertiary" routerLink="/products">
            Ver Productos
          </button>
          </div>
      </section>

      <!-- Categories Section (minimal) -->
      <section class="categories-section minimal">
        <h2>Categorías</h2>
        <div class="categories-strip" role="list">
          @for(category of categories; track category.id){
            <div class="category-pill" role="listitem" (click)="viewProductsByCategory(category.id)">
                <mat-icon>{{category.image}}</mat-icon>
              <div class="category-name">{{category.name}}</div>
            </div>
          }
        </div>
      </section>

      <!-- Featured Products -->
      <section class="featured-section compact-featured">
        <h2>Productos Destacados</h2>
        @if(loading) {
          <div class="products-grid compact-grid">
            @for(item of [1,2,3,4,5,6,7,8]; track $index) {
              <app-product-skeleton />
            }
          </div>
        } @else if(featuredProducts.length > 0) { 
        <div class="products-grid compact-grid">
        @for(product of featuredProducts;track product.id){
          <mat-card class="product-card compact-card">
            <img mat-card-image [src]="product.image || 'assets/no-image.jpg'" 
                 [alt]="product.name" class="product-image compact-image">
            <mat-card-header>
              <mat-card-title>{{product.name}}</mat-card-title>
              <mat-card-subtitle>\${{product.price | number}}</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <p>{{product.description}}</p>
            </mat-card-content>
            <mat-card-actions>
              <button mat-button color="primary" (click)="viewProduct(product.id)">
                Ver Detalles
              </button>
            </mat-card-actions>
          </mat-card>
          }
        </div>
        }@else{
        <div class="no-products-container">
          <div class="no-featured-products">
            <mat-icon class="no-products-icon">inventory_2</mat-icon>
            <h3>No hay productos destacados disponibles</h3>
            <p>Pronto agregaremos productos destacados. Revisa nuestra selección completa:</p>
            <button mat-stroked-button color="primary" routerLink="/products" class="outlined-hero">
              <mat-icon>store</mat-icon>
              Ver Todos los Productos
            </button>
          </div>
        </div>
        }
      </section>
    </div>
  `,
  styles: [`
    .home-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 20px;
    }

    /* Hero */
    .hero-section {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 80px 40px;
      border-radius: 12px;
      text-align: center;
      margin-bottom: 60px;
    }

    .hero-content h1 {
      font-size: 3rem;
      margin-bottom: 20px;
      font-weight: 300;
    }

    .hero-content p {
      font-size: 1.2rem;
      margin-bottom: 30px;
      opacity: 0.9;
    }

    .outlined-hero { background: transparent; }

    /* Featured / Categories sections */
    .featured-section,
    .categories-section {
      margin-bottom: 60px;
    }

    .featured-section h2,
    .categories-section h2 {
      text-align: center;
      margin-bottom: 40px;
      font-size: 2.5rem;
      font-weight: 300;
      color: #333;
    }

    /* General grids */
    .products-grid,
    .categories-grid {
      display: grid;
      /* Use clamp to make cards wider on larger screens but stay proportional */
      grid-template-columns: repeat(auto-fit, minmax(clamp(220px, 28%, 360px), 1fr));
      gap: 20px;
    }

    /* Minimal categories strip */
    .categories-section.minimal .categories-strip {
      display: flex;
      gap: 12px;
      align-items: center;
      justify-content: flex-start;
      padding: 8px 0;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
    }

    .category-pill {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 6px;
      min-width: 96px;
      width: 300px;
      padding: 8px;
      background: #fff;
      border-radius: 10px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
      cursor: pointer;
      transition: transform 0.15s, box-shadow 0.15s;
      text-align: center;
      .mat-icon { 
        font-size: 36px;
        width: 36px;
        height: 36px;
        color: #360068ff;
      }
    }

    .category-pill:hover {
      transform: translateY(-4px);
      box-shadow: 0 6px 18px rgba(0,0,0,0.12);
    }

    .category-thumb {
      width: 56px;
      height: 56px;
      object-fit: cover;
      border-radius: 50%;
      border: 2px solid #f0f0f0;
    }

    .category-name {
      font-size: 0.9rem;
      color: #333;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 84px;
    }

    .product-card,
    .category-card {
      transition: transform 0.3s, box-shadow 0.3s;
      display: flex;
      flex-direction: column;
      height: 100%;
      background: #fff;
    }

    .product-card:hover,
    .category-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.15);
    }

    /* Default product image (used elsewhere) */
    .product-image {
      height: 200px;
      object-fit: cover;
    }

    .product-card mat-card-content,
    .compact-card mat-card-content {
      flex: 1 1 auto;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
    }

    .product-card mat-card-actions,
    .compact-card mat-card-actions {
      margin-top: auto;
    }

    /* Truncate long titles so header doesn't expand card height */
    .product-card mat-card-title,
    .compact-card mat-card-title {
      display: block;
      color: #764ba2;
      font-weight: 400;
    }

    .compact-featured { margin-top: 18px; }
    .compact-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(clamp(180px, 22%, 300px),1fr)); gap:12px; align-items:start; }
    .compact-card { padding:10px; min-height: 360px; display:flex; flex-direction:column; }
    /* Show full image without cropping for featured cards */
    .compact-image { height:200px; object-fit:contain; background: #fff; border-radius:6px; }

    .product-card mat-card-title,
    .compact-card mat-card-title {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .no-products-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 200px;
      margin: 40px 0;
    }

    .no-featured-products {
      text-align: center;
      padding: 40px 20px;
      max-width: 400px;
      background: #f9f9f9;
      border-radius: 16px;
      color: #666;
    }

    .no-featured-products .no-products-icon {
      font-size: 3rem;
      width: 3rem;
      height: 3rem;
      margin-bottom: 16px;
      color: #9e9e9e;
    }

    .no-featured-products h3 {
      margin-bottom: 16px;
      color: #333;
      font-weight: 600;
    }

    .no-featured-products button { margin-top: 16px; }

    @media (max-width: 768px) {
      .hero-content h1 { font-size: 2rem; }
      .products-grid, .categories-grid { grid-template-columns: 1fr; }
      .hero-section { padding: 40px 20px; }
      .compact-grid { grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); }
      .compact-card { min-height: 320px; }
    }
  `]
})
export class HomeComponent implements OnInit {
  featuredProducts: Product[] = [];
  categories: Category[] = [];
  private loadingSignal = signal(false);
  get loading(): boolean { return this.loadingSignal(); }

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private router: Router
  ) { }
  ngOnInit(): void {
    this.loadCategories();
    this.loadFeaturedProducts();
  }

  loadFeaturedProducts(): void {
    this.loadingSignal.set(true);
    this.productService.getProducts({ featured: true, limit: 8 }).subscribe({
      next: (response) => {
        this.featuredProducts = response.products || [];
        this.loadingSignal.set(false);
      },
      error: (error) => {
        console.error('Error loading featured products:', error);
        this.loadingSignal.set(false);
      }
    });
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (response) => {
        this.categories = response.categories.slice(0, 6); // Show only first 6 categories
      },
      error: (error) => {
        console.error('Error loading categories:', error);
      }
    });
  }

  viewProduct(id: number): void {
    this.router.navigate(['/products', id]);
  }

  viewProductsByCategory(categoryId: number): void {
    // Navigate to products and set category filter + reset to first page
    this.router.navigate(['/products'], { queryParams: { category: categoryId, page: 1 } });
  }
}