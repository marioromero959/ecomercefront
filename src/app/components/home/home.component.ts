import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { CategoryService } from '../../services/category.service';
import { Product, Category } from '../../models/interfaces';
import { MatCard, MatCardActions, MatCardContent, MatCardHeader, MatCardSubtitle, MatCardTitle } from '@angular/material/card';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { SlicePipe } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone:true,
  imports: [MatCardActions, MatCardTitle, MatCardHeader, MatCard, MatCardContent, MatCardSubtitle, MatButton, MatIcon, SlicePipe],
  template: `
    <div class="home-container">
      <!-- Hero Section -->
      <section class="hero-section">
        <div class="hero-content">
          <h1>Bienvenido a nuestro E-Commerce</h1>
          <p>Encuentra los mejores productos al mejor precio</p>
          <button mat-raised-button color="primary" routerLink="/products">
            Ver Productos
          </button>
        </div>
      </section>

      <!-- Featured Products -->
      <section class="featured-section">
        <h2>Productos Destacados</h2>
        @if(featuredProducts.length > 0){ 
        <div class="products-grid">
        @for(product of featuredProducts;track product.id){
          <mat-card class="product-card">
            <img mat-card-image [src]="product.image || 'assets/no-image.jpg'" 
                 [alt]="product.name" class="product-image">
            <mat-card-header>
              <mat-card-title>{{product.name}}</mat-card-title>
              <mat-card-subtitle>\${{product.price}}</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <p>{{product.description | slice:0:100}}...</p>
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
            <button mat-raised-button color="primary" routerLink="/products">
              <mat-icon>store</mat-icon>
              Ver Todos los Productos
            </button>
          </div>
        </div>
        }
      </section>

      <!-- Categories Section -->
      <section class="categories-section">
        <h2>Categorías</h2>
        <div class="categories-grid">
        @for(category of categories; track category.id){  
        <mat-card class="category-card">
            <img mat-card-image [src]="category.image || 'assets/category-default.jpg'" 
                 [alt]="category.name">
            <mat-card-header>
              <mat-card-title>{{category.name}}</mat-card-title>
            </mat-card-header>
            <mat-card-actions>
              <button mat-raised-button color="primary" (click)="viewProductsByCategory(category.id)">
                Ver Productos
              </button>
            </mat-card-actions>
          </mat-card>
          }
        </div>
      </section>
    </div>
  `,
  styles: [`
    .home-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 20px;
    }
    
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
    
    .featured-section,
    .categories-section {
      margin-bottom: 60px;
    }
    
    .featured-section h2,
    .categories-section h2 {
      text-align: center;
      margin-bottom: 40px;
      font-size: 2.5rem;
      color: #333;
    }
    
    .products-grid,
    .categories-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
    }
    
    .product-card,
    .category-card {
      transition: transform 0.3s, box-shadow 0.3s;
    }
    
    .product-card:hover,
    .category-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.15);
    }
    
    .product-image {
      height: 200px;
      object-fit: cover;
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
    
    .no-featured-products button {
      margin-top: 16px;
    }
    
    @media (max-width: 768px) {
      .hero-content h1 {
        font-size: 2rem;
      }
      
      .products-grid,
      .categories-grid {
        grid-template-columns: 1fr;
      }
      
      .hero-section {
        padding: 40px 20px;
      }
    }
  `]
})
export class HomeComponent implements OnInit {
  featuredProducts: Product[] = [];
  categories: Category[] = [];

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadFeaturedProducts();
    this.loadCategories();
  }

  loadFeaturedProducts(): void {
    this.productService.getProducts({ featured: true, limit: 6 }).subscribe({
      next: (response) => {
        this.featuredProducts = response.products;
      },
      error: (error) => {
        console.error('Error loading featured products:', error);
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
    this.router.navigate(['/products'], { queryParams: { category: categoryId } });
  }
}