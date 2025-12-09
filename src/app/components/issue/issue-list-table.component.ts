import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Issue } from '../../services/issue.service';

@Component({
  selector: 'app-issue-list-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule
  ],
  templateUrl: './issue-list-table.component.html',
  styleUrls: ['./issue-list-table.component.css']
})
export class IssueListTableComponent {
  @Input() issues: Issue[] = [];
  @Output() edit = new EventEmitter<Issue>();
  @Output() delete = new EventEmitter<string>();

  displayedColumns: string[] = ['motorcycle', 'issue_type', 'description', 'date_reported', 'status', 'actions'];

  onEdit(issue: Issue): void {
    this.edit.emit(issue);
  }

  onDelete(id: string): void {
    this.delete.emit(id);
  }

  getStatusColor(status: string | undefined): string {
    if (!status) return 'gray';
    const colors: { [key: string]: string } = {
      'open': 'orange',
      'in_progress': 'blue',
      'resolved': 'green'
    };
    return colors[status] || 'gray';
  }

  getStatusLabel(status: string | undefined): string {
    if (!status) return 'N/A';
    const labels: { [key: string]: string } = {
      'open': 'Abierto',
      'in_progress': 'En Progreso',
      'resolved': 'Resuelto'
    };
    return labels[status] || status;
  }

  getTypeLabel(type: string | undefined): string {
    if (!type) return 'N/A';
    const labels: { [key: string]: string } = {
      'accident': 'Accidente',
      'breakdown': 'Falla Mecánica',
      'maintenance': 'Mantenimiento',
      'pinchazo': 'Pinchazo',
      'otro': 'Otro'
    };
    return labels[type] || type;
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('es-ES');
  }

  getMotorcyclePlate(issue: Issue): string {
    if (issue.motorcycle) {
      return issue.motorcycle.license_plate || issue.motorcycle.plate || 'N/A';
    }
    return 'N/A';
  }

  truncateDescription(description: string | undefined): string {
    if (!description) return 'N/A';
    return description.length > 50 ? description.substring(0, 50) + '...' : description;
  }

  getIdAsString(id: string | number | undefined): string {
    return id ? String(id) : '';
  }
}

