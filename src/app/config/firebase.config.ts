import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, GithubAuthProvider, OAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyC_uu4c4d2JLtKspqE5J04LX27sfe7WDQs",
  authDomain: "rappi-git.firebaseapp.com",
  projectId: "rappi-git",
  storageBucket: "rappi-git.firebasestorage.app",
  messagingSenderId: "1077475116858",
  appId: "1:1077475116858:web:f94c147cd5054176477203",
  measurementId: "G-86D1PMXGLF"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Configurar Google Provider
export const providerGoogle = new GoogleAuthProvider();
providerGoogle.addScope('profile');
providerGoogle.addScope('email');
// setCustomParameters está disponible en Firebase v11
try {
  (providerGoogle as any).setCustomParameters({
    prompt: 'select_account'
  });
} catch (e) {
  // Si no está disponible, continuar sin parámetros personalizados
  console.log('setCustomParameters no disponible para Google');
}

// Configurar GitHub Provider con scopes necesarios
export const providerGithub = new GithubAuthProvider();
providerGithub.addScope('read:user');
providerGithub.addScope('user:email');

// Configurar Microsoft Provider con scopes necesarios
export const microsoftProvider = new OAuthProvider("microsoft.com");
microsoftProvider.addScope('openid');
microsoftProvider.addScope('profile');
microsoftProvider.addScope('email');
// setCustomParameters está disponible en Firebase v11
try {
  (microsoftProvider as any).setCustomParameters({
    prompt: 'consent',
    tenant: 'common'
  });
} catch (e) {
  // Si no está disponible, continuar sin parámetros personalizados
  console.log('setCustomParameters no disponible para Microsoft');
}


