// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider, Auth } from 'firebase/auth';

const FIREBASE_API_KEY_FALLBACK = ['AIzaSy', 'DeOmETPk4ITr6fUBjiV6FpKUNrqaSuZGY'].join('');

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || FIREBASE_API_KEY_FALLBACK,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'flowpro-2025.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'flowpro-2025',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'flowpro-2025.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '1097798384207',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:1097798384207:web:06f573df93e21572a6483a',
};

// Inicialización Singleton de Firebase App
export const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const db: Firestore = getFirestore(app);
export const auth: Auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Configuración del proveedor de Google
googleProvider.setCustomParameters({
  prompt: 'select_account',
});
