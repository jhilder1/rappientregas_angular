import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  User
} from 'firebase/auth';
import { auth, providerGoogle, providerGithub, microsoftProvider } from '../config/firebase.config';
import { CustomerService } from './customer.service';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

const API_URL = 'http://localhost:5000';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(
    private router: Router,
    private customerService: CustomerService,
    private http: HttpClient
  ) {}

  async syncWithBackend(user: User): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.http.post(`${API_URL}/auth/sync`, {
          uid: user.uid,
          email: user.email,
          name: user.displayName,
          photo: user.photoURL
        })
      );
      
      const customer = {
        id: user.uid,
        email: user.email || '',
        name: user.displayName || '',
        photo: user.photoURL || ''
      };
      
      this.customerService.setCustomer(customer);
      this.router.navigate(['/clientes']);
    } catch (error) {
      console.error('Error syncing with backend:', error);
      // Even if sync fails, set customer from Firebase user
      const customer = {
        id: user.uid,
        email: user.email || '',
        name: user.displayName || '',
        photo: user.photoURL || ''
      };
      this.customerService.setCustomer(customer);
      this.router.navigate(['/clientes']);
    }
  }

  async login(email: string, password: string): Promise<void> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await this.syncWithBackend(userCredential.user);
    } catch (error: any) {
      throw new Error('Error durante el login: ' + error.message);
    }
  }

  async register(email: string, password: string, name: string, phone: string): Promise<void> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const userWithExtras = {
        id: userCredential.user.uid,
        email: userCredential.user.email || email,
        name: name,
        phone: phone,
        photo: userCredential.user.photoURL || ''
      };
      
      await this.syncWithBackend(userCredential.user);
    } catch (error: any) {
      throw new Error('Error durante el registro: ' + error.message);
    }
  }

  async loginWithGoogle(): Promise<void> {
    try {
      const result = await signInWithPopup(auth, providerGoogle);
      const token = await result.user.getIdToken();
      localStorage.setItem('accessToken', token);
      await this.syncWithBackend(result.user);
    } catch (error: any) {
      throw new Error('Error con Google: ' + error.message);
    }
  }

  async loginWithGithub(): Promise<void> {
    try {
      const result = await signInWithPopup(auth, providerGithub);
      const token = await result.user.getIdToken();
      localStorage.setItem('accessToken', token);
      await this.syncWithBackend(result.user);
    } catch (error: any) {
      throw new Error('Error con Github: ' + error.message);
    }
  }

  async loginWithMicrosoft(): Promise<void> {
    try {
      const result = await signInWithPopup(auth, microsoftProvider);
      const token = await result.user.getIdToken();
      localStorage.setItem('accessToken', token);
      await this.syncWithBackend(result.user);
    } catch (error: any) {
      throw new Error('Error con Microsoft: ' + error.message);
    }
  }

  logout(): void {
    localStorage.removeItem('customer');
    localStorage.removeItem('accessToken');
    this.customerService.setCustomer(null);
    this.router.navigate(['/login']);
  }
}


