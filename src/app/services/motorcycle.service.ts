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
  constructor(private http: HttpClient) { }

  getAll(): Observable<Motorcycle[]> {
    return this.http.get<Motorcycle[]>(`${API_URL}/motorcycles`);
  }

  getById(id: string): Observable<Motorcycle> {
    return this.http.get<Motorcycle>(`${API_URL}/motorcycles/${id}`);
  }

  getByPlate(plate: string): Observable<Motorcycle> {
    // Como el backend no tiene esta ruta, buscamos en la lista completa
    return new Observable(observer => {
      this.getAll().subscribe({
        next: (motorcycles) => {
          const motorcycle = motorcycles.find(m =>
            (m.plate && m.plate.toLowerCase() === plate.toLowerCase()) ||
            (m.license_plate && m.license_plate.toLowerCase() === plate.toLowerCase())
          );
          if (motorcycle) {
            observer.next(motorcycle);
            observer.complete();
          } else {
            observer.error({ status: 404, message: 'Motocicleta no encontrada' });
          }
        },
        error: (error) => {
          observer.error(error);
        }
      });
    });
  }

  getByLicensePlate(licensePlate: string): Observable<Motorcycle> {
    return this.getByPlate(licensePlate);
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

  startTracking(plate: string): Observable<any> {
    return this.http.post(`${API_URL}/motorcycles/track/${plate}`, {});
  }

  stopTracking(plate: string): Observable<any> {
    return this.http.post(`${API_URL}/motorcycles/stop/${plate}`, {});
  }
}



