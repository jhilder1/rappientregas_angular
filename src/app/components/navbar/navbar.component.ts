import { Component, OnInit, OnDestroy } from '@angular/core';
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
export class NavbarComponent implements OnInit, OnDestroy {
  customer$: Observable<Customer | null>;
  open = false;
  openConductores = false;
  openAdmin = false;
  openLocales = false;
  currentPath = '';
  private clickListener?: () => void;

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

    // Cerrar menús al hacer clic fuera
    this.clickListener = () => {
      if (this.openAdmin || this.openConductores || this.openLocales) {
        this.closeMenus();
      }
    };
    setTimeout(() => {
      document.addEventListener('click', this.clickListener!);
    }, 0);
  }

  ngOnDestroy(): void {
    if (this.clickListener) {
      document.removeEventListener('click', this.clickListener);
    }
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

  toggleConductores(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.openConductores = !this.openConductores;
    this.openAdmin = false;
    this.openLocales = false;
  }

  toggleAdmin(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.openAdmin = !this.openAdmin;
    this.openConductores = false;
    this.openLocales = false;
  }

  toggleLocales(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
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

  onDropdownClick(event: Event): void {
    event.stopPropagation();
  }
}

