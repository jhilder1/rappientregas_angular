import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { NotificationService, Notification } from '../../services/notification.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatBadgeModule,
    MatMenuModule,
    MatListModule,
    MatDividerModule
  ],
  templateUrl: './notification-bell.component.html',
  styleUrls: ['./notification-bell.component.css']
})
export class NotificationBellComponent implements OnInit {
  notifications$: Observable<Notification[]>;
  menuAnchor: HTMLElement | null = null;

  constructor(
    private notificationService: NotificationService,
    private router: Router
  ) {
    this.notifications$ = this.notificationService.notifications$;
  }

  ngOnInit(): void {}

  openMenu(event: MouseEvent): void {
    this.menuAnchor = event.currentTarget as HTMLElement;
  }

  closeMenu(): void {
    this.menuAnchor = null;
  }

  clearNotifications(): void {
    this.notificationService.clearNotifications();
  }

  navigateToMap(plate: string): void {
    this.closeMenu();
    this.router.navigate(['/mapa-moto', plate]);
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'Entregado': '#4caf50',
      'En progreso': '#2196f3',
      'Pendiente': '#ff9800',
      'Cancelado': '#f44336'
    };
    return colors[status] || '#757575';
  }

  getStatusIcon(status: string): string {
    const icons: { [key: string]: string } = {
      'Entregado': 'assignment_turned_in',
      'En progreso': 'directions_bike',
      'Pendiente': 'pending_actions',
      'Cancelado': 'cancel'
    };
    return icons[status] || 'notifications';
  }

  getNotificationType(notification: Notification): string {
    return notification.tipo === 'nuevo' ? 'Nuevo pedido' : 'Pedido actualizado';
  }
}

