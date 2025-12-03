import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Department {
  id: number;
  name: string;
  description?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ZoneService {
  private departmentsApi = 'https://api-colombia.com/api/v1/Department';

  constructor(private http: HttpClient) {}

  getDepartments(): Observable<Department[]> {
    return this.http.get<Department[]>(this.departmentsApi);
  }

  updateMotorcycleZone(motorcycleId: string, zoneData: any): Observable<any> {
    // Ajusta la URL según tu API de motserver
    const motserverUrl = `https://motserver.com/api/v1/motorcycles/${motorcycleId}/zone`;
    return this.http.put(motserverUrl, { zone: zoneData }, {
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

