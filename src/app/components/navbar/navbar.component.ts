import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CustomerService } from '../../services/customer.service';
import { AuthService } from '../../services/auth.service';
import { NotificationBellComponent } from '../notifications/notification-bell.component';
import { Observable } from 'rxjs';
import { Customer } from '../../services/customer.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, MatButtonModule, NotificationBellComponent],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  customer$: Observable<Customer | null>;
  open = false;
  openConductores = false;
  openAdmin = false;
  openLocales = false;
  currentPath = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private customerService: CustomerService,
    private authService: AuthService
  ) {
    this.customer$ = this.customerService.customer$;
  }

  ngOnInit(): void {
    this.router.events.subscribe(() => {
      this.currentPath = this.router.url;
    });
    this.currentPath = this.router.url;
  }

  shouldShowNavbar(): boolean {
    return this.currentPath !== '/login';
  }

  handleLogout(): void {
    this.authService.logout();
  }

  toggleMenu(): void {
    this.open = !this.open;
  }

  toggleConductores(): void {
    this.openConductores = !this.openConductores;
    this.openAdmin = false;
    this.openLocales = false;
  }

  toggleAdmin(): void {
    this.openAdmin = !this.openAdmin;
    this.openConductores = false;
    this.openLocales = false;
  }

  toggleLocales(): void {
    this.openLocales = !this.openLocales;
    this.openConductores = false;
    this.openAdmin = false;
  }

  closeMenus(): void {
    this.open = false;
    this.openConductores = false;
    this.openAdmin = false;
    this.openLocales = false;
  }
}

