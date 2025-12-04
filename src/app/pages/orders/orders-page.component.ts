import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { OrderService, Order } from '../../services/order.service';
import { MotorcycleService } from '../../services/motorcycle.service';
import { CustomerService } from '../../services/customer.service';
import { AddressService } from '../../services/address.service';
import { MenuService } from '../../services/menu.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-orders-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule,
    MatChipsModule
  ],
  templateUrl: './orders-page.component.html',
  styleUrls: ['./orders-page.component.css']
})
export class OrdersPageComponent implements OnInit {
  orders: Order[] = [];
  displayedColumns: string[] = ['id', 'customer', 'menu', 'status', 'total', 'motorcycle', 'actions'];
  formOpen = false;
  orderForm: FormGroup;
  editingOrder: Order | null = null;
  motorcycles: any[] = [];
  customers: any[] = [];
  addresses: any[] = [];
  menus: any[] = [];

  constructor(
    private orderService: OrderService,
    private motorcycleService: MotorcycleService,
    private customerService: CustomerService,
    private addressService: AddressService,
    private menuService: MenuService,
    private notificationService: NotificationService,
    private router: Router,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.orderForm = this.fb.group({
      customer_id: ['', Validators.required],
      menu_id: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      motorcycle_id: [''],
      status: ['pending', Validators.required]
    });
  }

  ngOnInit(): void {
    this.fetchOrders();
    this.fetchMotorcycles();
    this.fetchCustomers();
    this.fetchAddresses();
    this.fetchMenus();
  }

  fetchOrders(): void {
    this.orderService.getAll().subscribe({
      next: (data) => {
        this.orders = data;
      },
      error: (error) => {
        console.error('Error fetching orders:', error);
        this.snackBar.open('Error al cargar órdenes', 'Cerrar', { duration: 3000 });
      }
    });
  }

  fetchMotorcycles(): void {
    this.motorcycleService.getAll().subscribe({
      next: (data) => {
        this.motorcycles = data;
      },
      error: (error) => {
        console.error('Error fetching motorcycles:', error);
      }
    });
  }

  fetchCustomers(): void {
    this.customerService.getCustomers().subscribe({
      next: (data) => {
        this.customers = data;
      },
      error: (error) => {
        console.error('Error fetching customers:', error);
      }
    });
  }

  fetchAddresses(): void {
    this.addressService.getAll().subscribe({
      next: (data) => {
        this.addresses = data;
      },
      error: (error) => {
        console.error('Error fetching addresses:', error);
      }
    });
  }

  fetchMenus(): void {
    this.menuService.getAll().subscribe({
      next: (data) => {
        this.menus = data;
      },
      error: (error) => {
        console.error('Error fetching menus:', error);
      }
    });
  }

  handleAdd(): void {
    this.editingOrder = null;
    this.orderForm.reset({
      status: 'pendiente',
      total: 0
    });
    this.formOpen = true;
  }

  handleEdit(order: Order): void {
    this.editingOrder = order;
    this.orderForm.patchValue({
      customer_id: order.customer_id,
      menu_id: this.getOrderMenuId(order) || '',
      quantity: this.getOrderQuantity(order) || 1,
      motorcycle_id: order.motorcycle_id || '',
      status: order.status
    });
    this.formOpen = true;
  }

  handleDelete(id: string): void {
    if (confirm('¿Está seguro de eliminar esta orden?')) {
      this.orderService.delete(id).subscribe({
        next: () => {
          this.fetchOrders();
          this.snackBar.open('Orden eliminada', 'Cerrar', { duration: 3000 });
        },
        error: (error) => {
          console.error('Error deleting order:', error);
          this.snackBar.open('Error al eliminar orden', 'Cerrar', { duration: 3000 });
        }
      });
    }
  }

  handleAssign(order: Order): void {
    if (order.motorcycle_id) {
      this.orderService.assignToMotorcycle(order.id!, order.motorcycle_id).subscribe({
        next: () => {
          this.fetchOrders();
          this.notificationService.addNotification({
            tipo: 'nuevo',
            mensaje: `Pedido #${order.id} asignado a motocicleta ${order.motorcycle_id}`
          });
          this.snackBar.open('Orden asignada', 'Cerrar', { duration: 3000 });
        },
        error: (error) => {
          console.error('Error assigning order:', error);
          this.snackBar.open('Error al asignar orden', 'Cerrar', { duration: 3000 });
        }
      });
    }
  }

  handleSubmit(): void {
    if (this.orderForm.valid) {
      const data = this.orderForm.value;
      if (this.editingOrder?.id) {
        this.orderService.update(this.editingOrder.id, data).subscribe({
          next: () => {
            this.fetchOrders();
            this.formOpen = false;
            this.snackBar.open('Orden actualizada', 'Cerrar', { duration: 3000 });
          },
          error: (error) => {
            console.error('Error updating order:', error);
            this.snackBar.open('Error al actualizar orden', 'Cerrar', { duration: 3000 });
          }
        });
      } else {
        this.orderService.create(data).subscribe({
          next: () => {
            this.fetchOrders();
            this.formOpen = false;
            this.snackBar.open('Orden creada', 'Cerrar', { duration: 3000 });
          },
          error: (error) => {
            console.error('Error creating order:', error);
            this.snackBar.open('Error al crear orden', 'Cerrar', { duration: 3000 });
          }
        });
      }
    }
  }

  handleClose(): void {
    this.formOpen = false;
    this.editingOrder = null;
    this.orderForm.reset();
  }

  viewMap(plate: string): void {
    if (plate) {
      this.router.navigate(['/mapa-moto', plate]);
    }
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'pending': 'orange',
      'in_progress': 'blue',
      'delivered': 'green',
      'cancelled': 'red',
      'pendiente': 'orange',
      'en_preparacion': 'blue',
      'en_camino': 'purple',
      'entregado': 'green',
      'cancelado': 'red'
    };
    return colors[status] || 'gray';
  }

  getMenuProductName(order: Order): string {
    const orderAny = order as any;
    return orderAny?.menu?.product?.name || 'N/A';
  }

  getOrderQuantity(order: Order): number {
    const orderAny = order as any;
    return orderAny?.quantity || 0;
  }

  getOrderTotal(order: Order): number {
    const orderAny = order as any;
    return orderAny?.total_price || order.total || 0;
  }

  getOrderMenuId(order: Order): string {
    const orderAny = order as any;
    return orderAny?.menu_id || '';
  }
}

