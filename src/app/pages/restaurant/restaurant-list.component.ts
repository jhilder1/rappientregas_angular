import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { RestaurantService, Restaurant } from '../../services/restaurant.service';

@Component({
  selector: 'app-restaurant-list',
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
    MatDialogModule,
    MatSnackBarModule
  ],
  templateUrl: './restaurant-list.component.html',
  styleUrls: ['./restaurant-list.component.css']
})
export class RestaurantListComponent implements OnInit {
  restaurants: Restaurant[] = [];
  displayedColumns: string[] = ['name', 'address', 'phone', 'email', 'actions'];
  formOpen = false;
  restaurantForm: FormGroup;
  editingRestaurant: Restaurant | null = null;

  constructor(
    private restaurantService: RestaurantService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.restaurantForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      address: ['', [Validators.required]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9+\-\s()]+$/)]],
      email: ['', [Validators.email]],
      description: ['']
    });
  }

  ngOnInit(): void {
    this.fetchRestaurants();
  }

  fetchRestaurants(): void {
    this.restaurantService.getAll().subscribe({
      next: (data) => {
        this.restaurants = data;
      },
      error: (error) => {
        console.error('Error fetching restaurants:', error);
        this.snackBar.open('Error al cargar restaurantes', 'Cerrar', { duration: 3000 });
      }
    });
  }

  handleAdd(): void {
    this.editingRestaurant = null;
    this.restaurantForm.reset();
    this.formOpen = true;
  }

  handleEdit(restaurant: Restaurant): void {
    this.editingRestaurant = restaurant;
    this.restaurantForm.patchValue(restaurant);
    this.formOpen = true;
  }

  handleDelete(id: string): void {
    if (confirm('¿Está seguro de eliminar este restaurante?')) {
      this.restaurantService.delete(id).subscribe({
        next: () => {
          this.fetchRestaurants();
          this.snackBar.open('Restaurante eliminado', 'Cerrar', { duration: 3000 });
        },
        error: (error) => {
          console.error('Error deleting restaurant:', error);
          this.snackBar.open('Error al eliminar restaurante', 'Cerrar', { duration: 3000 });
        }
      });
    }
  }

  handleSubmit(): void {
    if (this.restaurantForm.valid) {
      const data = this.restaurantForm.value;
      if (this.editingRestaurant?.id) {
        this.restaurantService.update(this.editingRestaurant.id, data).subscribe({
          next: () => {
            this.fetchRestaurants();
            this.formOpen = false;
            this.snackBar.open('Restaurante actualizado', 'Cerrar', { duration: 3000 });
          },
          error: (error) => {
            console.error('Error updating restaurant:', error);
            this.snackBar.open('Error al actualizar restaurante', 'Cerrar', { duration: 3000 });
          }
        });
      } else {
        this.restaurantService.create(data).subscribe({
          next: () => {
            this.fetchRestaurants();
            this.formOpen = false;
            this.snackBar.open('Restaurante creado', 'Cerrar', { duration: 3000 });
          },
          error: (error) => {
            console.error('Error creating restaurant:', error);
            this.snackBar.open('Error al crear restaurante', 'Cerrar', { duration: 3000 });
          }
        });
      }
    }
  }

  handleClose(): void {
    this.formOpen = false;
    this.editingRestaurant = null;
    this.restaurantForm.reset();
  }
}

