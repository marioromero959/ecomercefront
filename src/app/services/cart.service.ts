import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, switchMap } from 'rxjs/operators';
import { CartItem } from '../models/interfaces';
import { environment } from '../../environments/environment';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly API_URL = `${environment.apiUrl}/cart`;
  private cartItemsSubject = new BehaviorSubject<CartItem[]>([]);
  private cartTotalSubject = new BehaviorSubject<number>(0);
  
  public cartItems$ = this.cartItemsSubject.asObservable();
  public cartTotal$ = this.cartTotalSubject.asObservable();
  // Observable with total item count (sum of quantities)
  public cartItemCount$ = this.cartItems$.pipe(
    map(items => items.reduce((count, item) => count + item.quantity, 0))
  );

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
        // After adding, refresh the cart from server and emit only the post response
        switchMap(postRes => this.getCart().pipe(
          // ignore inner response and return original post response downstream
          map(() => postRes)
        ))
      );
  }

  updateCartItem(id: number, quantity: number): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.API_URL}/${id}`, { quantity })
      .pipe(
        switchMap(res => this.getCart().pipe(map(() => res)))
      );
  }

  removeFromCart(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.API_URL}/${id}`)
      .pipe(
        switchMap(res => this.getCart().pipe(map(() => res)))
      );
  }

  clearCart(): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(this.API_URL)
      .pipe(
        tap(() => {
          // Clear local subjects immediately and then rely on server response if needed
          this.cartItemsSubject.next([]);
          this.cartTotalSubject.next(0);
        })
      );
  }

  /**
   * Force a refresh of the cart from the server and return its observable.
   */
  refreshCart(): Observable<{ cartItems: CartItem[]; total: string }> {
    return this.getCart();
  }

  getCartItemCount(): number {
    return this.cartItemsSubject.value.reduce((count, item) => count + item.quantity, 0);
  }
}