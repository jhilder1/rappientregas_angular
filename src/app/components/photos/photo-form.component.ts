import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Photo, PhotoService } from '../../services/photo.service';

@Component({
  selector: 'app-photo-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './photo-form.component.html',
  styleUrls: ['./photo-form.component.css']
})
export class PhotoFormComponent implements OnInit, OnChanges {
  @Input() open = false;
  @Input() editingPhoto: Photo | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() submit = new EventEmitter<{ data: FormData; id: number | null }>();

  photoForm: FormGroup;
  selectedFile: File | null = null;

  constructor(private fb: FormBuilder, private photoService: PhotoService) {
    this.photoForm = this.fb.group({
      issue_id: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
      caption: ['', Validators.required],
      taken_at: ['', Validators.required],
      file: [null]
    });
  }

  ngOnInit(): void {
    if (this.editingPhoto) {
      this.loadPhotoData();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['editingPhoto'] && this.editingPhoto) {
      this.loadPhotoData();
    } else if (changes['editingPhoto'] && !this.editingPhoto) {
      this.photoForm.reset();
      this.selectedFile = null;
    }
  }

  loadPhotoData(): void {
    if (this.editingPhoto) {
      const dateValue = this.editingPhoto.taken_at 
        ? new Date(this.editingPhoto.taken_at).toISOString().slice(0, 16)
        : '';
      
      this.photoForm.patchValue({
        issue_id: this.editingPhoto.issue_id || '',
        caption: this.editingPhoto.caption || '',
        taken_at: dateValue,
        file: null
      });
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.photoForm.patchValue({ file: this.selectedFile });
    }
  }

  onSubmit(): void {
    if (this.photoForm.valid) {
      const formData = new FormData();
      formData.append('issue_id', this.photoForm.value.issue_id);
      formData.append('caption', this.photoForm.value.caption);
      formData.append('taken_at', this.photoForm.value.taken_at);
      
      if (this.selectedFile) {
        formData.append('file', this.selectedFile);
      }

      const id = this.editingPhoto?.id || null;
      
      // Si estamos editando y hay un nuevo archivo, primero eliminamos el anterior
      if (this.editingPhoto && this.selectedFile && this.editingPhoto.id) {
        this.photoService.deletePhoto(this.editingPhoto.id).subscribe({
          next: () => {
            this.submit.emit({ data: formData, id: null });
          },
          error: (error) => {
            console.error('Error deleting old photo:', error);
            // Continuar de todos modos
            this.submit.emit({ data: formData, id: null });
          }
        });
      } else {
        this.submit.emit({ data: formData, id });
      }
    }
  }

  onClose(): void {
    this.photoForm.reset();
    this.selectedFile = null;
    this.close.emit();
  }

  get issueIdError(): string {
    const control = this.photoForm.get('issue_id');
    if (control?.hasError('required')) return 'Este campo es obligatorio';
    if (control?.hasError('pattern')) return 'Debe ser un número';
    return '';
  }

  get captionError(): string {
    const control = this.photoForm.get('caption');
    if (control?.hasError('required')) return 'Este campo es obligatorio';
    return '';
  }

  get takenAtError(): string {
    const control = this.photoForm.get('taken_at');
    if (control?.hasError('required')) return 'Este campo es obligatorio';
    return '';
  }

  get fileError(): string {
    if (!this.editingPhoto && !this.selectedFile) {
      return 'Debes seleccionar una imagen';
    }
    return '';
  }
}

