import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ShiftService, Shift } from '../../services/shift.service';
import { MotorcycleService, Motorcycle } from '../../services/motorcycle.service';

@Component({
  selector: 'app-shift-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './shift-form.component.html',
  styleUrls: ['./shift-form.component.css']
})
export class ShiftFormComponent implements OnInit, OnChanges {
  @Input() selected: Shift | null = null;
  @Input() drivers: any[] = [];
  @Input() motorcycles: any[] = [];
  @Output() clear = new EventEmitter<void>();
  @Output() reload = new EventEmitter<void>();

  shiftForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private shiftService: ShiftService,
    private motorcycleService: MotorcycleService,
    private snackBar: MatSnackBar
  ) {
    const now = new Date();
    const timeString = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    this.shiftForm = this.fb.group({
      driver_id: ['', Validators.required],
      motorcycle_id: ['', Validators.required],
      start_date: [now, Validators.required],
      start_time: [timeString, Validators.required],
      end_date: [''],
      end_time: [''],
      status: ['active', Validators.required]
    });
  }

  ngOnInit(): void {
    if (this.selected) {
      this.loadShift(this.selected);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selected'] && this.selected) {
      this.loadShift(this.selected);
    } else if (!this.selected) {
      const now = new Date();
      const timeString = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      this.shiftForm.reset({
        driver_id: '',
        motorcycle_id: '',
        start_date: now,
        start_time: timeString,
        end_date: '',
        end_time: '',
        status: 'active'
      });
    }
  }

  loadShift(shift: Shift): void {
    const startTime = shift.start_time ? new Date(shift.start_time) : new Date();
    const endTime = shift.end_time ? new Date(shift.end_time) : null;

    const startTimeStr = startTime ? `${String(startTime.getHours()).padStart(2, '0')}:${String(startTime.getMinutes()).padStart(2, '0')}` : '';
    const endTimeStr = endTime ? `${String(endTime.getHours()).padStart(2, '0')}:${String(endTime.getMinutes()).padStart(2, '0')}` : '';

    this.shiftForm.patchValue({
      driver_id: shift.driver_id || '',
      motorcycle_id: shift.motorcycle_id || '',
      start_date: startTime,
      start_time: startTimeStr,
      end_date: endTime,
      end_time: endTimeStr,
      status: shift.status || 'active'
    });
  }

  onSubmit(): void {
    if (this.shiftForm.valid) {
      const formValue = this.shiftForm.value;

      // Combinar fecha y hora de inicio
      let startDateTime: Date;
      if (formValue.start_date && formValue.start_time) {
        const startDate = new Date(formValue.start_date);
        const [hours, minutes] = formValue.start_time.split(':');
        startDateTime = new Date(startDate);
        startDateTime.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
      } else {
        startDateTime = new Date();
      }

      // Combinar fecha y hora de fin (si están presentes)
      let endDateTime: string | undefined = undefined;
      if (formValue.end_date && formValue.end_time) {
        const endDate = new Date(formValue.end_date);
        const [hours, minutes] = formValue.end_time.split(':');
        const endDateCombined = new Date(endDate);
        endDateCombined.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
        endDateTime = endDateCombined.toISOString();
      }

      const data: Partial<Shift> = {
        driver_id: formValue.driver_id,
        motorcycle_id: formValue.motorcycle_id,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime,
        status: formValue.status
      };

      if (this.selected?.id) {
        this.shiftService.update(String(this.selected.id), data).subscribe({
          next: () => {
            // Actualizar estado de la motocicleta a ocupado si el turno está activo
            if (data.status === 'active' && data.motorcycle_id) {
              this.updateMotorcycleStatus(String(data.motorcycle_id), 'en_uso');
            }
            this.snackBar.open('Turno actualizado', 'Cerrar', { duration: 3000 });
            this.reload.emit();
            this.clear.emit();
            this.shiftForm.reset();
          },
          error: () => {
            this.snackBar.open('Error al actualizar turno', 'Cerrar', { duration: 3000 });
          }
        });
      } else {
        this.shiftService.create(data).subscribe({
          next: () => {
            // Actualizar estado de la motocicleta a ocupado si el turno está activo
            if (data.status === 'active' && data.motorcycle_id) {
              this.updateMotorcycleStatus(String(data.motorcycle_id), 'en_uso');
            }
            this.snackBar.open('Turno creado', 'Cerrar', { duration: 3000 });
            this.reload.emit();
            this.clear.emit();
            this.shiftForm.reset();
          },
          error: () => {
            this.snackBar.open('Error al crear turno', 'Cerrar', { duration: 3000 });
          }
        });
      }
    }
  }

  onClear(): void {
    const now = new Date();
    const timeString = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    this.shiftForm.reset({
      driver_id: '',
      motorcycle_id: '',
      start_date: now,
      start_time: timeString,
      end_date: '',
      end_time: '',
      status: 'active'
    });
    this.clear.emit();
  }

  private updateMotorcycleStatus(motorcycleId: string, status: 'available' | 'busy' | 'disponible' | 'en_uso' | 'mantenimiento'): void {
    this.motorcycleService.getById(motorcycleId).subscribe({
      next: (motorcycle: Motorcycle) => {
        const updatedMotorcycle = { ...motorcycle, status };
        this.motorcycleService.update(motorcycleId, updatedMotorcycle).subscribe({
          next: () => {
            console.log(`Estado de motocicleta ${motorcycleId} actualizado a ${status}`);
          },
          error: (error: any) => {
            console.error('Error al actualizar estado de motocicleta:', error);
          }
        });
      },
      error: (error: any) => {
        console.error('Error al obtener motocicleta:', error);
      }
    });
  }
}
