import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Customer } from '../../services/customer.service';

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule],
  templateUrl: './customer-list.component.html',
  styleUrls: ['./customer-list.component.css']
})
export class CustomerListComponent {
  @Input() customers: Customer[] = [];
  @Input() loggedUser: Customer | null = null;
  @Output() edit = new EventEmitter<Customer>();
  @Output() delete = new EventEmitter<string>();

  onEdit(customer: Customer): void {
    this.edit.emit(customer);
  }

  onDelete(id: string | number | undefined): void {
    if (id) {
      this.delete.emit(String(id));
    }
  }

  isLoggedUser(customerId: string | number | undefined): boolean {
    if (!customerId || !this.loggedUser?.id) return false;
    return String(this.loggedUser.id) === String(customerId);
  }
}

