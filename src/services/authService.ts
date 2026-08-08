// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  UserCredential,
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';

/**
 * Inicia sesión con correo electrónico y contraseña.
 */
export async function loginWithEmail(email: string, password: string): Promise<UserCredential> {
  try {
    return await signInWithEmailAndPassword(auth, email, password);
  } catch (error: any) {
    console.error('Error al iniciar sesión con email:', error);
    throw new Error(traducirErrorAuth(error.code || error.message));
  }
}

/**
 * Registra un nuevo usuario con correo electrónico y contraseña.
 */
export async function registerWithEmail(email: string, password: string): Promise<UserCredential> {
  try {
    return await createUserWithEmailAndPassword(auth, email, password);
  } catch (error: any) {
    console.error('Error al registrar usuario:', error);
    throw new Error(traducirErrorAuth(error.code || error.message));
  }
}

/**
 * Inicia sesión mediante Google OAuth.
 */
export async function loginWithGoogle(): Promise<UserCredential> {
  try {
    return await signInWithPopup(auth, googleProvider);
  } catch (error: any) {
    console.error('Error al iniciar sesión con Google:', error);
    throw new Error(traducirErrorAuth(error.code || error.message));
  }
}

/**
 * Cierra la sesión activa del usuario.
 */
export async function logoutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error: any) {
    console.error('Error al cerrar sesión:', error);
    throw new Error('No se pudo cerrar la sesión.');
  }
}

/**
 * Traduce códigos de error comunes de Firebase Auth a español.
 */
function traducirErrorAuth(codigo: string): string {
  if (codigo.includes('auth/invalid-email')) return 'El correo electrónico no es válido.';
  if (codigo.includes('auth/user-not-found') || codigo.includes('auth/wrong-password')) return 'Credenciales incorrectas.';
  if (codigo.includes('auth/invalid-credential')) return 'Correo o contraseña incorrectos.';
  if (codigo.includes('auth/email-already-in-use')) return 'El correo ya está registrado.';
  if (codigo.includes('auth/weak-password')) return 'La contraseña debe tener al menos 6 caracteres.';
  if (codigo.includes('auth/popup-closed-by-user')) return 'Se cerró la ventana de autenticación con Google.';
  return 'Ocurrió un error al procesar la autenticación.';
}
