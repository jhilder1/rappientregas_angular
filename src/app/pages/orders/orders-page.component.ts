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
import { MatTooltipModule } from '@angular/material/tooltip';
import { OrderService, Order } from '../../services/order.service';
import { MotorcycleService } from '../../services/motorcycle.service';
import { CustomerService } from '../../services/customer.service';
import { AddressService } from '../../services/address.service';
import { MenuService } from '../../services/menu.service';
import { NotificationService } from '../../services/notification.service';
import { ShiftService } from '../../services/shift.service';

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
  availableMotorcycles: any[] = [];
  activeShifts: any[] = [];
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
    private shiftService: ShiftService,
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
    this.fetchActiveShifts();
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
        this.updateAvailableMotorcycles();
      },
      error: (error) => {
        console.error('Error fetching motorcycles:', error);
      }
    });
  }

  fetchActiveShifts(): void {
    this.shiftService.getActiveShifts().subscribe({
      next: (data) => {
        this.activeShifts = data;
        this.updateAvailableMotorcycles();
      },
      error: (error) => {
        console.error('Error fetching active shifts:', error);
        // Si falla, cargar todas las motocicletas
        this.availableMotorcycles = this.motorcycles;
      }
    });
  }

  updateAvailableMotorcycles(): void {
    if (this.activeShifts.length > 0) {
      // Filtrar motocicletas que tienen turnos activos
      const activeMotorcycleIds = this.activeShifts.map(shift => String(shift.motorcycle_id));
      this.availableMotorcycles = this.motorcycles.filter(moto =>
        activeMotorcycleIds.includes(String(moto.id))
      );
    } else {
      // Si no hay turnos activos, mostrar todas las motocicletas
      this.availableMotorcycles = this.motorcycles;
    }
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
        // Filtrar solo menús disponibles
        this.menus = data.filter(menu => menu.availability !== false);
      },
      error: (error) => {
        console.error('Error fetching menus:', error);
      }
    });
  }

  handleAdd(): void {
    this.editingOrder = null;
    this.orderForm.reset({
      customer_id: '',
      menu_id: '',
      quantity: 1,
      motorcycle_id: '',
      status: 'pending'
    });
    this.formOpen = true;
  }

  handleEdit(order: Order): void {
    this.editingOrder = order;
    const orderAny = order as any;
    this.orderForm.patchValue({
      customer_id: String(order.customer_id),
      menu_id: String(this.getOrderMenuId(order) || orderAny?.menu_id || ''),
      quantity: this.getOrderQuantity(order) || 1,
      motorcycle_id: order.motorcycle_id ? String(order.motorcycle_id) : '',
      status: order.status
    });
    this.formOpen = true;
  }

  handleDelete(id: string | number): void {
    if (confirm('¿Está seguro de eliminar esta orden?')) {
      const orderId = String(id);
      this.orderService.delete(orderId).subscribe({
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
      const orderId = order.id ? String(order.id) : '';
      const motorcycleId = String(order.motorcycle_id);
      this.orderService.assignToMotorcycle(orderId, motorcycleId).subscribe({
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
      const formValue = this.orderForm.value;
      const data = {
        customer_id: parseInt(formValue.customer_id),
        menu_id: parseInt(formValue.menu_id),
        quantity: parseInt(formValue.quantity),
        status: formValue.status,
        motorcycle_id: formValue.motorcycle_id ? parseInt(formValue.motorcycle_id) : null
      };

      console.log('Enviando datos del pedido:', data);

      if (this.editingOrder?.id) {
        const orderId = String(this.editingOrder.id);
        this.orderService.update(orderId, data).subscribe({
          next: () => {
            const cliente = this.customers.find(c => c.id === data.customer_id);
            this.notificationService.addNotification({
              tipo: 'actualizado',
              mensaje: `Pedido #${this.editingOrder?.id} actualizado`,
              cliente: cliente?.name || 'Desconocido',
              estado: data.status || 'N/A'
            });
            this.fetchOrders();
            this.formOpen = false;
            this.snackBar.open('Orden actualizada', 'Cerrar', { duration: 3000 });
          },
          error: (error) => {
            console.error('Error updating order:', error);
            const errorMsg = error?.error?.message || error?.message || 'Error desconocido';
            this.snackBar.open(`Error al actualizar orden: ${errorMsg}`, 'Cerrar', { duration: 5000 });
          }
        });
      } else {
        this.orderService.create(data).subscribe({
          next: (response) => {
            console.log('Pedido creado exitosamente:', response);
            const cliente = this.customers.find(c => c.id === data.customer_id);
            const orderId = (response as any)?.id || response?.id || 'N/A';
            this.notificationService.addNotification({
              tipo: 'nuevo',
              mensaje: `Nuevo pedido #${orderId} creado`,
              cliente: cliente?.name || 'Desconocido',
              estado: data.status || 'N/A',
              fecha: new Date().toISOString()
            });
            this.fetchOrders();
            this.formOpen = false;
            this.snackBar.open('Orden creada exitosamente', 'Cerrar', { duration: 3000 });
          },
          error: (error) => {
            console.error('Error creating order:', error);
            const errorMsg = error?.error?.message || error?.error?.error || error?.message || 'Error desconocido';
            this.snackBar.open(`Error al crear orden: ${errorMsg}`, 'Cerrar', { duration: 5000 });
          }
        });
      }
    } else {
      console.log('Formulario inválido:', this.orderForm.errors);
      console.log('Valores del formulario:', this.orderForm.value);
      this.snackBar.open('Por favor completa todos los campos requeridos', 'Cerrar', { duration: 3000 });
    }
  }

  handleClose(): void {
    this.formOpen = false;
    this.editingOrder = null;
    this.orderForm.reset();
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

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'pending': 'Pendiente',
      'in_progress': 'En Progreso',
      'delivered': 'Entregado',
      'cancelled': 'Cancelado',
      'pendiente': 'Pendiente',
      'en_preparacion': 'En Preparación',
      'en_camino': 'En Camino',
      'entregado': 'Entregado',
      'cancelado': 'Cancelado'
    };
    return labels[status] || status;
  }

  getMenuProductName(order: Order): string {
    const orderAny = order as any;
    // Priorizar el nombre del menú, luego el nombre del producto
    if (orderAny?.menu?.name) {
      return orderAny.menu.name;
    }
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

  getOrderId(orderId: string | number | undefined): string {
    if (!orderId) return '';
    return String(orderId);
  }

  getOrderIdDisplay(orderId: string | number | undefined): string {
    if (!orderId) return 'N/A';
    const idStr = String(orderId);
    return idStr.length > 8 ? idStr.substring(0, 8) : idStr;
  }

  getMotorcycleInfo(order: Order): string {
    const orderAny = order as any;
    if (orderAny?.motorcycle?.plate) {
      return orderAny.motorcycle.plate;
    }
    if (orderAny?.motorcycle?.license_plate) {
      return orderAny.motorcycle.license_plate;
    }
    if (order.motorcycle_id) {
      const moto = this.motorcycles.find(m => String(m.id) === String(order.motorcycle_id));
      if (moto) {
        return moto.plate || moto.license_plate || String(moto.id);
      }
    }
    return '';
  }

  getMotorcyclePlate(order: Order): string {
    const orderAny = order as any;
    if (orderAny?.motorcycle?.plate) {
      return orderAny.motorcycle.plate;
    }
    if (orderAny?.motorcycle?.license_plate) {
      return orderAny.motorcycle.license_plate;
    }
    if (order.motorcycle_id) {
      const moto = this.motorcycles.find(m => String(m.id) === String(order.motorcycle_id));
      if (moto) {
        return moto.plate || moto.license_plate || '';
      }
    }
    return '';
  }

  hasMotorcycle(order: Order): boolean {
    return !!this.getMotorcycleInfo(order);
  }
}

