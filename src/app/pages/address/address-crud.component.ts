import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { AddressService, Address } from '../../services/address.service';
import { OrderService } from '../../services/order.service';
import { MotorcycleService } from '../../services/motorcycle.service';

@Component({
  selector: 'app-address-crud',
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
    MatSnackBarModule
  ],
  templateUrl: './address-crud.component.html',
  styleUrls: ['./address-crud.component.css']
})
export class AddressCrudComponent implements OnInit {
  addresses: Address[] = [];
  displayedColumns: string[] = ['order', 'street', 'city', 'state', 'postal_code', 'motorcycle', 'actions'];
  formOpen = false;
  addressForm: FormGroup;
  editingAddress: Address | null = null;
  orders: any[] = [];
  motorcycles: any[] = [];

  constructor(
    private addressService: AddressService,
    private orderService: OrderService,
    private motorcycleService: MotorcycleService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    public router: Router
  ) {
    this.addressForm = this.fb.group({
      order_id: ['', [Validators.required]],
      motorcycle_id: [''],
      street: ['', [Validators.required, Validators.minLength(3)]],
      city: ['', [Validators.required]],
      state: ['', [Validators.required]],
      postal_code: ['', [Validators.required]],
      additional_info: ['']
    });
  }

  ngOnInit(): void {
    this.fetchAddresses();
    this.fetchOrders();
    this.fetchMotorcycles();
  }

  fetchAddresses(): void {
    this.addressService.getAll().subscribe({
      next: (data) => {
        this.addresses = data;
      },
      error: (error) => {
        console.error('Error fetching addresses:', error);
        this.snackBar.open('Error al cargar direcciones', 'Cerrar', { duration: 3000 });
      }
    });
  }

