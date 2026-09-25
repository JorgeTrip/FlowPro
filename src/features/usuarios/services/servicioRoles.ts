// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
import { doc, getDoc, setDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { RolUsuario, UsuarioPerfilExtendido } from '../types/roles';
import { deducirRolPorEmail } from './evaluadorRoles';

export * from './evaluadorRoles';

const CLAVE_CACHE_ROL = 'flowpro_rol_usuario_cache';

export interface ResultadoListadoUsuarios {
  usuarios: UsuarioPerfilExtendido[];
  error?: string;
}

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
    let docSnap = await getDoc(docRef);

    // Si no existe por UID, buscar si fue pre-registrado por email
    if (!docSnap.exists() && email) {
      const q = query(collection(db, 'usuarios'), where('email', '==', email.trim().toLowerCase()));
      const snapEmail = await getDocs(q);
      if (!snapEmail.empty) {
        docSnap = snapEmail.docs[0];
      }
    }

    if (docSnap.exists()) {
      const data = docSnap.data();
      const rolFinal: RolUsuario = rolDeducido === 'superadmin' ? 'superadmin' : (data.rol || rolDeducido || 'operador');

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

      setDoc(docRef, perfilActualizado, { merge: true }).catch((err) => {
        console.warn('[servicioRoles] Error al actualizar ultimoAcceso:', err);
      });

      if (typeof window !== 'undefined') {
        localStorage.setItem(CLAVE_CACHE_ROL, rolFinal);
      }
      return perfilActualizado;
    }

    // Documento inicial nuevo
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
  } catch (error: any) {
    console.warn('[servicioRoles] Fallback activado (error Firestore):', error?.message || error);
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
 * Actualiza el rol de un usuario en Firestore.
 */
export async function actualizarRolUsuario(uid: string, nuevoRol: RolUsuario): Promise<void> {
  const docRef = doc(db, 'usuarios', uid);
  await setDoc(docRef, { rol: nuevoRol, actualizadoEn: new Date().toISOString() }, { merge: true });
}

/**
 * Pre-registra o actualiza un usuario por email directamente en Firestore.
 */
export async function registrarUsuarioPorEmail(email: string, rol: RolUsuario, nombre?: string): Promise<void> {
  const emailNorm = email.trim().toLowerCase();
  const idDocumento = emailNorm.replace(/[^a-zA-Z0-9_-]/g, '_');
  const docRef = doc(db, 'usuarios', idDocumento);
  await setDoc(
    docRef,
    {
      uid: idDocumento,
      email: emailNorm,
      displayName: nombre || emailNorm.split('@')[0],
      rol,
      activo: true,
      actualizadoEn: new Date().toISOString(),
    },
    { merge: true }
  );
}

/**
 * Lista todos los usuarios registrados en Firestore con fallback y mapeo seguro de campos.
 */
export async function listarUsuariosFirestore(): Promise<ResultadoListadoUsuarios> {
  try {
    let colRef = collection(db, 'usuarios');
    let snapshot = await getDocs(colRef);

    // Si 'usuarios' está vacío, verificar 'users' como alternativa
    if (snapshot.empty) {
      const colRefAlt = collection(db, 'users');
      const snapAlt = await getDocs(colRefAlt);
      if (!snapAlt.empty) {
        snapshot = snapAlt;
      }
    }

    const usuarios = snapshot.docs.map((docSnap) => {
      const d = docSnap.data();
      return {
        uid: d.uid || docSnap.id,
        email: d.email || d.correo || '',
        displayName: d.displayName || d.nombre || d.name || d.email?.split('@')[0] || 'Usuario',
        photoURL: d.photoURL || d.foto || null,
        rol: (d.rol || d.role || 'operador') as RolUsuario,
        activo: d.activo !== false,
        ultimoAcceso: d.ultimoAcceso || '',
        actualizadoEn: d.actualizadoEn || '',
      };
    });

    return { usuarios };
  } catch (error: any) {
    console.error('[servicioRoles] Error al listar usuarios:', error);
    const esPermiso = error?.code === 'permission-denied' || error?.message?.includes('permission');
    const mensaje = esPermiso
      ? 'Permisos insuficientes en Firestore. Se deben publicar las reglas de lectura/escritura en Firebase Console para la colección "usuarios".'
      : (error?.message || 'Error al conectar con Firestore.');
    return { usuarios: [], error: mensaje };
  }
}
