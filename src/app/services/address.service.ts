import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_URL = 'http://localhost:5000';

export interface Address {
  id?: string;
  order_id?: string;
  street: string;
  city: string;
  state: string;
  postal_code: string;
  additional_info?: string;
  created_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AddressService {
  constructor(private http: HttpClient) { }

  getAll(): Observable<Address[]> {
    return this.http.get<Address[]>(`${API_URL}/addresses`);
  }

  getById(id: string): Observable<Address> {
    return this.http.get<Address>(`${API_URL}/addresses/${id}`);
  }

  create(address: Address): Observable<Address> {
    return this.http.post<Address>(`${API_URL}/addresses`, address);
  }

  update(id: string, address: Address): Observable<Address> {
    return this.http.put<Address>(`${API_URL}/addresses/${id}`, address);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${API_URL}/addresses/${id}`);
  }
}



