import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Customer } from '../../services/customer.service';

@Component({
  selector: 'app-customer-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './customer-profile.component.html',
  styleUrls: ['./customer-profile.component.css']
})
export class CustomerProfileComponent implements OnInit, OnChanges {
  @Input() user: Customer | null = null;
  @Output() update = new EventEmitter<Partial<Customer>>();

  profileForm: FormGroup;
  editMode = false;

  constructor(private fb: FormBuilder) {
    this.profileForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      phone: ['', [Validators.required, Validators.pattern(/^\d+$/), Validators.minLength(10)]]
    });
  }

  ngOnInit(): void {
    if (this.user) {
      this.profileForm.patchValue({
        name: this.user.name || '',
        phone: this.user.phone || ''
      });
    }
  }

  ngOnChanges(): void {
    if (this.user) {
      this.profileForm.patchValue({
        name: this.user.name || '',
        phone: this.user.phone || ''
      });
    }
  }

  toggleEditMode(): void {
    this.editMode = !this.editMode;
    if (!this.editMode) {
      // Reset form when canceling
      if (this.user) {
        this.profileForm.patchValue({
          name: this.user.name || '',
          phone: this.user.phone || ''
        });
      }
    }
  }

  onSubmit(): void {
    if (this.profileForm.valid) {
      this.update.emit(this.profileForm.value);
      this.editMode = false;
    }
  }

  get nameError(): string {
    const control = this.profileForm.get('name');
    if (control?.hasError('required')) return 'El nombre es obligatorio';
    if (control?.hasError('minlength')) return 'Mínimo 2 caracteres';
    return '';
  }

  get phoneError(): string {
    const control = this.profileForm.get('phone');
    if (control?.hasError('required')) return 'El teléfono es obligatorio';
    if (control?.hasError('pattern')) return 'Solo números';
    if (control?.hasError('minlength')) return 'Mínimo 10 dígitos';
    return '';
  }
}

