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

  onDelete(id: string | undefined): void {
    if (id) {
      this.delete.emit(id);
    }
  }

  isLoggedUser(customerId: string | undefined): boolean {
    return this.loggedUser?.id === customerId;
  }
}

