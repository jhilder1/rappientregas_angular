import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_URL = 'http://localhost:5000';

export interface Restaurant {
  id?: string;
  name: string;
  address: string;
  phone: string;
  email?: string;
  description?: string;
}

@Injectable({
  providedIn: 'root'
})
export class RestaurantService {
  constructor(private http: HttpClient) {}

  getAll(): Observable<Restaurant[]> {
    return this.http.get<Restaurant[]>(`${API_URL}/restaurants`);
  }

  getById(id: string): Observable<Restaurant> {
    return this.http.get<Restaurant>(`${API_URL}/restaurants/${id}`);
  }

  create(restaurant: Restaurant): Observable<Restaurant> {
    return this.http.post<Restaurant>(`${API_URL}/restaurants`, restaurant);
  }

  update(id: string, restaurant: Restaurant): Observable<Restaurant> {
    return this.http.put<Restaurant>(`${API_URL}/restaurants/${id}`, restaurant);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${API_URL}/restaurants/${id}`);
  }
}



