import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_URL = 'http://localhost:5000';

export interface Issue {
  id?: string | number;
  motorcycle_id: string | number;
  issue_type?: string;
  type?: 'accidente' | 'falla_mecanica' | 'pinchazo' | 'otro' | 'accident' | 'breakdown' | 'maintenance';
  description?: string;
  date_reported?: string;
  date?: string;
  status?: 'open' | 'in_progress' | 'resolved';
  resolved?: boolean;
  photos?: Photo[];
  motorcycle?: any;
}

export interface Photo {
  id?: string;
  issue_id: string;
  image_url: string;
  uploaded_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class IssueService {
  constructor(private http: HttpClient) { }

  getAll(): Observable<Issue[]> {
    return this.http.get<Issue[]>(`${API_URL}/issues`);
  }

  getById(id: string): Observable<Issue> {
    return this.http.get<Issue>(`${API_URL}/issues/${id}`);
  }

  create(issue: Issue): Observable<Issue> {
    return this.http.post<Issue>(`${API_URL}/issues`, issue);
  }

  update(id: string, issue: Issue): Observable<Issue> {
    return this.http.put<Issue>(`${API_URL}/issues/${id}`, issue);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${API_URL}/issues/${id}`);
  }

  getByMotorcycle(motorcycleId: string): Observable<Issue[]> {
    return this.http.get<Issue[]>(`${API_URL}/issues/motorcycle/${motorcycleId}`);
  }

  addPhoto(issueId: string, photo: Photo): Observable<Photo> {
    return this.http.post<Photo>(`${API_URL}/issues/${issueId}/photos`, photo);
  }
}



