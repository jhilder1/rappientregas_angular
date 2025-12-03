import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { ZoneService, Department } from '../../services/zone.service';
import { Motorcycle } from '../../services/motorcycle.service';

@Component({
  selector: 'app-zones-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule
  ],
  templateUrl: './zones-modal.component.html',
  styleUrls: ['./zones-modal.component.css']
})
export class ZonesModalComponent implements OnInit {
  @Input() open = false;
  @Input() moto: Motorcycle | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();

  zoneForm: FormGroup;
  departments: Department[] = [];

  constructor(
    private fb: FormBuilder,
    private zoneService: ZoneService
  ) {
    this.zoneForm = this.fb.group({
      selectedDepartment: ['', Validators.required],
      date: ['', Validators.required],
      driverName: ['', Validators.required],
      driverId: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadDepartments();
  }

  loadDepartments(): void {
    this.zoneService.getDepartments().subscribe({
      next: (data) => {
        this.departments = data;
      },
      error: (error) => {
        console.error('Error loading departments:', error);
      }
    });
  }

  onClose(): void {
    this.zoneForm.reset();
    this.close.emit();
  }

  onSubmit(): void {
    if (this.zoneForm.valid && this.moto?.id) {
      const formData = this.zoneForm.value;
      this.zoneService.updateMotorcycleZone(this.moto.id, {
        zone: formData.selectedDepartment,
        date: formData.date,
        driver: {
          name: formData.driverName,
          id: formData.driverId
        }
      }).subscribe({
        next: () => {
          this.save.emit(formData);
          this.onClose();
        },
        error: (error) => {
          console.error('Error saving zone:', error);
          alert('Error al guardar la zona');
        }
      });
    }
  }
}

