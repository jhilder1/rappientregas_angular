// Declaración de tipos para Firebase
// Esto ayuda a TypeScript a reconocer los módulos de Firebase

declare module 'firebase/app' {
  export interface FirebaseApp {
    name: string;
    options: FirebaseOptions;
    automaticDataCollectionEnabled: boolean;
  }

  export interface FirebaseOptions {
    apiKey?: string;
    authDomain?: string;
    databaseURL?: string;
    projectId?: string;
    storageBucket?: string;
    messagingSenderId?: string;
    appId?: string;
    measurementId?: string;
  }

  export function initializeApp(options: FirebaseOptions, name?: string): FirebaseApp;
  export function getApps(): FirebaseApp[];
  export function getApp(name?: string): FirebaseApp;
}

declare module 'firebase/auth' {
  import { FirebaseApp } from 'firebase/app';

  export interface User {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    getIdToken(): Promise<string>;
  }

  export interface Auth {
    currentUser: User | null;
  }

  export function getAuth(app?: FirebaseApp): Auth;
  
  export class GoogleAuthProvider {
    constructor();
    addScope(scope: string): GoogleAuthProvider;
  }
  
  export class GithubAuthProvider {
    constructor();
    addScope(scope: string): GithubAuthProvider;
  }
  
  export class OAuthProvider {
    constructor(providerId: string);
    addScope(scope: string): OAuthProvider;
  }

  export function signInWithPopup(auth: Auth, provider: GoogleAuthProvider | GithubAuthProvider | OAuthProvider): Promise<{ user: User }>;
  export function signInWithEmailAndPassword(auth: Auth, email: string, password: string): Promise<{ user: User }>;
  export function createUserWithEmailAndPassword(auth: Auth, email: string, password: string): Promise<{ user: User }>;
}

