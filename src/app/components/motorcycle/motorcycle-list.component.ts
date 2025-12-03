import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { Motorcycle } from '../../services/motorcycle.service';

@Component({
  selector: 'app-motorcycle-list',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatChipsModule],
  templateUrl: './motorcycle-list.component.html',
  styleUrls: ['./motorcycle-list.component.css']
})
export class MotorcycleListComponent {
  @Input() motorcycles: Motorcycle[] = [];
  @Output() edit = new EventEmitter<Motorcycle>();
  @Output() assignZone = new EventEmitter<Motorcycle>();

  onEdit(moto: Motorcycle): void {
    this.edit.emit(moto);
  }

  onAssignZone(moto: Motorcycle): void {
    this.assignZone.emit(moto);
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'available': 'green',
      'disponible': 'green',
      'busy': 'orange',
      'en_uso': 'orange',
      'mantenimiento': 'red'
    };
    return colors[status] || 'gray';
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'available': 'Disponible',
      'disponible': 'Disponible',
      'busy': 'En uso',
      'en_uso': 'En uso',
      'mantenimiento': 'Mantenimiento'
    };
    return labels[status] || status;
  }
}

