import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Shift } from '../../services/shift.service';

@Component({
  selector: 'app-shift-list-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule
  ],
  templateUrl: './shift-list-table.component.html',
  styleUrls: ['./shift-list-table.component.css']
})
export class ShiftListTableComponent {
  @Input() shifts: Shift[] = [];
  @Output() edit = new EventEmitter<Shift>();
  @Output() delete = new EventEmitter<string>();

  displayedColumns: string[] = ['driver', 'motorcycle', 'start_time', 'end_time', 'status', 'actions'];

  onEdit(shift: Shift): void {
    this.edit.emit(shift);
  }

  onDelete(id: string): void {
    this.delete.emit(id);
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'active': 'green',
      'activo': 'green',
      'completed': 'blue',
      'finalizado': 'blue',
      'cancelled': 'red',
      'cancelado': 'red'
    };
    return colors[status] || 'gray';
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'active': 'Activo',
      'activo': 'Activo',
      'completed': 'Completado',
      'finalizado': 'Completado',
      'cancelled': 'Cancelado',
      'cancelado': 'Cancelado'
    };
    return labels[status] || status;
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('es-ES');
  }

  getDriverName(shift: Shift): string {
    if (shift.driver) {
      return shift.driver.name || 'N/A';
    }
    return 'N/A';
  }

  getMotorcyclePlate(shift: Shift): string {
    if (shift.motorcycle) {
      return shift.motorcycle.license_plate || shift.motorcycle.plate || 'N/A';
    }
    return 'N/A';
  }

  getIdAsString(id: string | number | undefined): string {
    return id ? String(id) : '';
  }
}
