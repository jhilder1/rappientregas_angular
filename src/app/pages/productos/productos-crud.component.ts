import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { ProductService, Product } from '../../services/product.service';

@Component({
  selector: 'app-productos-crud',
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
    MatSnackBarModule
  ],
  templateUrl: './productos-crud.component.html',
  styleUrls: ['./productos-crud.component.css']
})
export class ProductosCrudComponent implements OnInit {
  products: Product[] = [];
  displayedColumns: string[] = ['name', 'description', 'price', 'category', 'actions'];
  formOpen = false;
  productForm: FormGroup;
  editingProduct: Product | null = null;

  constructor(
    private productService: ProductService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      price: [0, [Validators.required, Validators.min(0)]],
      category: ['']
    });
  }

  ngOnInit(): void {
    this.fetchProducts();
  }

  fetchProducts(): void {
    this.productService.getAll().subscribe({
      next: (data) => this.products = data,
      error: (error) => {
        console.error('Error fetching products:', error);
        this.snackBar.open('Error al cargar productos', 'Cerrar', { duration: 3000 });
      }
    });
  }

  handleAdd(): void {
    this.editingProduct = null;
    this.productForm.reset({ price: 0 });
    this.formOpen = true;
  }

  handleEdit(product: Product): void {
    this.editingProduct = product;
    this.productForm.patchValue(product);
    this.formOpen = true;
  }

  handleDelete(id: string): void {
    if (confirm('¿Está seguro de eliminar este producto?')) {
      this.productService.delete(id).subscribe({
        next: () => {
          this.fetchProducts();
          this.snackBar.open('Producto eliminado', 'Cerrar', { duration: 3000 });
        },
        error: (error) => {
          console.error('Error deleting product:', error);
          this.snackBar.open('Error al eliminar producto', 'Cerrar', { duration: 3000 });
        }
      });
    }
  }

  handleSubmit(): void {
    if (this.productForm.valid) {
      const data = this.productForm.value;
      if (this.editingProduct?.id) {
        this.productService.update(this.editingProduct.id, data).subscribe({
          next: () => {
            this.fetchProducts();
            this.formOpen = false;
            this.snackBar.open('Producto actualizado', 'Cerrar', { duration: 3000 });
          },
          error: (error) => {
            console.error('Error updating product:', error);
            this.snackBar.open('Error al actualizar producto', 'Cerrar', { duration: 3000 });
          }
        });
      } else {
        this.productService.create(data).subscribe({
          next: () => {
            this.fetchProducts();
            this.formOpen = false;
            this.snackBar.open('Producto creado', 'Cerrar', { duration: 3000 });
          },
          error: (error) => {
            console.error('Error creating product:', error);
            this.snackBar.open('Error al crear producto', 'Cerrar', { duration: 3000 });
          }
        });
      }
    }
  }

  handleClose(): void {
    this.formOpen = false;
    this.editingProduct = null;
    this.productForm.reset();
  }
}

