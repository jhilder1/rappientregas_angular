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
import { DriverService, Driver } from '../../services/driver.service';

@Component({
  selector: 'app-driver-form',
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
    MatSnackBarModule
  ],
  templateUrl: './driver-form.component.html',
  styleUrls: ['./driver-form.component.css']
})
export class DriverFormComponent implements OnInit, OnChanges {
  @Input() selected: Driver | null = null;
  @Output() clear = new EventEmitter<void>();
  @Output() reload = new EventEmitter<void>();

  driverForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private driverService: DriverService,
    private snackBar: MatSnackBar
  ) {
    this.driverForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^\d+$/), Validators.minLength(10)]],
      license_number: ['', [Validators.required, Validators.minLength(5)]],
      status: ['disponible', Validators.required]
    });
  }

  ngOnInit(): void {
    if (this.selected) {
      this.loadDriver(this.selected);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selected'] && this.selected) {
      this.loadDriver(this.selected);
    } else if (!this.selected) {
      this.driverForm.reset({
        name: '',
        email: '',
        phone: '',
        license_number: '',
        status: 'disponible'
      });
    }
  }

  loadDriver(driver: Driver): void {
    this.driverForm.patchValue({
      name: driver.name || '',
      email: driver.email || '',
      phone: driver.phone || '',
      license_number: driver.license_number || '',
      status: driver.status || 'disponible'
    });
  }

  onSubmit(): void {
    if (this.driverForm.valid) {
      const data = this.driverForm.value;
      if (this.selected?.id) {
        this.driverService.update(this.selected.id, data).subscribe({
          next: () => {
            this.snackBar.open('Conductor actualizado', 'Cerrar', { duration: 3000 });
            this.reload.emit();
            this.clear.emit();
            this.driverForm.reset();
          },
          error: () => {
            this.snackBar.open('Error al actualizar conductor', 'Cerrar', { duration: 3000 });
          }
        });
      } else {
        this.driverService.create(data).subscribe({
          next: () => {
            this.snackBar.open('Conductor creado', 'Cerrar', { duration: 3000 });
            this.reload.emit();
            this.clear.emit();
            this.driverForm.reset();
          },
          error: () => {
            this.snackBar.open('Error al crear conductor', 'Cerrar', { duration: 3000 });
          }
        });
      }
    }
  }

  onClear(): void {
    this.driverForm.reset({
      name: '',
      email: '',
      phone: '',
      license_number: '',
      status: 'disponible'
    });
    this.clear.emit();
  }
}

