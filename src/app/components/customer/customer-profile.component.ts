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
  @Input() isNewUser = false;
  @Output() update = new EventEmitter<Partial<Customer>>();
  @Output() create = new EventEmitter<Partial<Customer>>();

  profileForm: FormGroup;
  editMode = false;

  constructor(private fb: FormBuilder) {
    this.profileForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^\d+$/), Validators.minLength(10)]]
    });
  }

  ngOnInit(): void {
    if (this.isNewUser) {
      this.editMode = true;
      this.profileForm.reset({
        name: '',
        email: '',
        phone: ''
      });
    } else if (this.user) {
      this.profileForm.patchValue({
        name: this.user.name || '',
        email: this.user.email || '',
        phone: this.user.phone || ''
      });
      this.editMode = false;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isNewUser'] && this.isNewUser) {
      this.editMode = true;
      this.profileForm.reset({
        name: '',
        email: '',
        phone: ''
      });
    } else if (changes['user'] && this.user && !this.isNewUser) {
      this.profileForm.patchValue({
        name: this.user.name || '',
        email: this.user.email || '',
        phone: this.user.phone || ''
      });
      this.editMode = false;
    }
  }

  toggleEditMode(): void {
    this.editMode = !this.editMode;
    if (!this.editMode && !this.isNewUser) {
      if (this.user) {
        this.profileForm.patchValue({
          name: this.user.name || '',
          email: this.user.email || '',
          phone: this.user.phone || ''
        });
      }
    }
  }

  onSubmit(): void {
    if (this.profileForm.valid) {
      if (this.isNewUser) {
        this.create.emit(this.profileForm.value);
      } else {
        this.update.emit(this.profileForm.value);
        this.editMode = false;
      }
    }
  }

  onCancel(): void {
    if (this.isNewUser) {
      this.profileForm.reset();
      this.create.emit({ cancel: true } as any);
    } else {
      this.toggleEditMode();
    }
  }

  get nameError(): string {
    const control = this.profileForm.get('name');
    if (control?.hasError('required')) return 'El nombre es obligatorio';
    if (control?.hasError('minlength')) return 'Mínimo 2 caracteres';
    return '';
  }

  get emailError(): string {
    const control = this.profileForm.get('email');
    if (control?.hasError('required')) return 'El email es obligatorio';
    if (control?.hasError('email')) return 'Email inválido';
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

