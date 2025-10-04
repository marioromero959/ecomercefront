import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../models/interfaces';
import { environment } from '../../environments/environment';

export interface ProductsResponse {
  products: Product[];
  totalPages: number;
  currentPage: number;
  totalProducts: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly API_URL = `${environment.apiUrl}/products`;

  constructor(private http: HttpClient) {}

  getProducts(filters?: {
    page?: number;
    limit?: number;
    category?: number;
    search?: string;
    featured?: boolean;
  }): Observable<ProductsResponse> {
    let params = new HttpParams();
    
    if (filters) {
      if (filters.page) params = params.set('page', filters.page.toString());
      if (filters.limit) params = params.set('limit', filters.limit.toString());
      if (filters.category) params = params.set('category', filters.category.toString());
      if (filters.search) params = params.set('search', filters.search);
      if (filters.featured !== undefined) params = params.set('featured', filters.featured.toString());
    }

    return this.http.get<ProductsResponse>(this.API_URL, { params });
  }

  getProduct(id: number): Observable<{ product: Product }> {
    return this.http.get<{ product: Product }>(`${this.API_URL}/${id}`);
  }

  // Accept a plain object (JSON) payload or FormData if necessary.
  createProduct(productData: any): Observable<{ product: Product; message: string }> {
    return this.http.post<{ product: Product; message: string }>(this.API_URL, productData);
  }

  updateProduct(id: number, productData: any): Observable<{ product: Product; message: string }> {
    return this.http.put<{ product: Product; message: string }>(`${this.API_URL}/${id}`, productData);
  }

  deleteProduct(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.API_URL}/${id}`);
  }
}

