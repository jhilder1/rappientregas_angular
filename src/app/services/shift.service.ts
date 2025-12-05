import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_URL = 'http://localhost:5000';

export interface Shift {
  id?: string | number;
  driver_id: string | number;
  motorcycle_id: string | number;
  start_time: string;
  end_time?: string;
  status?: 'active' | 'completed' | 'cancelled' | 'activo' | 'finalizado';
  driver?: any;
  motorcycle?: any;
}

@Injectable({
  providedIn: 'root'
})
export class ShiftService {
  constructor(private http: HttpClient) { }

  getAll(): Observable<Shift[]> {
    return this.http.get<Shift[]>(`${API_URL}/shifts`);
  }

  getById(id: string | number): Observable<Shift> {
    return this.http.get<Shift>(`${API_URL}/shifts/${id}`);
  }

  create(shift: Partial<Shift>): Observable<Shift> {
    return this.http.post<Shift>(`${API_URL}/shifts`, shift);
  }

  update(id: string | number, shift: Partial<Shift>): Observable<Shift> {
    return this.http.put<Shift>(`${API_URL}/shifts/${id}`, shift);
  }

  delete(id: string | number): Observable<void> {
    return this.http.delete<void>(`${API_URL}/shifts/${id}`);
  }

  getActiveShifts(): Observable<Shift[]> {
    return this.http.get<Shift[]>(`${API_URL}/shifts/active`);
  }

  endShift(id: string): Observable<Shift> {
    return this.http.put<Shift>(`${API_URL}/shifts/${id}/end`, {});
  }
}



