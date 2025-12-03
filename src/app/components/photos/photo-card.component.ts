import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Photo } from '../../services/photo.service';

@Component({
  selector: 'app-photo-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './photo-card.component.html',
  styleUrls: ['./photo-card.component.css']
})
export class PhotoCardComponent {
  @Input() photo!: Photo;
  @Output() delete = new EventEmitter<number>();
  @Output() edit = new EventEmitter<Photo>();

  get imageUrl(): string {
    return `http://localhost:5000/${this.photo.image_url || ''}`;
  }

  get formattedDate(): string {
    if (!this.photo.taken_at) return 'Sin fecha';
    return new Date(this.photo.taken_at).toLocaleString();
  }

  onEdit(): void {
    this.edit.emit(this.photo);
  }

  onDelete(): void {
    if (this.photo.id) {
      this.delete.emit(this.photo.id);
    }
  }
}


