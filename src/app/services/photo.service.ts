import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_URL = 'http://localhost:5000';

export interface Photo {
  id?: number;
  issue_id: number;
  caption: string;
  taken_at: string;
  file?: File;
  url?: string;
  image_url?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PhotoService {
  constructor(private http: HttpClient) {}

  getPhotos(): Observable<{ data: Photo[] }> {
    return this.http.get<{ data: Photo[] }>(`${API_URL}/photos`);
  }

  getPhotoById(id: number): Observable<Photo> {
    return this.http.get<Photo>(`${API_URL}/photos/${id}`);
  }

  uploadPhoto(formData: FormData): Observable<any> {
    return this.http.post(`${API_URL}/photos/upload`, formData);
  }

  updatePhoto(id: number, data: Partial<Photo>): Observable<any> {
    return this.http.put(`${API_URL}/photos/${id}`, data);
  }

  deletePhoto(id: number): Observable<any> {
    return this.http.delete(`${API_URL}/photos/${id}`);
  }
}

