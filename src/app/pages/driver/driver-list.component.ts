import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { DriverService, Driver } from '../../services/driver.service';
import { DriverFormComponent } from '../../components/driver/driver-form.component';
import { DriverListTableComponent } from '../../components/driver/driver-list-table.component';

@Component({
  selector: 'app-driver-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    DriverFormComponent,
    DriverListTableComponent
  ],
  templateUrl: './driver-list.component.html',
  styleUrls: ['./driver-list.component.css']
})
export class DriverListComponent implements OnInit {
  drivers: Driver[] = [];
  selectedDriver: Driver | null = null;
  showForm = false;

  constructor(
    private driverService: DriverService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadDrivers();
  }

  loadDrivers(): void {
    this.driverService.getAll().subscribe({
      next: (data) => {
        this.drivers = data;
      },
      error: (error) => {
        this.snackBar.open('Error al cargar conductores', 'Cerrar', { duration: 3000 });
      }
    });
  }

  handleEdit(driver: Driver): void {
    this.selectedDriver = driver;
    this.showForm = true;
  }

  handleDelete(id: string): void {
    if (confirm('¿Estás seguro de eliminar este conductor?')) {
      this.driverService.delete(id).subscribe({
        next: () => {
          this.drivers = this.drivers.filter(d => d.id !== id);
          this.snackBar.open('Conductor eliminado', 'Cerrar', { duration: 3000 });
        },
        error: () => {
          this.snackBar.open('Error al eliminar conductor', 'Cerrar', { duration: 3000 });
        }
      });
    }
  }

  handleClear(): void {
    this.selectedDriver = null;
    this.showForm = false;
  }

  handleNew(): void {
    this.selectedDriver = null;
    this.showForm = true;
  }

  handleReload(): void {
    this.loadDrivers();
    this.handleClear();
  }
}
