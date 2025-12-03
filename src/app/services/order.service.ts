import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, interval } from 'rxjs';
import { switchMap, startWith } from 'rxjs/operators';
import { NotificationService } from './notification.service';

const API_URL = 'http://localhost:5000';

export interface Order {
  id?: string;
  customer_id: string;
  address_id: string;
  motorcycle_id?: string;
  status: 'pendiente' | 'en_preparacion' | 'en_camino' | 'entregado' | 'cancelado';
  total: number;
  created_at?: string;
  customer?: any;
  address?: any;
  motorcycle?: any;
  order_items?: OrderItem[];
}

export interface OrderItem {
  id?: string;
  order_id: string;
  menu_id: string;
  quantity: number;
  price: number;
  menu?: any;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private lastOrderCount = 0;

  constructor(
    private http: HttpClient,
    private notificationService: NotificationService
  ) {
    // Monitorear nuevos pedidos cada 5 segundos
    this.startMonitoringNewOrders();
  }

  getAll(): Observable<Order[]> {
    return this.http.get<Order[]>(`${API_URL}/orders`);
  }

  getById(id: string): Observable<Order> {
    return this.http.get<Order>(`${API_URL}/orders/${id}`);
  }

  create(order: Order): Observable<Order> {
    return this.http.post<Order>(`${API_URL}/orders`, order);
  }

  update(id: string, order: Order): Observable<Order> {
    return this.http.put<Order>(`${API_URL}/orders/${id}`, order);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${API_URL}/orders/${id}`);
  }

  getByMotorcycle(motorcycleId: string): Observable<Order[]> {
    return this.http.get<Order[]>(`${API_URL}/orders/motorcycle/${motorcycleId}`);
  }

  assignToMotorcycle(orderId: string, motorcycleId: string): Observable<Order> {
    return this.http.put<Order>(`${API_URL}/orders/${orderId}/assign`, { motorcycle_id: motorcycleId });
  }

  private startMonitoringNewOrders(): void {
    interval(5000)
      .pipe(
        startWith(0),
        switchMap(() => this.getAll())
      )
      .subscribe({
        next: (orders) => {
          const currentCount = orders.length;
          if (currentCount > this.lastOrderCount && this.lastOrderCount > 0) {
            const newOrders = orders.slice(this.lastOrderCount);
            newOrders.forEach(order => {
              if (order.motorcycle_id) {
                this.notificationService.addNotification({
                  tipo: 'nuevo',
                  mensaje: `Nuevo pedido #${order.id} asignado a motocicleta ${order.motorcycle_id}`
                });
              }
            });
          }
          this.lastOrderCount = currentCount;
        },
        error: (error) => {
          // Silenciar errores de polling para no saturar la consola
          // El backend puede no estar disponible aún
          console.debug('Error en monitoreo de pedidos:', error);
        }
      });
  }
}


