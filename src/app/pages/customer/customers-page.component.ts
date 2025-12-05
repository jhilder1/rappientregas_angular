import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
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
    MatIconModule,
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
  isCreatingNew = false;

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

  handleDelete(id: string | number): void {
    if (confirm('¿Estás seguro de eliminar este cliente?')) {
      this.customerService.delete(String(id)).subscribe({
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
    this.isCreatingNew = false;
  }

  handleCreateNew(): void {
    this.selectedCustomer = null;
    this.isCreatingNew = true;
  }

  handleCreate(customerData: Partial<Customer>): void {
    if ((customerData as any).cancel) {
      this.isCreatingNew = false;
      return;
    }

    this.customerService.create(customerData as Customer).subscribe({
      next: (newCustomer) => {
        this.snackBar.open('Usuario creado correctamente', 'Cerrar', { duration: 3000 });
        this.isCreatingNew = false;
        // Recargar la lista completa y luego seleccionar el usuario recién creado
        this.customerService.getCustomers().subscribe({
          next: (customers) => {
            this.customers = customers;
            // Buscar el usuario recién creado por email (ya que el ID puede cambiar)
            const createdUser = customers.find(c => c.email === newCustomer.email);
            if (createdUser) {
              this.selectedCustomer = createdUser;
            } else {
              // Si no se encuentra por email, usar el que devolvió el servidor
              this.selectedCustomer = newCustomer;
            }
          },
          error: (error) => {
            console.error('Error al recargar clientes:', error);
            // Si falla la recarga, al menos mostrar el usuario creado
            this.customers.push(newCustomer);
            this.selectedCustomer = newCustomer;
          }
        });
      },
      error: (error) => {
        console.error('Error al crear usuario:', error);
        let errorMessage = 'Error al crear usuario';
        if (error.error && error.error.message) {
          errorMessage = error.error.message;
        } else if (error.status === 400) {
          errorMessage = 'Datos inválidos. Verifica que todos los campos estén correctos.';
        } else if (error.status === 409) {
          errorMessage = 'Ya existe un usuario con ese email.';
        }
        this.snackBar.open(errorMessage, 'Cerrar', { duration: 5000 });
      }
    });
  }

  handleUpdate(id: string | number | undefined, updateData: Partial<Customer>): void {
    if (!id) {
      this.snackBar.open('Error: ID de usuario no válido', 'Cerrar', { duration: 3000 });
      return;
    }
    this.customerService.update(String(id), updateData).subscribe({
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
