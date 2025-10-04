import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CartItem } from '../models/interfaces';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly API_URL = `${environment.apiUrl}/cart`;
  private cartItemsSubject = new BehaviorSubject<CartItem[]>([]);
  private cartTotalSubject = new BehaviorSubject<number>(0);
  
  public cartItems$ = this.cartItemsSubject.asObservable();
  public cartTotal$ = this.cartTotalSubject.asObservable();

  constructor(private http: HttpClient) {}

  getCart(): Observable<{ cartItems: CartItem[]; total: string }> {
    return this.http.get<{ cartItems: CartItem[]; total: string }>(this.API_URL)
      .pipe(
        tap(response => {
          this.cartItemsSubject.next(response.cartItems);
          this.cartTotalSubject.next(parseFloat(response.total));
        })
      );
  }

  addToCart(productId: number, quantity: number = 1): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.API_URL}/add`, { productId, quantity })
      .pipe(
        tap(() => this.getCart().subscribe())
      );
  }

  updateCartItem(id: number, quantity: number): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.API_URL}/${id}`, { quantity })
      .pipe(
        tap(() => this.getCart().subscribe())
      );
  }

  removeFromCart(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.API_URL}/${id}`)
      .pipe(
        tap(() => this.getCart().subscribe())
      );
  }

  clearCart(): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(this.API_URL)
      .pipe(
        tap(() => {
          this.cartItemsSubject.next([]);
          this.cartTotalSubject.next(0);
        })
      );
  }

  getCartItemCount(): number {
    return this.cartItemsSubject.value.reduce((count, item) => count + item.quantity, 0);
  }
}