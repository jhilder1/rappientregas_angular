import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_URL = 'http://localhost:5000';

export interface Motorcycle {
  id?: string;
  license_plate?: string;
  plate?: string;
  brand: string;
  model?: string;
  year: number;
  color?: string;
  status: 'available' | 'busy' | 'disponible' | 'en_uso' | 'mantenimiento';
  current_latitude?: number;
  current_longitude?: number;
}

@Injectable({
  providedIn: 'root'
})
export class MotorcycleService {
  constructor(private http: HttpClient) {}

  getAll(): Observable<Motorcycle[]> {
    return this.http.get<Motorcycle[]>(`${API_URL}/motorcycles`);
  }

  getById(id: string): Observable<Motorcycle> {
    return this.http.get<Motorcycle>(`${API_URL}/motorcycles/${id}`);
  }

  getByPlate(plate: string): Observable<Motorcycle> {
    return this.http.get<Motorcycle>(`${API_URL}/motorcycles/plate/${plate}`);
  }

  getByLicensePlate(licensePlate: string): Observable<Motorcycle> {
    return this.http.get<Motorcycle>(`${API_URL}/motorcycles/plate/${licensePlate}`);
  }

  create(motorcycle: Motorcycle): Observable<Motorcycle> {
    return this.http.post<Motorcycle>(`${API_URL}/motorcycles`, motorcycle);
  }

  update(id: string, motorcycle: Motorcycle): Observable<Motorcycle> {
    return this.http.put<Motorcycle>(`${API_URL}/motorcycles/${id}`, motorcycle);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${API_URL}/motorcycles/${id}`);
  }

  updateLocation(id: string, latitude: number, longitude: number): Observable<Motorcycle> {
    return this.http.put<Motorcycle>(`${API_URL}/motorcycles/${id}/location`, {
      latitude,
      longitude
    });
  }
}



