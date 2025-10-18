import { Component } from '@angular/core';
import { MatCard, MatCardContent, MatCardHeader } from '@angular/material/card';

@Component({
  selector: 'app-product-skeleton',
  standalone: true,
  imports: [MatCard, MatCardContent, MatCardHeader],
  template: `
    <mat-card class="skeleton-card">
      <div class="skeleton-image pulse"></div>
      <mat-card-header>
        <div class="skeleton-title pulse"></div>
        <div class="skeleton-subtitle pulse"></div>
      </mat-card-header>
      <mat-card-content>
        <div class="skeleton-description pulse"></div>
        <div class="skeleton-price pulse"></div>
        <div class="skeleton-stock pulse"></div>
      </mat-card-content>
      <div class="skeleton-actions">
        <div class="skeleton-button pulse"></div>
        <div class="skeleton-button pulse"></div>
      </div>
    </mat-card>
  `,
  styles: [`
    .skeleton-card {
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .skeleton-image {
      width: 100%;
      height: 200px;
      background-color: #e0e0e0;
      border-radius: 4px;
    }

    .skeleton-title {
      width: 80%;
      height: 24px;
      background-color: #e0e0e0;
      margin: 16px 0 8px;
      border-radius: 4px;
    }

    .skeleton-subtitle {
      width: 60%;
      height: 16px;
      background-color: #e0e0e0;
      margin-bottom: 16px;
      border-radius: 4px;
    }

    .skeleton-description {
      width: 100%;
      height: 60px;
      background-color: #e0e0e0;
      margin-bottom: 16px;
      border-radius: 4px;
    }

    .skeleton-price {
      width: 40%;
      height: 32px;
      background-color: #e0e0e0;
      margin-bottom: 8px;
      border-radius: 4px;
    }

    .skeleton-stock {
      width: 30%;
      height: 20px;
      background-color: #e0e0e0;
      margin-bottom: 16px;
      border-radius: 4px;
    }

    .skeleton-actions {
      display: flex;
      justify-content: space-between;
      padding: 8px;
    }

    .skeleton-button {
      width: 45%;
      height: 36px;
      background-color: #e0e0e0;
      border-radius: 4px;
    }

    .pulse {
      animation: pulse 1.5s ease-in-out infinite;
    }

    @keyframes pulse {
      0% { opacity: 0.6; }
      50% { opacity: 0.8; }
      100% { opacity: 0.6; }
    }
  `]
})
export class ProductSkeletonComponent {}