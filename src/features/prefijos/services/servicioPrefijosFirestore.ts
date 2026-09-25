// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  onSnapshot,
  writeBatch,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { ReglaPrefijo } from '../types/prefijos';
import {
  normalizarReglaParaFirestore,
  mapearDocumentoAFirestore,
} from './normalizadorPrefijos';

export const NOMBRE_COLECCION_PREFIJOS = 'prefijos_codigos_pt';

/**
 * Suscribe un callback reactivo a los cambios en la colección de prefijos de Firestore.
 */
export function suscribirPrefijosFirestore(
  onActualizacion: (reglas: ReglaPrefijo[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const colRef = collection(db, NOMBRE_COLECCION_PREFIJOS);

  return onSnapshot(
    colRef,
    (snapshot) => {
      const reglas: ReglaPrefijo[] = [];
      snapshot.forEach((d) => {
        const parseada = mapearDocumentoAFirestore(d.data(), d.id);
        if (parseada) {
          reglas.push(parseada);
        }
      });
      // Ordenamiento natural por prefijo
      reglas.sort((a, b) => a.prefijo.localeCompare(b.prefijo));
      onActualizacion(reglas);
    },
    (err) => {
      console.warn('[PrefijosFirestore] Acceso a Firestore no disponible o permisos pendientes:', err.message);
      if (onError) onError(err);
    }
  );
}

/**
 * Guarda o actualiza una regla de prefijo individual en Firestore.
 */
export async function guardarReglaFirestore(
  regla: ReglaPrefijo,
  emailUsuario?: string
): Promise<void> {
  const docRef = doc(db, NOMBRE_COLECCION_PREFIJOS, regla.id);
  const data = normalizarReglaParaFirestore(regla, emailUsuario);
  await setDoc(docRef, data, { merge: true });
}

/**
 * Elimina una regla por su identificador en Firestore.
 */
export async function eliminarReglaFirestore(id: string): Promise<void> {
  const docRef = doc(db, NOMBRE_COLECCION_PREFIJOS, id);
  await deleteDoc(docRef);
}

/**
 * Borra todos los documentos de la colección de prefijos en lotes atómicos.
 */
export async function limpiarColeccionFirestore(): Promise<void> {
  const colRef = collection(db, NOMBRE_COLECCION_PREFIJOS);
  const snapshot = await getDocs(colRef);
  if (snapshot.empty) return;

  const TAMANO_LOTE = 450;
  const docs = snapshot.docs;

  for (let i = 0; i < docs.length; i += TAMANO_LOTE) {
    const lote = writeBatch(db);
    const slice = docs.slice(i, i + TAMANO_LOTE);
    slice.forEach((d) => lote.delete(d.ref));
    await lote.commit();
  }
}

/**
 * Importa masivamente una lista de reglas a Firestore mediante lotes atómicos.
 */
export async function importarLoteFirestore(
  reglas: ReglaPrefijo[],
  emailUsuario?: string
): Promise<void> {
  const TAMANO_LOTE = 450;

  for (let i = 0; i < reglas.length; i += TAMANO_LOTE) {
    const lote = writeBatch(db);
    const slice = reglas.slice(i, i + TAMANO_LOTE);

    slice.forEach((regla) => {
      const docRef = doc(db, NOMBRE_COLECCION_PREFIJOS, regla.id);
      const data = normalizarReglaParaFirestore(regla, emailUsuario);
      lote.set(docRef, data, { merge: true });
    });

    await lote.commit();
  }
}

/**
 * Si la colección en la nube está vacía, migra automáticamente las reglas locales existentes.
 */
export async function migrarReglasLocalesAFirestore(
  reglasLocales: ReglaPrefijo[],
  emailUsuario?: string
): Promise<boolean> {
  if (!reglasLocales || reglasLocales.length === 0) return false;

  try {
    const colRef = collection(db, NOMBRE_COLECCION_PREFIJOS);
    const snapshot = await getDocs(colRef);

    if (snapshot.empty) {
      console.info(`[PrefijosFirestore] Colección vacía. Migrando ${reglasLocales.length} reglas locales...`);
      await importarLoteFirestore(reglasLocales, emailUsuario);
      return true;
    }
  } catch (err: any) {
    console.warn('[PrefijosFirestore] No se pudo verificar o migrar a Firestore (permisos pendientes):', err?.message);
  }

  return false;
}
