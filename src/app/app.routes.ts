import { Routes } from '@angular/router';
import { LoginPageComponent } from './pages/login/login-page.component';
import { CustomersPageComponent } from './pages/customer/customers-page.component';
import { MotorcyclePageComponent } from './pages/motorcycle/motorcycle-page.component';
import { ShiftsPageComponent } from './pages/shifts/shifts-page.component';
import { OrdersPageComponent } from './pages/orders/orders-page.component';
import { AddressCrudComponent } from './pages/address/address-crud.component';
import { IssuePageComponent } from './pages/issue/issue-page.component';
import { ChatbotComponent } from './pages/chatbot/chatbot.component';
import { RestaurantListComponent } from './pages/restaurant/restaurant-list.component';
import { MenuListComponent } from './pages/menu/menu-list.component';
import { DriverListComponent } from './pages/driver/driver-list.component';
import { GraficosPageComponent } from './pages/graficos/graficos-page.component';
import { PhotoPageComponent } from './pages/photos/photo-page.component';
import { ProductosCrudComponent } from './pages/productos/productos-crud.component';
import { MotoMapComponent } from './components/map/moto-map.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginPageComponent },
  { path: 'clientes', component: CustomersPageComponent, canActivate: [authGuard] },
  { path: 'motos', component: MotorcyclePageComponent, canActivate: [authGuard] },
  { path: 'turnos', component: ShiftsPageComponent, canActivate: [authGuard] },
  { path: 'mapa-moto/:plate', component: MotoMapComponent, canActivate: [authGuard] },
  { path: 'productos', component: ProductosCrudComponent, canActivate: [authGuard] },
  { path: 'ordenes', component: OrdersPageComponent, canActivate: [authGuard] },
  { path: 'direcciones', component: AddressCrudComponent, canActivate: [authGuard] },
  { path: 'incovenientes', component: IssuePageComponent, canActivate: [authGuard] },
  { path: 'chat', component: ChatbotComponent, canActivate: [authGuard] },
  { path: 'restaurantes', component: RestaurantListComponent, canActivate: [authGuard] },
  { path: 'menus', component: MenuListComponent, canActivate: [authGuard] },
  { path: 'conductores', component: DriverListComponent, canActivate: [authGuard] },
  { path: 'graficos', component: GraficosPageComponent, canActivate: [authGuard] },
  { path: 'fotos', component: PhotoPageComponent, canActivate: [authGuard] },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];
