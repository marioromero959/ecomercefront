
import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { LoadingService } from '../../services/loading.service';
import { GalleryComponent } from '../shared/gallery/gallery.component';
import { ProductDetailSkeletonComponent } from './product-detail-skeleton.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Product } from '../../models/interfaces';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCard, MatCardActions, MatCardContent, MatCardHeader } from '@angular/material/card';
import { MatCardSubtitle } from '@angular/material/card';
import { MatCardTitle } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatOption } from '@angular/material/autocomplete';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatSelect } from '@angular/material/select';
import { MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { MatChip, MatChipListbox, MatChipsModule } from '@angular/material/chips';
import { CarouselModule, OwlOptions } from 'ngx-owl-carousel-o';

@Component({
  selector: 'app-product-detail',
  standalone:true,
  imports: [
    MatProgressSpinnerModule, 
    MatCardActions, 
    MatCardSubtitle, 
    MatCardTitle, 
    MatCardHeader, 
    MatCard, 
    MatCardContent, 
    MatIcon, 
    MatButton, 
    MatOption, 
    MatSelect, 
    MatLabel, 
    MatFormField, 
    MatChipsModule, 
    MatChipListbox, 
    RouterModule,
    GalleryComponent,
    ProductDetailSkeletonComponent,
    CarouselModule
  ],
  template: `
  @if(isLoading()) {
    <app-product-detail-skeleton />
  } @else if(product) {
    <div class="product-detail-container">
      <div class="breadcrumb">
        <button mat-button routerLink="/products">
          <mat-icon>arrow_back</mat-icon>
          Volver a productos
        </button>
      </div>

      <div class="product-detail-content">
        <!-- Product Gallery -->
        <div class="product-image-section">
          <app-gallery [images]="productImages"></app-gallery>
        </div>

        <!-- Product Info -->
        <div class="product-info-section">
          <mat-card class="product-info-card">
            <mat-card-header>
              <mat-card-title class="product-title">{{product.name}}</mat-card-title>
              <mat-card-subtitle>
                <mat-chip-listbox>
                  <mat-chip color="primary" selected>{{product.Category?.name}}</mat-chip>
                  <mat-chip *ngIf="product.featured" color="accent" selected>Destacado</mat-chip>
                </mat-chip-listbox>
              </mat-card-subtitle>
            </mat-card-header>

            <mat-card-content>
              <div class="price-section">
                <div class="product-price">\${{product.price}}</div>
                <div class="stock-info" [class.low-stock]="product.stock < 10">
                  <mat-icon>inventory</mat-icon>
                  <span>{{product.stock}} disponibles</span>
                </div>
              </div>

              <div class="description-section">
                <h3>Descripción</h3>
                <p>{{product.description}}</p>
              </div>

              <div class="quantity-section">
                <mat-form-field appearance="outline">
                  <mat-label>Cantidad</mat-label>
                  <mat-select [(value)]="selectedQuantity">
                  @for(qty of getQuantityOptions(); track qty){
                    <mat-option>
                    {{qty}}
                    </mat-option>
                    }
                  </mat-select>
                </mat-form-field>
              </div>
            </mat-card-content>

            <mat-card-actions class="product-actions">
              <button mat-raised-button color="primary" 
                      class="add-to-cart-button"
                      [disabled]="product.stock === 0 || !isAuthenticated"
                      (click)="addToCart()">
                <mat-icon>add_shopping_cart</mat-icon>
                Agregar al Carrito
              </button>
              
              <button mat-button color="accent" 
                      [disabled]="!isAuthenticated"
                      (click)="buyNow()">
                Comprar Ahora
              </button>

              @if(!isAuthenticated){
                <div class="auth-notice">
                <mat-icon>info</mat-icon>
                <span>
                <a routerLink="/login">Inicia sesión</a> para comprar
                </span>
                </div>
              }
            </mat-card-actions>
          </mat-card>
        </div>
      </div>

      <!-- Related Products -->
      @if(relatedProducts.length > 0){
      <div class="related-products-section">
        <h3>Productos que te pueden interesar</h3>
        <owl-carousel-o [options]="relatedProductsOptions">
          @for(relatedProduct of relatedProducts; track relatedProduct.id) {
            <ng-template carouselSlide>
              <mat-card class="related-product-card">
                <img mat-card-image [src]="relatedProduct.image || 'assets/no-image.jpg'" 
                    [alt]="relatedProduct.name" class="related-product-image">
                <mat-card-header>
                  <mat-card-title>{{relatedProduct.name}}</mat-card-title>
                  <mat-card-subtitle>\${{relatedProduct.price}}</mat-card-subtitle>
                </mat-card-header>
                <mat-card-actions>
                  <button mat-button color="primary" [routerLink]="['/products', relatedProduct.id]">
                    Ver Producto
                  </button>
                </mat-card-actions>
              </mat-card>
            </ng-template>
          }
        </owl-carousel-o>
      </div>
      }
    </div>

    
  }

  `,
  styles: [`
    .product-detail-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    
    .breadcrumb {
      margin-bottom: 20px;
    }
    
    .product-detail-content {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 40px;
      margin-bottom: 60px;
    }
    
    .product-image-section {
      display: flex;
      justify-content: center;
      align-items: flex-start;
      width: 100%;
      max-width: 600px;
      margin: 0 auto;
    }
    
    .product-info-card {
      height: fit-content;
    }
    
    .product-title {
      font-size: 2rem;
      margin-bottom: 16px;
    }
    
    .price-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      padding: 16px;
      background-color: #f5f5f5;
      border-radius: 8px;
    }
    
    .product-price {
      font-size: 2.5rem;
      font-weight: bold;
      color: #1976d2;
    }
    
    .stock-info {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #4caf50;
      font-weight: 500;
    }
    
    .stock-info.low-stock {
      color: #f44336;
    }
    
    .description-section {
      margin-bottom: 24px;
    }
    
    .description-section h3 {
      margin-bottom: 16px;
      color: #333;
    }
    
    .quantity-section {
      margin-bottom: 24px;
    }
    
    .product-actions {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    
    .add-to-cart-button {
      height: 48px;
    }
    
    .auth-notice {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #666;
      font-size: 0.9rem;
    }
    
    .auth-notice a {
      color: #1976d2;
      text-decoration: none;
    }
    
    .related-products-section {
      margin-top: 60px;
    }
    
    .related-products-section h3 {
      margin-bottom: 24px;
      font-size: 1.8rem;
      color: #333;
      font-weight: 400;
    }
    
    .related-product-card {
      margin: 10px;
      transition: transform 0.3s;
    }
    
    .related-product-card:hover {
      transform: translateY(-5px);
    }
    
    .related-product-image {
      height: 200px;
      object-fit: cover;
    }
    
    .loading-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 50vh;
    }
    
    ::ng-deep .owl-nav {
      position: absolute;
      top: 50%;
      width: 100%;
      transform: translateY(-50%);
      display: flex;
      justify-content: space-between;
      pointer-events: none;
      
      button {
        pointer-events: all;
        width: 40px;
        height: 40px;
        border-radius: 50% !important;
        background: rgba(255, 255, 255, 0.9) !important;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        color: #333 !important;
        
        &:hover {
          background: white !important;
          color: #1976d2 !important;
        }
        
        span {
          font-size: 1.5rem;
          line-height: 1;
        }
      }
      
      .owl-prev {
        margin-left: -20px;
      }
      
      .owl-next {
        margin-right: -20px;
      }
    }
    
    @media (max-width: 768px) {
      .product-detail-content {
        grid-template-columns: 1fr;
        gap: 20px;
      }
      
      .price-section {
        flex-direction: column;
        gap: 16px;
        text-align: center;
      }
      
      ::ng-deep .owl-nav {
        .owl-prev {
          margin-left: -10px;
        }
        
        .owl-next {
          margin-right: -10px;
        }
      }
    }
  `]
})
export class ProductDetailComponent implements OnInit {
  product: Product | null = null;
  relatedProducts: Product[] = [];
  selectedQuantity = 1;
  isLoading = signal(true);
  productImages: string[] = [];

  relatedProductsOptions: OwlOptions = {
    loop: true,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: false,
    dots: false,
    navSpeed: 700,
    navText: ['<i class="fas fa-chevron-left"></i>', '<i class="fas fa-chevron-right"></i>'],
    responsive: {
      0: {
        items: 1
      },
      576: {
        items: 2
      },
      768: {
        items: 3
      },
      992: {
        items: 4
      }
    },
    nav: true
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private cartService: CartService,
    private authService: AuthService,
    private loadingService: LoadingService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = parseInt(params['id']);
      if (id) {
        this.loadProduct(id);
      }
    });
  }

  get isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  loadProduct(id: number): void {
    this.isLoading.set(true);
    this.loadingService.show();

    this.productService.getProduct(id).subscribe({
      next: (response) => {
        this.product = response.product;
        // Manejar las imágenes del producto
        if (this.product.images && Array.isArray(this.product.images)) {
          this.productImages = this.product.images;
        } else if (this.product.image) {
          // Si solo hay una imagen, la ponemos en un array
          this.productImages = [this.product.image];
        } else {
          // Si no hay imágenes, usamos una imagen por defecto
          this.productImages = ['assets/no-image.jpg'];
        }
        this.loadRelatedProducts();
        this.isLoading.set(false);
        this.loadingService.hide();
      },
      error: (error) => {
        console.error('Error loading product:', error);
        this.isLoading.set(false);
        this.loadingService.hide();
        this.router.navigate(['/products']);
      }
    });
  }

  loadRelatedProducts(): void {
    if (this.product?.categoryId) {
      this.productService.getProducts({ 
        category: this.product.categoryId, 
        limit: 4 
      }).subscribe({
        next: (response) => {
          this.relatedProducts = response.products.filter(p => p.id !== this.product!.id);
        },
        error: (error) => {
          console.error('Error loading related products:', error);
        }
      });
    }
  }

  getQuantityOptions(): number[] {
    if (!this.product) return [1];
    const maxQty = Math.min(this.product.stock, 10);
    return Array.from({ length: maxQty }, (_, i) => i + 1);
  }

  addToCart(): void {
    if (!this.isAuthenticated) {
      this.snackBar.open('Debes iniciar sesión para agregar productos al carrito', 'Iniciar Sesión', {
        duration: 5000
      }).onAction().subscribe(() => {
        this.router.navigate(['/login']);
      });
      return;
    }

    if (this.product) {
      this.cartService.addToCart(this.product.id, this.selectedQuantity).subscribe({
        next: () => {
          this.snackBar.open(`${this.selectedQuantity} producto(s) agregado(s) al carrito`, 'Ver Carrito', {
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
  }

  buyNow(): void {
    this.addToCart();
    // After adding to cart, navigate to cart
    setTimeout(() => {
      this.router.navigate(['/cart']);
    }, 1000);
  }
}