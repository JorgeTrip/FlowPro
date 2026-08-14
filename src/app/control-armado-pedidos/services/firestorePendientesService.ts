// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  onSnapshot,
} from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { RegistroArmadoDocumento } from '../types/armado';

const NOMBRE_COLECCION = 'control_armado_pedidos';

function limpiarUndefined(obj: any): any {
  if (obj === null || obj === undefined) return null;
  if (Array.isArray(obj)) {
    return obj.map((item) => limpiarUndefined(item));
  }
  if (typeof obj === 'object') {
    const cleaned: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        cleaned[key] = limpiarUndefined(value);
      }
    }
    return cleaned;
  }
  return obj;
}

/**
 * Guarda o actualiza un borrador de planilla pendiente de verificación en Firestore.
 */
export async function guardarPlanillaPendienteFirestore(
  docData: RegistroArmadoDocumento
): Promise<string> {
  const uid = auth.currentUser?.uid;
  if (!uid) return docData.id || '';

  const { id: docId, ...restoDoc } = docData;
  const payloadBruto: Record<string, any> = {
    ...restoDoc,
    userId: uid,
    estado: 'pendiente_verificacion' as const,
    creadoEn: restoDoc.creadoEn || new Date().toISOString(),
  };

  // Omite base64 gigantesco si excede 800KB para evitar superar el límite de 1MB de Firestore
  if (payloadBruto.imagenBase64 && payloadBruto.imagenBase64.length > 800000) {
    delete payloadBruto.imagenBase64;
  }

  const payloadLimpio = limpiarUndefined(payloadBruto);

  try {
    if (docId && !docId.startsWith('mock-') && !docId.startsWith('scan-') && !docId.startsWith('ext-')) {
      const docRef = doc(db, NOMBRE_COLECCION, docId);
      await updateDoc(docRef, payloadLimpio);
      return docId;
    } else {
      const ref = collection(db, NOMBRE_COLECCION);
      const res = await addDoc(ref, payloadLimpio);
      return res.id;
    }
  } catch (error) {
    console.error('Error al guardar borrador de planilla pendiente en Firestore:', error);
    return docId || '';
  }
}

/**
 * Recupera todas las planillas en estado 'pendiente_verificacion' guardadas en Firestore para el usuario actual.
 */
export async function obtenerPlanillasPendientesFirestore(): Promise<RegistroArmadoDocumento[]> {
  try {
    const uid = auth.currentUser?.uid;
    if (!uid) return [];

    const ref = collection(db, NOMBRE_COLECCION);
    const q = query(
      ref,
      where('userId', '==', uid),
      where('estado', '==', 'pendiente_verificacion')
    );
    const snapshot = await getDocs(q);
    const pendientes: RegistroArmadoDocumento[] = [];

    snapshot.forEach((d) => {
      pendientes.push({ id: d.id, ...(d.data() as RegistroArmadoDocumento) });
    });

    return pendientes;
  } catch (error) {
    console.error('Error al recuperar planillas pendientes de Firestore:', error);
    return [];
  }
}

/**
 * Suscribe en tiempo real a las planillas pendientes de verificación en Firestore para el usuario actual.
 */
export function suscribirPlanillasPendientesFirestore(
  onUpdate: (pendientes: RegistroArmadoDocumento[]) => void
): () => void {
  const uid = auth.currentUser?.uid;
  if (!uid) {
    onUpdate([]);
    return () => {};
  }

  const ref = collection(db, NOMBRE_COLECCION);
  const q = query(
    ref,
    where('userId', '==', uid),
    where('estado', '==', 'pendiente_verificacion')
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const pendientes: RegistroArmadoDocumento[] = [];
      snapshot.forEach((d) => {
        pendientes.push({ id: d.id, ...(d.data() as RegistroArmadoDocumento) });
      });
      onUpdate(pendientes);
    },
    (error) => {
      console.warn('Suscripción tiempo real no disponible, usando consulta directa:', error?.message);
      obtenerPlanillasPendientesFirestore().then(onUpdate).catch(() => {});
    }
  );
}
