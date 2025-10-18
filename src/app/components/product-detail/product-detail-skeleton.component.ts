import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-product-detail-skeleton',
  standalone: true,
  imports: [MatCardModule, MatChipsModule, NgClass],
  template: `
    <div class="product-detail-container">
      <div class="breadcrumb skeleton-text"></div>

      <div class="product-detail-content">
        <!-- Image Gallery Skeleton -->
        <div class="product-image-section">
          <div class="skeleton-image pulse"></div>
        </div>

        <!-- Product Info Skeleton -->
        <div class="product-info-section">
          <mat-card class="product-info-card">
            <mat-card-header>
              <div class="skeleton-title pulse"></div>
              <div class="skeleton-chips">
                <div class="skeleton-chip pulse"></div>
              </div>
            </mat-card-header>

            <mat-card-content>
              <div class="price-section">
                <div class="skeleton-price pulse"></div>
                <div class="skeleton-stock pulse"></div>
              </div>

              <div class="description-section">
                <div class="skeleton-description-title pulse"></div>
                <div class="skeleton-description-line pulse"></div>
                <div class="skeleton-description-line pulse"></div>
                <div class="skeleton-description-line pulse"></div>
              </div>

              <div class="quantity-section">
                <div class="skeleton-select pulse"></div>
              </div>
            </mat-card-content>

            <mat-card-actions class="product-actions">
              <div class="skeleton-button pulse"></div>
              <div class="skeleton-button pulse"></div>
            </mat-card-actions>
          </mat-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .skeleton-text,
    .skeleton-title,
    .skeleton-chip,
    .skeleton-price,
    .skeleton-stock,
    .skeleton-description-title,
    .skeleton-description-line,
    .skeleton-select,
    .skeleton-button {
      background-color: #e0e0e0;
      border-radius: 4px;
    }

    .skeleton-image {
      width: 100%;
      height: 400px;
      background-color: #e0e0e0;
      border-radius: 8px;
    }

    .skeleton-title {
      width: 60%;
      height: 32px;
      margin-bottom: 16px;
    }

    .skeleton-chips {
      display: flex;
      gap: 8px;
      margin-bottom: 16px;
    }

    .skeleton-chip {
      width: 80px;
      height: 24px;
    }

    .skeleton-price {
      width: 120px;
      height: 40px;
    }

    .skeleton-stock {
      width: 100px;
      height: 24px;
    }

    .skeleton-description-title {
      width: 30%;
      height: 24px;
      margin-bottom: 16px;
    }

    .skeleton-description-line {
      width: 100%;
      height: 16px;
      margin-bottom: 8px;
    }

    .skeleton-select {
      width: 100%;
      height: 56px;
      margin-bottom: 16px;
    }

    .skeleton-button {
      width: 100%;
      height: 48px;
      margin-bottom: 8px;
    }

    .pulse {
      animation: pulse 1.5s infinite;
    }

    @keyframes pulse {
      0% {
        opacity: 1;
      }
      50% {
        opacity: 0.4;
      }
      100% {
        opacity: 1;
      }
    }

    .product-detail-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }

    .product-detail-content {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 40px;
      margin-bottom: 60px;
    }

    @media (max-width: 768px) {
      .product-detail-content {
        grid-template-columns: 1fr;
        gap: 20px;
      }
    }
  `]
})
export class ProductDetailSkeletonComponent {}