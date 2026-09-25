// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  EnlacesGoogleDriveUsuario,
  prepararPayloadEnlaces,
} from '../lib/enlacesGoogleDriveUtils';

export * from '../lib/enlacesGoogleDriveUtils';

/**
 * Guarda los enlaces de Google Drive asociados a la cuenta del usuario en Firestore (usuarios/{uid}).
 */
export async function guardarEnlacesUsuarioFirestore(
  uid: string,
  enlaces: Partial<EnlacesGoogleDriveUsuario>
): Promise<void> {
  if (!uid) return;
  const payload = prepararPayloadEnlaces(enlaces);
  const docRef = doc(db, 'usuarios', uid);
  await setDoc(docRef, { enlacesGoogleDrive: payload }, { merge: true });
}

/**
 * Recupera los enlaces de Google Drive vinculados al usuario autenticado.
 */
export async function obtenerEnlacesUsuarioFirestore(
  uid: string
): Promise<EnlacesGoogleDriveUsuario | null> {
  if (!uid) return null;
  try {
    const docRef = doc(db, 'usuarios', uid);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    const data = snap.data();
    return (data?.enlacesGoogleDrive as EnlacesGoogleDriveUsuario) || null;
  } catch (err) {
    console.warn('[servicioEnlacesFirebase] No se pudieron cargar los enlaces del usuario:', err);
    return null;
  }
}
