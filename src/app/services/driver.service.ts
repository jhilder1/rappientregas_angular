import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_URL = 'http://localhost:5000';

export interface Driver {
  id?: string;
  name: string;
  email: string;
  phone: string;
  license_number: string;
  status: 'disponible' | 'ocupado' | 'inactivo';
  photo?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DriverService {
  constructor(private http: HttpClient) {}

  getAll(): Observable<Driver[]> {
    return this.http.get<Driver[]>(`${API_URL}/drivers`);
  }

  getById(id: string): Observable<Driver> {
    return this.http.get<Driver>(`${API_URL}/drivers/${id}`);
  }

  create(driver: Driver): Observable<Driver> {
    return this.http.post<Driver>(`${API_URL}/drivers`, driver);
  }

  update(id: string, driver: Driver): Observable<Driver> {
    return this.http.put<Driver>(`${API_URL}/drivers/${id}`, driver);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${API_URL}/drivers/${id}`);
  }
}



