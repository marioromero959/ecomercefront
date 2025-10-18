import { Component, computed, effect, signal } from '@angular/core';
import { LoadingService } from '../../../services/loading.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  template: `
    @if (isLoading()) {
      <div class="loading-overlay">
        <mat-spinner diameter="50"></mat-spinner>
      </div>
    }
  `,
  styles: [`
    .loading-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
    }

    mat-spinner {
      ::ng-deep circle {
        stroke: #fff;
      }
    }
  `]
})
export class LoadingComponent {
  isLoading = computed(() => this.loadingService.loading());

  constructor(private loadingService: LoadingService) {
    effect(() => {
      console.log('Loading state changed:', this.isLoading());
    });
  }
}