import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_URL = 'http://localhost:5000';

export interface Product {
  id?: string;
  name: string;
  description?: string;
  price: number;
  category?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  constructor(private http: HttpClient) {}

  getAll(): Observable<Product[]> {
    return this.http.get<Product[]>(`${API_URL}/products`);
  }

  getById(id: string): Observable<Product> {
    return this.http.get<Product>(`${API_URL}/products/${id}`);
  }

  create(product: Product): Observable<Product> {
    return this.http.post<Product>(`${API_URL}/products`, product);
  }

  update(id: string, product: Product): Observable<Product> {
    return this.http.put<Product>(`${API_URL}/products/${id}`, product);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${API_URL}/products/${id}`);
  }
}



