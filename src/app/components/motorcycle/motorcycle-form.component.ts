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
import { MotorcycleService, Motorcycle } from '../../services/motorcycle.service';

function generateRandomPlate(): string {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const randomLetters = Array(3).fill(null)
    .map(() => letters.charAt(Math.floor(Math.random() * letters.length)))
    .join('');
  const randomNumbers = Array(3).fill(null)
    .map(() => numbers.charAt(Math.floor(Math.random() * numbers.length)))
    .join('');
  return `${randomLetters}${randomNumbers}`;
}

@Component({
  selector: 'app-motorcycle-form',
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
  templateUrl: './motorcycle-form.component.html',
  styleUrls: ['./motorcycle-form.component.css']
})
export class MotorcycleFormComponent implements OnInit, OnChanges {
  @Input() selected: Motorcycle | null = null;
  @Output() clear = new EventEmitter<void>();
  @Output() reload = new EventEmitter<void>();

  motorcycleForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private motorcycleService: MotorcycleService,
    private snackBar: MatSnackBar
  ) {
    this.motorcycleForm = this.fb.group({
      license_plate: ['', [Validators.required, Validators.pattern(/^[A-Z0-9-]{5,10}$/)]],
      brand: ['', Validators.required],
      year: [new Date().getFullYear(), [Validators.required, Validators.min(1900), Validators.max(new Date().getFullYear())]],
      status: ['available', Validators.required]
    });
  }

  ngOnInit(): void {
    if (this.selected) {
      this.loadMotorcycle(this.selected);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selected'] && this.selected) {
      this.loadMotorcycle(this.selected);
    } else if (!this.selected) {
      this.motorcycleForm.reset({
        license_plate: '',
        brand: '',
        year: new Date().getFullYear(),
        status: 'available'
      });
    }
  }

  loadMotorcycle(moto: Motorcycle): void {
    this.motorcycleForm.patchValue({
      license_plate: moto.license_plate || moto.plate || '',
      brand: moto.brand || '',
      year: moto.year || new Date().getFullYear(),
      status: moto.status || 'available'
    });
  }

  generatePlate(): void {
    this.motorcycleForm.patchValue({
      license_plate: generateRandomPlate()
    });
  }

  onSubmit(): void {
    if (this.motorcycleForm.valid) {
      const data = this.motorcycleForm.value;
      if (this.selected?.id) {
        this.motorcycleService.update(this.selected.id, data).subscribe({
          next: () => {
            this.snackBar.open('Moto actualizada', 'Cerrar', { duration: 3000 });
            this.reload.emit();
            this.clear.emit();
            this.motorcycleForm.reset();
          },
          error: (error) => {
            console.error('Error updating motorcycle:', error);
            this.snackBar.open('Error al actualizar moto', 'Cerrar', { duration: 3000 });
          }
        });
      } else {
        this.motorcycleService.create(data).subscribe({
          next: () => {
            this.snackBar.open('Moto creada', 'Cerrar', { duration: 3000 });
            this.reload.emit();
            this.clear.emit();
            this.motorcycleForm.reset();
          },
          error: (error) => {
            console.error('Error creating motorcycle:', error);
            this.snackBar.open('Error al crear moto', 'Cerrar', { duration: 3000 });
          }
        });
      }
    }
  }

  onClear(): void {
    this.motorcycleForm.reset({
      license_plate: '',
      brand: '',
      year: new Date().getFullYear(),
      status: 'available'
    });
    this.clear.emit();
  }
}

