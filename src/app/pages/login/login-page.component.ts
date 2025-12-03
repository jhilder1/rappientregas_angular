import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDividerModule,
    MatIconModule
  ],
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css']
})
export class LoginPageComponent {
  loginForm: FormGroup;
  isRegistering = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      name: [''],
      phone: ['']
    });
  }

  toggleAuthMode(): void {
    this.isRegistering = !this.isRegistering;
    this.errorMessage = '';
    
    if (this.isRegistering) {
      this.loginForm.get('name')?.setValidators([Validators.required]);
      this.loginForm.get('phone')?.setValidators([Validators.required]);
    } else {
      this.loginForm.get('name')?.clearValidators();
      this.loginForm.get('phone')?.clearValidators();
    }
    
    this.loginForm.get('name')?.updateValueAndValidity();
    this.loginForm.get('phone')?.updateValueAndValidity();
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      const { email, password, name, phone } = this.loginForm.value;
      this.errorMessage = '';

      if (this.isRegistering) {
        this.authService.register(email, password, name, phone)
          .then(() => {
            alert('Registro exitoso!');
          })
          .catch((error) => {
            this.errorMessage = error.message;
            alert('Error durante el registro: ' + error.message);
          });
      } else {
        this.authService.login(email, password)
          .then(() => {
            alert('Login exitoso!');
          })
          .catch((error) => {
            this.errorMessage = error.message;
            alert('Error durante el login: ' + error.message);
          });
      }
    }
  }

  handleGoogleLogin(): void {
    this.authService.loginWithGoogle()
      .then(() => {
        alert('Google login exitoso!');
      })
      .catch((error) => {
        this.errorMessage = error.message;
        alert('Error con Google: ' + error.message);
      });
  }

  handleGithubLogin(): void {
    this.authService.loginWithGithub()
      .then(() => {
        alert('Github login exitoso!');
      })
      .catch((error) => {
        this.errorMessage = error.message;
        alert('Error con Github: ' + error.message);
      });
  }

  handleMicrosoftLogin(): void {
    this.authService.loginWithMicrosoft()
      .then(() => {
        alert('Microsoft login exitoso!');
      })
      .catch((error) => {
        this.errorMessage = error.message;
        alert('Error con Microsoft: ' + error.message);
      });
  }
}


