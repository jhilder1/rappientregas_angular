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
  ) {
    // En Firebase v11, getRedirectResult puede no estar disponible
    // Se manejará solo con popup
  }

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

  private async handleAccountLinking(error: any, provider: any, providerName: string): Promise<void> {
    if (error.code === 'auth/account-exists-with-different-credential') {
      const email = error.customData?.email;
      if (email) {
        // En Firebase v11, intentar obtener información del error
        // Si el error contiene información sobre el método original, intentar vincular
        const errorMessage = error.message || '';
        let suggestedMethod = '';

        // Detectar qué método se usó originalmente basado en el mensaje de error
        if (errorMessage.includes('google') || errorMessage.includes('Google')) {
          suggestedMethod = 'Google';
        } else if (errorMessage.includes('github') || errorMessage.includes('GitHub')) {
          suggestedMethod = 'GitHub';
        } else if (errorMessage.includes('microsoft') || errorMessage.includes('Microsoft')) {
          suggestedMethod = 'Microsoft';
        }

        if (suggestedMethod) {
          throw new Error(`Ya existe una cuenta con este email usando ${suggestedMethod}. Por favor, inicia sesión primero con ${suggestedMethod} y luego podrás vincular ${providerName} desde tu perfil.`);
        }
      }
      throw new Error(`Ya existe una cuenta con este email usando otro método de autenticación. Por favor, inicia sesión con el método que usaste originalmente.`);
    }
    throw error;
  }

  async loginWithGoogle(): Promise<void> {
    try {
      const result = await signInWithPopup(auth, providerGoogle);
      const token = await result.user.getIdToken();
      localStorage.setItem('accessToken', token);
      await this.syncWithBackend(result.user);
    } catch (error: any) {
      console.error('Error completo con Google:', error);

      // Intentar vincular cuentas si es necesario
      try {
        await this.handleAccountLinking(error, providerGoogle, 'Google');
        return;
      } catch (linkError: any) {
        if (linkError.message.includes('Ya existe una cuenta')) {
          throw linkError;
        }
      }

      let errorMessage = 'Error con Google: ';

      if (error.code === 'auth/operation-not-allowed') {
        errorMessage += 'El método de autenticación con Google no está habilitado. Por favor, habilítalo en Firebase Console > Authentication > Sign-in method.';
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage += 'El popup fue bloqueado. Por favor, permite popups para este sitio.';
      } else if (error.code === 'auth/popup-closed-by-user') {
        errorMessage += 'El popup fue cerrado. Por favor, intenta de nuevo.';
      } else if (error.code === 'auth/unauthorized-domain') {
        errorMessage += 'Dominio no autorizado. Verifica la configuración en Firebase Console.';
      } else {
        errorMessage += error.message || 'Error desconocido';
      }

      throw new Error(errorMessage);
    }
  }

  async loginWithGithub(): Promise<void> {
    try {
      const result = await signInWithPopup(auth, providerGithub);
      // En Firebase v11, usar getIdToken() para obtener el token
      const token = await result.user.getIdToken();
      localStorage.setItem('accessToken', token);
      await this.syncWithBackend(result.user);
    } catch (error: any) {
      console.error('Error completo con Github:', error);

      // Intentar vincular cuentas si es necesario
      try {
        await this.handleAccountLinking(error, providerGithub, 'GitHub');
        return;
      } catch (linkError: any) {
        if (linkError.message.includes('Ya existe una cuenta')) {
          throw linkError;
        }
      }

      let errorMessage = 'Error con Github: ';

      if (error.code === 'auth/popup-blocked') {
        errorMessage += 'El popup fue bloqueado. Por favor, permite popups para este sitio.';
      } else if (error.code === 'auth/popup-closed-by-user') {
        errorMessage += 'El popup fue cerrado. Por favor, intenta de nuevo.';
      } else if (error.message?.includes('credential')) {
        errorMessage += 'Error de credenciales. Verifica la configuración de GitHub en Firebase.';
      } else {
        errorMessage += error.message || 'Error desconocido';
      }

      throw new Error(errorMessage);
    }
  }

  async loginWithMicrosoft(): Promise<void> {
    try {
      const result = await signInWithPopup(auth, microsoftProvider);
      // En Firebase v11, usar getIdToken() para obtener el token
      const token = await result.user.getIdToken();
      localStorage.setItem('accessToken', token);
      await this.syncWithBackend(result.user);
    } catch (error: any) {
      console.error('Error completo con Microsoft:', error);

      // Intentar vincular cuentas si es necesario
      try {
        await this.handleAccountLinking(error, microsoftProvider, 'Microsoft');
        return;
      } catch (linkError: any) {
        if (linkError.message.includes('Ya existe una cuenta')) {
          throw linkError;
        }
      }

      let errorMessage = 'Error con Microsoft: ';

      if (error.code === 'auth/popup-blocked') {
        errorMessage += 'El popup fue bloqueado. Por favor, permite popups para este sitio.';
      } else if (error.code === 'auth/popup-closed-by-user') {
        errorMessage += 'El popup fue cerrado. Por favor, intenta de nuevo.';
      } else if (error.message?.includes('credential')) {
        errorMessage += 'Error de credenciales. Verifica la configuración de Microsoft en Firebase.';
      } else if (error.code === 'auth/unauthorized-domain') {
        errorMessage += 'Dominio no autorizado. Verifica la configuración en Firebase Console.';
      } else {
        errorMessage += error.message || 'Error desconocido';
      }

      throw new Error(errorMessage);
    }
  }

  logout(): void {
    localStorage.removeItem('customer');
    localStorage.removeItem('accessToken');
    this.customerService.setCustomer(null);
    this.router.navigate(['/login']);
  }
}


