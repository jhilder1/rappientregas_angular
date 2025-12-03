import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Photo } from '../../services/photo.service';
import { PhotoCardComponent } from './photo-card.component';

@Component({
  selector: 'app-photo-list',
  standalone: true,
  imports: [CommonModule, PhotoCardComponent],
  template: `
    <div class="photo-grid">
      <app-photo-card
        *ngFor="let photo of photos"
        [photo]="photo"
        (delete)="onDelete($event)"
        (edit)="onEdit($event)"
        class="photo-item">
      </app-photo-card>
    </div>
  `,
  styles: [`
    .photo-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 1rem;
      width: 100%;
    }
    
    @media (max-width: 600px) {
      .photo-grid {
        grid-template-columns: 1fr;
      }
    }
    
    @media (min-width: 601px) and (max-width: 960px) {
      .photo-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
    
    @media (min-width: 961px) and (max-width: 1280px) {
      .photo-grid {
        grid-template-columns: repeat(3, 1fr);
      }
    }
  `]
})
export class PhotoListComponent {
  @Input() photos: Photo[] = [];
  @Output() delete = new EventEmitter<number>();
  @Output() edit = new EventEmitter<Photo>();
  @Output() add = new EventEmitter<void>();

  onDelete(id: number): void {
    this.delete.emit(id);
  }

  onEdit(photo: Photo): void {
    this.edit.emit(photo);
  }
}

