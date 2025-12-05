import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { forkJoin } from 'rxjs';
import { MenuService, Menu } from '../../services/menu.service';
import { ProductService } from '../../services/product.service';
import { RestaurantService } from '../../services/restaurant.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-menu-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatChipsModule,
    MatSnackBarModule
  ],
  templateUrl: './menu-list.component.html',
  styleUrls: ['./menu-list.component.css']
})
export class MenuListComponent implements OnInit {
  menus: Menu[] = [];
  dataSource = new MatTableDataSource<Menu>([]);
  displayedColumns: string[] = ['name', 'restaurant', 'product', 'price', 'availability', 'actions'];
  formOpen = false;
  menuForm: FormGroup;
  editingMenu: Menu | null = null;
  products: any[] = [];
  restaurants: any[] = [];
  selectedProducts: any[] = [];

  constructor(
    private menuService: MenuService,
    private productService: ProductService,
    private restaurantService: RestaurantService,
    private notificationService: NotificationService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.menuForm = this.fb.group({
      name: ['', [Validators.required]],
      restaurant_id: ['', [Validators.required]],
      product_ids: [[], [Validators.required]],
      price: [0, [Validators.required, Validators.min(0)]],
      availability: [true]
    });
  }

  ngOnInit(): void {
    this.fetchMenus();
    this.fetchProducts();
    this.fetchRestaurants();
  }

  fetchMenus(): void {
    this.menuService.getAll().subscribe({
      next: (data) => {
        this.menus = data;
        this.dataSource.data = data;
        console.log('Menús cargados:', this.menus.length, this.menus);
        // Verificar que los menús tengan datos
        if (this.menus.length > 0) {
          console.log('Primer menú:', this.menus[0]);
        }
      },
      error: (error) => {
        console.error('Error fetching menus:', error);
        this.snackBar.open('Error al cargar menús', 'Cerrar', { duration: 3000 });
      }
    });
  }

  fetchProducts(): void {
    this.productService.getAll().subscribe({
      next: (data) => {
        this.products = data;
        console.log('Productos cargados:', this.products.length);
      },
      error: (error) => {
        console.error('Error fetching products:', error);
      }
    });
  }

  fetchRestaurants(): void {
    this.restaurantService.getAll().subscribe({
      next: (data) => {
        this.restaurants = data;
      },
      error: (error) => {
        console.error('Error fetching restaurants:', error);
      }
    });
  }

  handleAdd(): void {
    this.editingMenu = null;
    this.selectedProducts = [];
    this.menuForm.reset({
      name: '',
      restaurant_id: '',
      product_ids: [],
      price: 0,
      availability: true
    });
    this.formOpen = true;
  }

  handleEdit(menu: Menu): void {
    this.editingMenu = menu;
    const product = this.products.find(p => String(p.id) === String(menu.product_id));
    this.selectedProducts = product ? [product] : [];
    this.menuForm.patchValue({
      name: menu.name || '',
      restaurant_id: menu.restaurant_id,
      product_ids: [menu.product_id],
      price: menu.price || 0,
      availability: menu.availability ?? true
    });
    this.formOpen = true;
  }

  handleDelete(id: string): void {
    if (confirm('¿Está seguro de eliminar este menú?')) {
      this.menuService.delete(id).subscribe({
        next: () => {
          this.fetchMenus();
          this.snackBar.open('Menú eliminado', 'Cerrar', { duration: 3000 });
        },
        error: (error) => {
          console.error('Error deleting menu:', error);
          this.snackBar.open('Error al eliminar menú', 'Cerrar', { duration: 3000 });
        }
      });
    }
  }

  handleSubmit(): void {
    if (this.menuForm.valid) {
      const formValue = this.menuForm.value;
      const productIds = formValue.product_ids || [];

      if (this.editingMenu?.id) {
        // Para editar, solo actualizamos el menú existente con el primer producto
        const data = {
          name: formValue.name,
          restaurant_id: formValue.restaurant_id,
          product_id: productIds[0],
          price: formValue.price || 0,
          availability: formValue.availability
        };
        this.menuService.update(this.editingMenu.id, data).subscribe({
          next: (response) => {
            this.notificationService.addNotification({
              tipo: 'actualizado',
              mensaje: `Menú "${formValue.name || 'Sin nombre'}" actualizado`
            });
            this.fetchMenus();
            this.formOpen = false;
            this.selectedProducts = [];
            this.snackBar.open('Menú actualizado', 'Cerrar', { duration: 3000 });
          },
          error: (error) => {
            console.error('Error updating menu:', error);
            console.error('Error completo:', JSON.stringify(error, null, 2));
            this.snackBar.open('Error al actualizar menú', 'Cerrar', { duration: 3000 });
          }
        });
      } else {
        // Para crear, creamos un menú por cada producto seleccionado
        if (productIds.length === 0) {
          this.snackBar.open('Selecciona al menos un producto', 'Cerrar', { duration: 3000 });
          return;
        }

        const createRequests = productIds.map((productId: string) => {
          const menuData = {
            name: formValue.name,
            restaurant_id: formValue.restaurant_id,
            product_id: productId,
            price: formValue.price || 0,
            availability: formValue.availability
          };
          return this.menuService.create(menuData);
        });

        forkJoin(createRequests).subscribe({
          next: () => {
            this.notificationService.addNotification({
              tipo: 'nuevo',
              mensaje: `${productIds.length} menú(s) "${formValue.name || 'Sin nombre'}" creado(s)`
            });
            this.fetchMenus();
            this.formOpen = false;
            this.selectedProducts = [];
            this.snackBar.open(`${productIds.length} menú(s) creado(s) exitosamente`, 'Cerrar', { duration: 3000 });
          },
          error: (error) => {
            console.error('Error creating menus:', error);
            this.snackBar.open('Error al crear menú(s)', 'Cerrar', { duration: 3000 });
          }
        });
      }
    }
  }

  onProductSelectionChange(selectedIds: string[]): void {
    this.selectedProducts = this.products.filter(p => selectedIds.includes(String(p.id)));
  }

  handleClose(): void {
    this.formOpen = false;
    this.editingMenu = null;
    this.menuForm.reset();
  }

  getRestaurantName(menu: Menu): string {
    // Primero intentar usar la relación del backend si está disponible
    if (menu.restaurant?.name) {
      return menu.restaurant.name;
    }
    // Si no, buscar en la lista local
    const restaurant = this.restaurants.find(r => String(r.id) === String(menu.restaurant_id));
    return restaurant?.name || 'N/A';
  }

  getProductName(menu: Menu): string {
    // Primero intentar usar la relación del backend si está disponible
    if (menu.product?.name) {
      return menu.product.name;
    }
    // Si no, buscar en la lista local
    const product = this.products.find(p => String(p.id) === String(menu.product_id));
    return product?.name || 'N/A';
  }

}


