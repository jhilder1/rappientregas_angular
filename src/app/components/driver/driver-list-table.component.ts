import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Driver } from '../../services/driver.service';

@Component({
  selector: 'app-driver-list-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule
  ],
  templateUrl: './driver-list-table.component.html',
  styleUrls: ['./driver-list-table.component.css']
})
export class DriverListTableComponent {
  @Input() drivers: Driver[] = [];
  @Output() edit = new EventEmitter<Driver>();
  @Output() delete = new EventEmitter<string>();

  displayedColumns: string[] = ['name', 'email', 'phone', 'license_number', 'status', 'actions'];

  onEdit(driver: Driver): void {
    this.edit.emit(driver);
  }

  onDelete(id: string): void {
    this.delete.emit(id);
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'disponible': 'green',
      'ocupado': 'orange',
      'inactivo': 'red'
    };
    return colors[status] || 'gray';
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'disponible': 'Disponible',
      'ocupado': 'Ocupado',
      'inactivo': 'Inactivo'
    };
    return labels[status] || status;
  }
}

