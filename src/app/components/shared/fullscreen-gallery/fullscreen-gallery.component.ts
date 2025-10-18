import { Component, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { CarouselModule, OwlOptions, CarouselComponent } from 'ngx-owl-carousel-o';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-fullscreen-gallery',
  standalone: true,
  imports: [CarouselModule, MatIconButton, MatIcon],
  template: `
    <div class="fullscreen-gallery" [class.visible]="visible" (click)="close()">
      <div class="gallery-overlay">
        <div class="gallery-controls">
          <div class="image-counter">
            {{currentSlide + 1}} / {{images.length}}
          </div>
          <button mat-icon-button class="close-button" (click)="close()">
            <mat-icon>close</mat-icon>
          </button>
        </div>
      </div>
      
      <div class="gallery-content" (click)="$event.stopPropagation()">
        <div class="carousel-container">
          <owl-carousel-o #owlCarousel [options]="galleryOptions" (changed)="onSlideChange($event)">
            @for(image of images; track image) {
              <ng-template carouselSlide>
                <div class="gallery-slide">
                  <img [src]="image" [alt]="'Imagen de producto'" (load)="onImageLoad()">
                </div>
              </ng-template>
            }
          </owl-carousel-o>
        </div>

        <button mat-icon-button class="nav-button prev" (click)="prevSlide($event)">
          <mat-icon>chevron_left</mat-icon>
        </button>
        <button mat-icon-button class="nav-button next" (click)="nextSlide($event)">
          <mat-icon>chevron_right</mat-icon>
        </button>
      </div>
    </div>
  `,
  styles: [`
    @keyframes zoomIn {
      from {
        opacity: 0;
        transform: translate(-50%, -50%) scale(0.3);
      }
      to {
        opacity: 1;
        transform: translate(-50%, -50%) scale(1);
      }
    }

    .fullscreen-gallery {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      z-index: 9999;
      display: flex;
      justify-content: center;
      align-items: center;
      opacity: 0;
      visibility: hidden;
      pointer-events: none;
      perspective: 1000px;
    }

    .fullscreen-gallery.visible {
      opacity: 1;
      visibility: visible;
      pointer-events: all;
    }

    @keyframes overlayFadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    .gallery-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.9);
      z-index: 9999;
      animation: overlayFadeIn 0.4s ease forwards;
    }

    .gallery-controls {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      padding: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      z-index: 10001;
    }

    .image-counter {
      color: white;
      font-size: 14px;
      background: rgba(0, 0, 0, 0.5);
      padding: 8px 12px;
      border-radius: 20px;
    }

    .gallery-content {
      position: fixed;
      top: 50%;
      left: 50%;
      width: 90vw;
      height: 90vh;
      z-index: 10000;
      transform-origin: center;
      animation: zoomIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      background: transparent;
      overflow: hidden;
      will-change: transform, opacity;
    }

    .carousel-container {
      width: 100%;
      height: 100%;
      position: relative;
      overflow: hidden;

      ::ng-deep .owl-stage-outer {
        height: 100%;
        overflow: hidden;
      }

      ::ng-deep .owl-stage {
        height: 100%;
        display: flex;
        align-items: center;
      }

      ::ng-deep .owl-item {
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
      }
    }

    .gallery-slide {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;

      img {
        max-width: 90%;
        max-height: 85vh;
        width: auto;
        height: auto;
        object-fit: contain;
        display: block;
      }
    }

    .nav-button {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      background: rgba(255, 255, 255, 0.2) !important;
      color: white !important;
      width: 48px !important;
      height: 48px !important;
      z-index: 10001;
      transition: background-color 0.3s ease;

      &:hover {
        background: rgba(255, 255, 255, 0.3) !important;
      }

      mat-icon {
        font-size: 36px;
        width: 36px;
        height: 36px;
      }
    }

    .prev {
      left: 20px;
    }

    .next {
      right: 20px;
    }

    ::ng-deep .owl-dots {
      position: fixed !important;
      bottom: 40px !important;
      left: 0 !important;
      width: 100% !important;
      display: flex !important;
      justify-content: center !important;
      gap: 8px !important;
      z-index: 10002 !important;
      padding: 10px !important;
    }

    ::ng-deep .owl-dot {
      span {
        width: 10px !important;
        height: 10px !important;
        margin: 0 4px !important;
        background: rgba(255, 255, 255, 0.5) !important;
        transition: all 0.3s ease !important;
        border-radius: 50% !important;
      }

      &.active span {
        background: white !important;
        transform: scale(1.2) !important;
      }
    }

    .gallery-slide {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 90vh;
      
      img {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
      }
    }

    .close-button {
      position: absolute;
      top: 20px;
      right: 20px;
      color: white;
      z-index: 1003;
      background: rgba(255, 255, 255, 0.1);
      
      &:hover {
        background: rgba(255, 255, 255, 0.2);
      }
    }

    ::ng-deep .owl-theme .owl-nav {
      margin-top: 0;
      position: absolute;
      top: 50%;
      width: 100%;
      transform: translateY(-50%);
      
      [class*='owl-'] {
        position: absolute;
        background: rgba(255, 255, 255, 0.1) !important;
        color: white !important;
        font-size: 24px !important;
        padding: 10px !important;
        margin: 0;
        border-radius: 50%;
        
        &:hover {
          background: rgba(255, 255, 255, 0.2) !important;
        }
      }
      
      .owl-prev {
        left: -50px;
      }
      
      .owl-next {
        right: -50px;
      }
    }

    ::ng-deep .owl-theme .owl-dots {
      position: absolute;
      bottom: 20px;
      width: 100%;
      
      .owl-dot span {
        background: rgba(255, 255, 255, 0.3);
      }
      
      .owl-dot.active span {
        background: white;
      }
    }
  `]
})
export class FullscreenGalleryComponent {
  @Input() images: string[] = [];
  @Input() visible = false;
  @Output() closeGallery = new EventEmitter<void>();
  @ViewChild('owlCarousel') owlCarousel!: CarouselComponent;

  currentSlide = 0;
  isImageLoaded = false;

  close(): void {
    this.closeGallery.emit();
  }

  prevSlide(event: Event): void {
    event.stopPropagation();
    this.owlCarousel.prev();
  }

  nextSlide(event: Event): void {
    event.stopPropagation();
    this.owlCarousel.next();
  }

  onImageLoad(): void {
    this.isImageLoaded = true;
  }

  onSlideChange(event: any) {
    if (event?.property?.name === 'position') {
      this.currentSlide = event.property.value;
    }
  }

  galleryOptions: OwlOptions = {
    loop: true,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    dots: true,
    dotsSpeed: 0,
    navSpeed: 0,
    navText: ['', ''],
    responsive: {
      0: {
        items: 1
      }
    },
    nav: false,
    center: false,
    autoHeight: false,
    animateIn: 'none',
    animateOut: 'none',
    smartSpeed: 0,
    slideTransition: 'none',
    items: 1,
    rewind: false,
    lazyLoad: false
  };
}