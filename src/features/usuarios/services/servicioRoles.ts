// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
import { doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { RolUsuario, UsuarioPerfilExtendido } from '../types/roles';
import { deducirRolPorEmail } from './evaluadorRoles';

export * from './evaluadorRoles';

const CLAVE_CACHE_ROL = 'flowpro_rol_usuario_cache';

/**
 * Obtiene o inicializa el perfil de rol en Firestore, con fallback resiliente en localStorage.
 */
export async function sincronizarPerfilUsuario(
  uid: string,
  email: string | null,
  displayName: string | null,
  photoURL: string | null
): Promise<UsuarioPerfilExtendido> {
  const rolDeducido = deducirRolPorEmail(email);
  const ahora = new Date().toISOString();

  try {
    const docRef = doc(db, 'usuarios', uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      // Si el email está en la lista blanca de superadmin, prevalece siempre superadmin
      const rolFinal: RolUsuario = rolDeducido === 'superadmin' ? 'superadmin' : (data.rol || 'operador');

      const perfilActualizado: UsuarioPerfilExtendido = {
        uid,
        email: email || '',
        displayName: displayName || data.displayName || 'Usuario',
        photoURL: photoURL || data.photoURL || null,
        rol: rolFinal,
        activo: data.activo !== false,
        ultimoAcceso: ahora,
        actualizadoEn: ahora,
      };

      setDoc(docRef, { ultimoAcceso: ahora, rol: rolFinal }, { merge: true }).catch(() => {});

      if (typeof window !== 'undefined') {
        localStorage.setItem(CLAVE_CACHE_ROL, rolFinal);
      }
      return perfilActualizado;
    }

    // Si no existe, crear documento inicial en Firestore
    const nuevoPerfil: UsuarioPerfilExtendido = {
      uid,
      email: email || '',
      displayName: displayName || 'Usuario',
      photoURL: photoURL || null,
      rol: rolDeducido,
      activo: true,
      ultimoAcceso: ahora,
      actualizadoEn: ahora,
    };

    await setDoc(docRef, nuevoPerfil);
    if (typeof window !== 'undefined') {
      localStorage.setItem(CLAVE_CACHE_ROL, rolDeducido);
    }
    return nuevoPerfil;
  } catch (error) {
    console.warn('[servicioRoles] Modo offline o error Firestore, aplicando fallback:', error);
    const rolCache = typeof window !== 'undefined' ? (localStorage.getItem(CLAVE_CACHE_ROL) as RolUsuario) : null;
    return {
      uid,
      email: email || '',
      displayName: displayName || 'Usuario',
      photoURL: photoURL || null,
      rol: rolCache || rolDeducido,
      activo: true,
      ultimoAcceso: ahora,
    };
  }
}

/**
 * Actualiza el rol de un usuario en Firestore (reservado para administradores).
 */
export async function actualizarRolUsuario(uid: string, nuevoRol: RolUsuario): Promise<void> {
  const docRef = doc(db, 'usuarios', uid);
  await setDoc(docRef, { rol: nuevoRol, actualizadoEn: new Date().toISOString() }, { merge: true });
}

/**
 * Lista todos los usuarios registrados en Firestore.
 */
export async function listarUsuariosFirestore(): Promise<UsuarioPerfilExtendido[]> {
  try {
    const colRef = collection(db, 'usuarios');
    const snapshot = await getDocs(colRef);
    return snapshot.docs.map((docSnap) => docSnap.data() as UsuarioPerfilExtendido);
  } catch (error) {
    console.error('[servicioRoles] Error al listar usuarios:', error);
    return [];
  }
}
