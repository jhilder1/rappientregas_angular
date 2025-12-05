import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

const API_URL = 'http://localhost:5000';

export interface Customer {
  id?: string | number;
  email?: string;
  name?: string;
  phone?: string;
  photo?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private customerSubject = new BehaviorSubject<Customer | null>(null);
  public customer$: Observable<Customer | null> = this.customerSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadCustomerFromStorage();
  }

  private loadCustomerFromStorage(): void {
    const storedCustomer = localStorage.getItem('customer');
    if (storedCustomer) {
      try {
        const customer = JSON.parse(storedCustomer);
        this.customerSubject.next(customer);
      } catch (error) {
        console.error('Error loading customer from storage:', error);
      }
    }
  }

  setCustomer(customer: Customer | null): void {
    if (customer) {
      localStorage.setItem('customer', JSON.stringify(customer));
    } else {
      localStorage.removeItem('customer');
    }
    this.customerSubject.next(customer);
  }

  getCustomer(): Customer | null {
    return this.customerSubject.value;
  }

  getCustomers(): Observable<Customer[]> {
    return this.http.get<Customer[]>(`${API_URL}/customers`);
  }

  getById(id: string | number): Observable<Customer> {
    return this.http.get<Customer>(`${API_URL}/customers/${id}`);
  }

  create(customer: Partial<Customer>): Observable<Customer> {
    return this.http.post<Customer>(`${API_URL}/customers`, customer);
  }

  update(id: string | number, customer: Partial<Customer>): Observable<Customer> {
    return this.http.put<Customer>(`${API_URL}/customers/${id}`, customer);
  }

  delete(id: string | number): Observable<void> {
    return this.http.delete<void>(`${API_URL}/customers/${id}`);
  }
}


