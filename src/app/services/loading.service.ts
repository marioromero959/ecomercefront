import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private isLoading = signal(false);
  loading = this.isLoading.asReadonly();

  show(): void {
    console.log('Loading shown');
    this.isLoading.set(true);
  }

  hide(): void {
    console.log('Loading hidden');
    this.isLoading.set(false);
  }
}