import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { IssueService, Issue } from '../../services/issue.service';
import { MotorcycleService } from '../../services/motorcycle.service';
import { IssueFormComponent } from '../../components/issue/issue-form.component';
import { IssueListTableComponent } from '../../components/issue/issue-list-table.component';

@Component({
  selector: 'app-issue-page',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    IssueFormComponent,
    IssueListTableComponent
  ],
  templateUrl: './issue-page.component.html',
  styleUrls: ['./issue-page.component.css']
})
export class IssuePageComponent implements OnInit {
  issues: Issue[] = [];
  selectedIssue: Issue | null = null;
  showForm = false;
  motorcycles: any[] = [];

  constructor(
    private issueService: IssueService,
    private motorcycleService: MotorcycleService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadIssues();
    this.loadMotorcycles();
  }

  loadIssues(): void {
    this.issueService.getAll().subscribe({
      next: (data) => {
        this.issues = data;
      },
      error: () => {
        this.snackBar.open('Error al cargar inconvenientes', 'Cerrar', { duration: 3000 });
      }
    });
  }

  loadMotorcycles(): void {
    this.motorcycleService.getAll().subscribe({
      next: (data) => {
        // Mostrar todas las motocicletas (incluyendo en mantenimiento) para reportar problemas
        this.motorcycles = data;
      },
      error: () => {
        this.snackBar.open('Error al cargar motocicletas', 'Cerrar', { duration: 3000 });
      }
    });
  }

  handleEdit(issue: Issue): void {
    this.selectedIssue = issue;
    this.showForm = true;
  }

  handleDelete(id: string | number): void {
    if (confirm('¿Estás seguro de eliminar este inconveniente?')) {
      this.issueService.delete(String(id)).subscribe({
        next: () => {
          this.issues = this.issues.filter(i => i.id !== id);
          this.snackBar.open('Inconveniente eliminado', 'Cerrar', { duration: 3000 });
        },
        error: () => {
          this.snackBar.open('Error al eliminar inconveniente', 'Cerrar', { duration: 3000 });
        }
      });
    }
  }

  handleClear(): void {
    this.selectedIssue = null;
    this.showForm = false;
  }

  handleNew(): void {
    this.selectedIssue = null;
    this.showForm = true;
  }

  handleReload(): void {
    this.loadIssues();
    this.handleClear();
  }
}
