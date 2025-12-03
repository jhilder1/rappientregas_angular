import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_URL = 'http://localhost:5000';

export interface Menu {
  id?: string;
  restaurant_id: string;
  product_id: string;
  available: boolean;
  price?: number;
  restaurant?: any;
  product?: any;
}

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  constructor(private http: HttpClient) {}

  getAll(): Observable<Menu[]> {
    return this.http.get<Menu[]>(`${API_URL}/menus`);
  }

  getById(id: string): Observable<Menu> {
    return this.http.get<Menu>(`${API_URL}/menus/${id}`);
  }

  create(menu: Menu): Observable<Menu> {
    return this.http.post<Menu>(`${API_URL}/menus`, menu);
  }

  update(id: string, menu: Menu): Observable<Menu> {
    return this.http.put<Menu>(`${API_URL}/menus/${id}`, menu);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${API_URL}/menus/${id}`);
  }

  getByRestaurant(restaurantId: string): Observable<Menu[]> {
    return this.http.get<Menu[]>(`${API_URL}/menus/restaurant/${restaurantId}`);
  }
}



