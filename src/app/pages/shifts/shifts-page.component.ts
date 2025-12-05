import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { ShiftService, Shift } from '../../services/shift.service';
import { DriverService } from '../../services/driver.service';
import { MotorcycleService } from '../../services/motorcycle.service';
import { ShiftFormComponent } from '../../components/shift/shift-form.component';
import { ShiftListTableComponent } from '../../components/shift/shift-list-table.component';

@Component({
  selector: 'app-shifts-page',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    ShiftFormComponent,
    ShiftListTableComponent
  ],
  templateUrl: './shifts-page.component.html',
  styleUrls: ['./shifts-page.component.css']
})
export class ShiftsPageComponent implements OnInit {
  shifts: Shift[] = [];
  selectedShift: Shift | null = null;
  showForm = false;
  drivers: any[] = [];
  motorcycles: any[] = [];

  constructor(
    private shiftService: ShiftService,
    private driverService: DriverService,
    private motorcycleService: MotorcycleService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadShifts();
    this.loadDrivers();
    this.loadMotorcycles();
  }

  loadShifts(): void {
    this.shiftService.getAll().subscribe({
      next: (data) => {
        this.shifts = data;
      },
      error: () => {
        this.snackBar.open('Error al cargar turnos', 'Cerrar', { duration: 3000 });
      }
    });
  }

  loadDrivers(): void {
    this.driverService.getAll().subscribe({
      next: (data) => {
        // Filtrar solo conductores disponibles o activos
        this.drivers = data.filter(driver =>
          driver.status === 'disponible' || driver.status === 'ocupado' || !driver.status
        );
      },
      error: () => {
        this.snackBar.open('Error al cargar conductores', 'Cerrar', { duration: 3000 });
      }
    });
  }

  loadMotorcycles(): void {
    this.motorcycleService.getAll().subscribe({
      next: (data) => {
        // Filtrar solo motocicletas disponibles o en uso (no en mantenimiento)
        this.motorcycles = data.filter(moto =>
          moto.status !== 'mantenimiento'
        );
      },
      error: () => {
        this.snackBar.open('Error al cargar motocicletas', 'Cerrar', { duration: 3000 });
      }
    });
  }

  handleEdit(shift: Shift): void {
    this.selectedShift = shift;
    this.showForm = true;
  }

  handleDelete(id: string | number): void {
    if (confirm('¿Estás seguro de eliminar este turno?')) {
      this.shiftService.delete(String(id)).subscribe({
        next: () => {
          this.shifts = this.shifts.filter(s => s.id !== id);
          this.snackBar.open('Turno eliminado', 'Cerrar', { duration: 3000 });
        },
        error: () => {
          this.snackBar.open('Error al eliminar turno', 'Cerrar', { duration: 3000 });
        }
      });
    }
  }

  handleClear(): void {
    this.selectedShift = null;
    this.showForm = false;
  }

  handleNew(): void {
    this.selectedShift = null;
    this.showForm = true;
  }

  handleReload(): void {
    this.loadShifts();
    this.handleClear();
  }
}
