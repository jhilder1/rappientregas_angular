import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { PhotoService, Photo } from '../../services/photo.service';
import { PhotoListComponent } from '../../components/photos/photo-list.component';
import { PhotoFormComponent } from '../../components/photos/photo-form.component';

@Component({
  selector: 'app-photo-page',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    PhotoListComponent,
    PhotoFormComponent
  ],
  templateUrl: './photo-page.component.html',
  styleUrls: ['./photo-page.component.css']
})
export class PhotoPageComponent implements OnInit {
  photos: Photo[] = [];
  formOpen = false;
  editingPhoto: Photo | null = null;

  constructor(private photoService: PhotoService) {}

  ngOnInit(): void {
    this.fetchPhotos();
  }

  fetchPhotos(): void {
    this.photoService.getPhotos().subscribe({
      next: (response) => {
        this.photos = response.data;
      },
      error: (error) => {
        console.error('Error fetching photos:', error);
      }
    });
  }

  handleDelete(id: number): void {
    this.photoService.deletePhoto(id).subscribe({
      next: () => {
        this.fetchPhotos();
      },
      error: (error) => {
        console.error('Error deleting photo:', error);
      }
    });
  }

  handleAdd(): void {
    this.editingPhoto = null;
    this.formOpen = true;
  }

  handleEdit(photo: Photo): void {
    this.editingPhoto = photo;
    this.formOpen = true;
  }

  handleSubmit(data: FormData, id: number | null): void {
    if (id) {
      const updateData: any = {};
      data.forEach((value, key) => {
        updateData[key] = value;
      });
      this.photoService.updatePhoto(id, updateData).subscribe({
        next: () => {
          this.fetchPhotos();
          this.formOpen = false;
        },
        error: (error) => {
          console.error('Error updating photo:', error);
        }
      });
    } else {
      this.photoService.uploadPhoto(data).subscribe({
        next: () => {
          this.fetchPhotos();
          this.formOpen = false;
        },
        error: (error) => {
          console.error('Error uploading photo:', error);
        }
      });
    }
  }

  handleClose(): void {
    this.formOpen = false;
    this.editingPhoto = null;
  }
}


