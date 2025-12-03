import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Notification {
  id?: string;
  tipo: 'nuevo' | 'actualizado' | 'cancelado';
  mensaje: string;
  timestamp?: Date;
  estado?: string;
  cliente?: string;
  fecha?: string;
  license_plate?: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public notifications$: Observable<Notification[]> = this.notificationsSubject.asObservable();
  
  private soundEnabled = new BehaviorSubject<boolean>(true);
  public soundEnabled$: Observable<boolean> = this.soundEnabled.asObservable();

  constructor() {
    const stored = localStorage.getItem('soundEnabled');
    if (stored !== null) {
      this.soundEnabled.next(JSON.parse(stored));
    }
  }

  addNotification(notification: Notification): void {
    const notifications = this.notificationsSubject.value;
    const newNotification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date()
    };
    
    this.playNotificationSound(newNotification);
    this.notificationsSubject.next([...notifications, newNotification]);
  }

  clearNotifications(): void {
    this.notificationsSubject.next([]);
  }

  setSoundEnabled(enabled: boolean): void {
    this.soundEnabled.next(enabled);
    localStorage.setItem('soundEnabled', JSON.stringify(enabled));
  }

  private playNotificationSound(notification: Notification): void {
    if (!this.soundEnabled.value) return;

    let soundFile: string | null = null;

    if (notification.tipo === 'nuevo') {
      soundFile = 'assets/sounds/nuevo.mp3';
    } else if (notification.tipo === 'actualizado') {
      soundFile = 'assets/sounds/actualizado.mp3';
    } else if (notification.tipo === 'cancelado') {
      soundFile = 'assets/sounds/cancelado.mp3';
    }

    if (soundFile) {
      const audio = new Audio(soundFile);
      audio.play().catch(err => {
        console.error('Error al reproducir sonido:', err);
      });
    }
  }
}


