import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category } from '../models/interfaces';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private readonly API_URL = `${environment.apiUrl}/categories`;

  constructor(private http: HttpClient) {}

  getCategories(): Observable<{ categories: Category[] }> {
    return this.http.get<{ categories: Category[] }>(this.API_URL);
  }

  createCategory(categoryData: any): Observable<{ category: Category; message: string }> {
    return this.http.post<{ category: Category; message: string }>(this.API_URL, categoryData);
  }

  updateCategory(id: number, categoryData: any): Observable<{ category: Category; message: string }> {
    return this.http.put<{ category: Category; message: string }>(`${this.API_URL}/${id}`, categoryData);
  }

  deleteCategory(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.API_URL}/${id}`);
  }
}