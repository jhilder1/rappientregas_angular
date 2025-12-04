import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { CustomerService, Customer } from '../../services/customer.service';
import { CustomerListComponent } from '../../components/customer/customer-list.component';
import { CustomerProfileComponent } from '../../components/customer/customer-profile.component';

@Component({
  selector: 'app-customers-page',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatSnackBarModule,
    CustomerListComponent,
    CustomerProfileComponent
  ],
  templateUrl: './customers-page.component.html',
  styleUrls: ['./customers-page.component.css']
})
export class CustomersPageComponent implements OnInit {
  customers: Customer[] = [];
  loggedUser: Customer | null = null;
  selectedCustomer: Customer | null = null;

  constructor(
    private customerService: CustomerService,
    private router: Router,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadCustomers();
    this.loggedUser = this.customerService.getCustomer();
  }

  loadCustomers(): void {
    this.customerService.getCustomers().subscribe({
      next: (data) => {
        this.customers = data;
      },
      error: (error) => {
        console.error('Error loading customers:', error);
        this.snackBar.open('Error al cargar clientes', 'Cerrar', { duration: 3000 });
      }
    });
  }

  handleDelete(id: string): void {
    if (confirm('¿Estás seguro de eliminar este cliente?')) {
      this.customerService.delete(id).subscribe({
        next: () => {
          this.customers = this.customers.filter(c => c.id !== id);
          if (this.loggedUser?.id === id) {
            this.customerService.setCustomer(null);
            this.router.navigate(['/login']);
          }
          this.snackBar.open('Cliente eliminado', 'Cerrar', { duration: 3000 });
        },
        error: (error) => {
          console.error('Error deleting customer:', error);
          this.snackBar.open('Error al eliminar cliente', 'Cerrar', { duration: 3000 });
        }
      });
    }
  }

  handleSelectCustomer(customer: Customer): void {
    this.selectedCustomer = customer;
  }

  handleUpdate(id: string, updateData: Partial<Customer>): void {
    this.customerService.update(id, updateData).subscribe({
      next: (updated) => {
        this.customers = this.customers.map(c => c.id === id ? updated : c);
        if (this.loggedUser?.id === id) {
          const updatedUser = { ...this.loggedUser, ...updateData };
          this.customerService.setCustomer(updatedUser);
          this.loggedUser = updatedUser;
        }
        if (this.selectedCustomer?.id === id) {
          this.selectedCustomer = updated;
        }
        this.snackBar.open('Cliente actualizado', 'Cerrar', { duration: 3000 });
        // Limpiar selección después de actualizar
        this.selectedCustomer = null;
      },
      error: (error) => {
        console.error('Error updating customer:', error);
        this.snackBar.open('Error al actualizar cliente', 'Cerrar', { duration: 3000 });
      }
    });
  }

  navigateToOrders(): void {
    this.router.navigate(['/ordenes']);
  }
}
