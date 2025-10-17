import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="gallery-container">
      <div class="main-image-container">
        <img [src]="images[currentImageIndex]" [alt]="'Imagen ' + (currentImageIndex + 1)" class="main-image">
        
        <!-- Botones de navegación -->
        <button mat-mini-fab 
                class="nav-button prev" 
                (click)="previous()"
                *ngIf="images.length > 1 && currentImageIndex > 0">
          <mat-icon>chevron_left</mat-icon>
        </button>
        <button mat-mini-fab 
                class="nav-button next" 
                (click)="next()"
                *ngIf="images.length > 1 && currentImageIndex < images.length - 1">
          <mat-icon>chevron_right</mat-icon>
        </button>
      </div>

      <!-- Thumbnails -->
      <div class="thumbnails-container" *ngIf="images.length > 1">
        <div class="thumbnails-scroll">
          <div class="thumbnail" 
               *ngFor="let image of images; let i = index"
               [class.active]="i === currentImageIndex"
               (click)="selectImage(i)">
            <img [src]="image" [alt]="'Thumbnail ' + (i + 1)">
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .gallery-container {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      width: 100%;
      max-width: 600px;
      margin: 0 auto;
    }

    .main-image-container {
      position: relative;
      width: 100%;
      aspect-ratio: 1;
      background-color: #f5f5f5;
      border-radius: 8px;
      overflow: hidden;
    }

    .main-image {
      width: 100%;
      height: 100%;
      object-fit: contain;
      transition: transform 0.3s ease;
    }

    .nav-button {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      background-color: rgba(255, 255, 255, 0.9) !important;
      z-index: 2;
    }

    .prev {
      left: 1rem;
    }

    .next {
      right: 1rem;
    }

    .thumbnails-container {
      width: 100%;
      overflow: hidden;
    }

    .thumbnails-scroll {
      display: flex;
      gap: 0.5rem;
      overflow-x: auto;
      padding: 0.5rem;
      scrollbar-width: thin;
      &::-webkit-scrollbar {
        height: 6px;
      }
      &::-webkit-scrollbar-track {
        background: #f1f1f1;
      }
      &::-webkit-scrollbar-thumb {
        background: #888;
        border-radius: 3px;
      }
    }

    .thumbnail {
      flex: 0 0 80px;
      height: 80px;
      border-radius: 4px;
      overflow: hidden;
      cursor: pointer;
      opacity: 0.7;
      transition: all 0.2s ease;
      border: 2px solid transparent;

      &:hover {
        opacity: 0.9;
      }

      &.active {
        opacity: 1;
        border-color: #673ab7;
      }

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    @media (max-width: 600px) {
      .gallery-container {
        max-width: 100%;
      }

      .thumbnail {
        flex: 0 0 60px;
        height: 60px;
      }
    }
  `]
})
export class GalleryComponent {
  @Input() images: string[] = [];
  currentImageIndex = 0;

  previous(): void {
    if (this.currentImageIndex > 0) {
      this.currentImageIndex--;
    }
  }

  next(): void {
    if (this.currentImageIndex < this.images.length - 1) {
      this.currentImageIndex++;
    }
  }

  selectImage(index: number): void {
    this.currentImageIndex = index;
  }
}