  fetchOrders(): void {
    this.orderService.getAll().subscribe({
      next: (data) => {
        this.orders = data;
      },
      error: (error) => {
        console.error('Error fetching orders:', error);
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

  handleAdd(): void {
    this.editingAddress = null;
    this.addressForm.reset();
    this.formOpen = true;
  }

  handleEdit(address: Address): void {
    this.editingAddress = address;
    const order = this.orders.find(o => String(o.id) === String(address.order_id));
    const orderAny = order as any;
    this.addressForm.patchValue({
      order_id: address.order_id ? String(address.order_id) : '',
      motorcycle_id: orderAny?.motorcycle_id ? String(orderAny.motorcycle_id) : '',
      street: address.street,
      city: address.city,
      state: address.state,
      postal_code: address.postal_code,
      additional_info: address.additional_info || ''
    });
    this.formOpen = true;
  }

  handleDelete(id: string | number | undefined): void {
    if (!id) return;
    if (confirm('?Est? seguro de eliminar esta direcci?n?')) {
      const addressId = String(id);
      this.addressService.delete(addressId).subscribe({
        next: () => {
          this.fetchAddresses();
          this.snackBar.open('Direcci?n eliminada', 'Cerrar', { duration: 3000 });
        },
        error: (error) => {
          console.error('Error deleting address:', error);
          this.snackBar.open('Error al eliminar direcci?n', 'Cerrar', { duration: 3000 });
        }
      });
    }
  }

  handleSubmit(): void {
    if (this.addressForm.valid) {
      const formValue = this.addressForm.value;
      const addressData = {
        order_id: parseInt(formValue.order_id),
        street: formValue.street,
        city: formValue.city,
        state: formValue.state,
        postal_code: formValue.postal_code,
        additional_info: formValue.additional_info || ''
      };

      console.log('Enviando datos de direcci?n:', addressData);

      // Funci?n para actualizar la motocicleta del pedido si se seleccion?
      const updateOrderMotorcycle = (orderId: string | number) => {
        if (formValue.motorcycle_id) {
          const order = this.orders.find(o => String(o.id) === String(orderId));
          if (order) {
            const orderAny = order as any;
            const updateData = {
              ...orderAny,
              motorcycle_id: formValue.motorcycle_id ? parseInt(formValue.motorcycle_id) : null
            };
            this.orderService.update(String(orderId), updateData).subscribe({
              next: () => {
                console.log('Motocicleta asignada al pedido');
                this.fetchOrders();
              },
              error: (error) => {
                console.error('Error asignando motocicleta:', error);
              }
            });
          }
        }
      };

      if (this.editingAddress?.id) {
        const addressId = String(this.editingAddress.id);
        this.addressService.update(addressId, addressData).subscribe({
          next: () => {
            updateOrderMotorcycle(formValue.order_id);
            this.fetchAddresses();
            this.formOpen = false;
            this.snackBar.open('Direcci?n actualizada', 'Cerrar', { duration: 3000 });
          },
          error: (error) => {
            console.error('Error updating address:', error);
            const errorMsg = error?.error?.message || error?.message || 'Error desconocido';
            this.snackBar.open(`Error al actualizar direcci?n: ${errorMsg}`, 'Cerrar', { duration: 5000 });
          }
        });
      } else {
        this.addressService.create(addressData).subscribe({
          next: () => {
            updateOrderMotorcycle(formValue.order_id);
            this.fetchAddresses();
            this.formOpen = false;
            this.snackBar.open('Direcci?n creada exitosamente', 'Cerrar', { duration: 3000 });
          },
          error: (error) => {
            console.error('Error creating address:', error);
            const errorMsg = error?.error?.message || error?.error?.error || error?.message || 'Error desconocido';
            this.snackBar.open(`Error al crear direcci?n: ${errorMsg}`, 'Cerrar', { duration: 5000 });
          }
        });
      }
    } else {
      console.log('Formulario inv?lido:', this.addressForm.errors);
      this.snackBar.open('Por favor completa todos los campos requeridos', 'Cerrar', { duration: 3000 });
    }
  }

  handleClose(): void {
    this.formOpen = false;
    this.editingAddress = null;
    this.addressForm.reset();
  }

  getOrderInfo(orderId: string | number | undefined): string {
    if (!orderId) return '-';
    const order = this.orders.find(o => String(o.id) === String(orderId));
    if (!order) return '-';
    const orderIdStr = String(order.id);
    return `Pedido #${orderIdStr.length > 8 ? orderIdStr.substring(0, 8) : orderIdStr}`;
  }

  getOrderIdDisplay(orderId: string | number | undefined): string {
    if (!orderId) return '';
    const idStr = String(orderId);
    return idStr.length > 8 ? idStr.substring(0, 8) : idStr;
  }

  viewOrderMap(orderId: string | number | undefined): void {
    if (!orderId) return;
    const order = this.orders.find(o => String(o.id) === String(orderId));
    if (order) {
      const orderAny = order as any;
      const plate = orderAny?.motorcycle?.plate || orderAny?.motorcycle?.license_plate;
      if (plate) {
        this.router.navigate(['/mapa-moto', plate]);
      } else if (order.motorcycle_id) {
        // Si no hay placa pero hay motorcycle_id, intentar obtener la placa
        this.snackBar.open('La motocicleta asignada no tiene placa registrada', 'Cerrar', { duration: 3000 });
      } else {
        this.snackBar.open('Este pedido no tiene motocicleta asignada', 'Cerrar', { duration: 3000 });
      }
    }
  }

  hasOrderWithMotorcycle(orderId: string | number | undefined): boolean {
    if (!orderId) return false;
    const order = this.orders.find(o => String(o.id) === String(orderId));
    if (!order) return false;
    const orderAny = order as any;
    return !!(orderAny?.motorcycle?.plate || orderAny?.motorcycle?.license_plate || order.motorcycle_id);
  }

  getAddressId(addressId: string | number | undefined): string {
    if (!addressId) return '';
    return String(addressId);
  }

  getMotorcycleInfo(orderId: string | number | undefined): string {
    if (!orderId) return '-';
    const order = this.orders.find(o => String(o.id) === String(orderId));
    if (!order) return '-';
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
    return '-';
  }

  getMotorcyclePlate(orderId: string | number | undefined): string {
    if (!orderId) return '';
    const order = this.orders.find(o => String(o.id) === String(orderId));
    if (!order) return '';
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

  hasMotorcycle(orderId: string | number | undefined): boolean {
    return !!this.getMotorcycleInfo(orderId) && this.getMotorcycleInfo(orderId) !== '-';
  }

  viewMotorcycleMap(plate: string): void {
    if (plate) {
      this.router.navigate(['/mapa-moto', plate]);
    }
  }

  onOrderChange(event: any): void {
    const orderId = event.value;
    if (orderId) {
      const order = this.orders.find(o => String(o.id) === String(orderId));
      if (order) {
        const orderAny = order as any;
        const motorcycleId = orderAny?.motorcycle_id || order.motorcycle_id;
        if (motorcycleId) {
          this.addressForm.patchValue({
            motorcycle_id: String(motorcycleId)
          });
        } else {
          this.addressForm.patchValue({
            motorcycle_id: ''
          });
        }
      }
    }
  }
}


