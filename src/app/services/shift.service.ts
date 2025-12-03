import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_URL = 'http://localhost:5000';

export interface Shift {
  id?: string;
  driver_id: string;
  motorcycle_id: string;
  start_time: string;
  end_time?: string;
  status: 'activo' | 'finalizado';
  driver?: any;
  motorcycle?: any;
}

@Injectable({
  providedIn: 'root'
})
export class ShiftService {
  constructor(private http: HttpClient) {}

  getAll(): Observable<Shift[]> {
    return this.http.get<Shift[]>(`${API_URL}/shifts`);
  }

  getById(id: string): Observable<Shift> {
    return this.http.get<Shift>(`${API_URL}/shifts/${id}`);
  }

  create(shift: Shift): Observable<Shift> {
    return this.http.post<Shift>(`${API_URL}/shifts`, shift);
  }

  update(id: string, shift: Shift): Observable<Shift> {
    return this.http.put<Shift>(`${API_URL}/shifts/${id}`, shift);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${API_URL}/shifts/${id}`);
  }

  getActiveShifts(): Observable<Shift[]> {
    return this.http.get<Shift[]>(`${API_URL}/shifts/active`);
  }

  endShift(id: string): Observable<Shift> {
    return this.http.put<Shift>(`${API_URL}/shifts/${id}/end`, {});
  }
}



