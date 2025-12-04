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
import { AddressService, Address } from '../../services/address.service';
import { OrderService } from '../../services/order.service';

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
  displayedColumns: string[] = ['street', 'city', 'state', 'postal_code', 'order', 'actions'];
  formOpen = false;
  addressForm: FormGroup;
  editingAddress: Address | null = null;
  orders: any[] = [];

  constructor(
    private addressService: AddressService,
    private orderService: OrderService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.addressForm = this.fb.group({
      order_id: ['', [Validators.required]],
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

  handleAdd(): void {
    this.editingAddress = null;
    this.addressForm.reset();
    this.formOpen = true;
  }

  handleEdit(address: Address): void {
    this.editingAddress = address;
    this.addressForm.patchValue({
      order_id: address.order_id || '',
      street: address.street,
      city: address.city,
      state: address.state,
      postal_code: address.postal_code,
      additional_info: address.additional_info || ''
    });
    this.formOpen = true;
  }

  handleDelete(id: string): void {
    if (confirm('¿Está seguro de eliminar esta dirección?')) {
      this.addressService.delete(id).subscribe({
        next: () => {
          this.fetchAddresses();
          this.snackBar.open('Dirección eliminada', 'Cerrar', { duration: 3000 });
        },
        error: (error) => {
          console.error('Error deleting address:', error);
          this.snackBar.open('Error al eliminar dirección', 'Cerrar', { duration: 3000 });
        }
      });
    }
  }

  handleSubmit(): void {
    if (this.addressForm.valid) {
      const data = this.addressForm.value;
      if (this.editingAddress?.id) {
        this.addressService.update(this.editingAddress.id, data).subscribe({
          next: () => {
            this.fetchAddresses();
            this.formOpen = false;
            this.snackBar.open('Dirección actualizada', 'Cerrar', { duration: 3000 });
          },
          error: (error) => {
            console.error('Error updating address:', error);
            this.snackBar.open('Error al actualizar dirección', 'Cerrar', { duration: 3000 });
          }
        });
      } else {
        this.addressService.create(data).subscribe({
          next: () => {
            this.fetchAddresses();
            this.formOpen = false;
            this.snackBar.open('Dirección creada', 'Cerrar', { duration: 3000 });
          },
          error: (error) => {
            console.error('Error creating address:', error);
            this.snackBar.open('Error al crear dirección', 'Cerrar', { duration: 3000 });
          }
        });
      }
    }
  }

  handleClose(): void {
    this.formOpen = false;
    this.editingAddress = null;
    this.addressForm.reset();
  }

  getOrderInfo(orderId: string | undefined): string {
    if (!orderId) return '-';
    const order = this.orders.find(o => o.id === orderId);
    return order ? `Pedido #${order.id?.substring(0, 8)}` : '-';
  }
}


