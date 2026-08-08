// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { RegistroArmadoDocumento, FiltrosAnalisis, FilaArmado } from '../types/armado';

const NOMBRE_COLECCION = 'control_armado_pedidos';

/**
 * Elimina recursivamente valores undefined para compatibilidad estricta con Firebase Firestore.
 */
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

export interface ResultadoVerificacionDuplicado {
  esDuplicado: boolean;
  docExistenteId?: string;
  docIncompleto?: boolean;
  docData?: RegistroArmadoDocumento;
}

/**
 * Algoritmo inteligente que verifica si una planilla ya fue procesada y si posee datos válidos en Firestore para el usuario actual.
 */
export async function verificarDuplicado(
  empleadoHeader: string,
  fechaPrimeraFila: string,
  horaInicioPrimeraFila: string
): Promise<ResultadoVerificacionDuplicado> {
  try {
    const uid = auth.currentUser?.uid;
    if (!uid) return { esDuplicado: false };

    const ref = collection(db, NOMBRE_COLECCION);
    const q = query(
      ref,
      where('userId', '==', uid),
      where('empleadoHeader', '==', empleadoHeader),
      where('fechaPrimeraFila', '==', fechaPrimeraFila),
      where('horaInicioPrimeraFila', '==', horaInicioPrimeraFila)
    );
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const docMatch = snapshot.docs[0];
      const docData = { id: docMatch.id, ...(docMatch.data() as RegistroArmadoDocumento) };
      const docIncompleto = !docData.filas || docData.filas.length === 0;

      return {
        esDuplicado: true,
        docExistenteId: docMatch.id,
        docIncompleto,
        docData,
      };
    }

    return { esDuplicado: false };
  } catch (error) {
    console.warn('Advertencia en verificarDuplicado Firestore:', error);
    return { esDuplicado: false };
  }
}

/**
 * Guarda o actualiza un documento verificado en Firestore asociándolo al userId del usuario activo.
 */
export async function guardarPlanillaVerificada(
  docData: Omit<RegistroArmadoDocumento, 'id'> & { id?: string }
): Promise<string> {
  const { id: docId, imagenBase64: _imagenBase64, ...restoDoc } = docData;
  const uid = auth.currentUser?.uid;

  if (!uid) {
    throw new Error('Debe iniciar sesión para guardar planillas.');
  }

  const payloadBruto = {
    ...restoDoc,
    userId: uid,
    estado: 'verificado' as const,
    verificadoEn: new Date().toISOString(),
  };

  const payloadLimpio = limpiarUndefined(payloadBruto);

  try {
    if (docId && !docId.startsWith('mock-') && !docId.startsWith('scan-')) {
      const docRef = doc(db, NOMBRE_COLECCION, docId);
      await updateDoc(docRef, payloadLimpio);
      return docId;
    } else {
      const ref = collection(db, NOMBRE_COLECCION);
      const res = await addDoc(ref, payloadLimpio);
      return res.id;
    }
  } catch (error) {
    console.error('Error al guardar planilla en Firestore:', error);
    throw error;
  }
}

/**
 * Elimina un documento verificado de Firestore.
 */
export async function eliminarPlanillaVerificada(id: string): Promise<void> {
  try {
    const docRef = doc(db, NOMBRE_COLECCION, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error al eliminar planilla de Firestore:', error);
    throw new Error('No se pudo eliminar la planilla de Firestore.');
  }
}

/**
 * Recupera todos los registros verificados en Firestore pertenecientes al usuario actual.
 */
export async function obtenerRegistrosVerificados(
  filtros?: FiltrosAnalisis
): Promise<RegistroArmadoDocumento[]> {
  try {
    const uid = auth.currentUser?.uid;
    if (!uid) return [];

    const ref = collection(db, NOMBRE_COLECCION);
    // Consulta filtrada estrictamente por el userId del usuario autenticado
    const q = query(
      ref,
      where('userId', '==', uid),
      where('estado', '==', 'verificado')
    );
    const snapshot = await getDocs(q);
    const registros: RegistroArmadoDocumento[] = [];

    snapshot.forEach((d) => {
      registros.push({ id: d.id, ...(d.data() as RegistroArmadoDocumento) });
    });

    // Ordenamiento en memoria por fecha/hora de verificación descendente
    registros.sort((a, b) => {
      const fechaA = new Date(a.verificadoEn || a.creadoEn || 0).getTime();
      const fechaB = new Date(b.verificadoEn || b.creadoEn || 0).getTime();
      return fechaB - fechaA;
    });

    return filtrarRegistrosEnMemoria(registros, filtros);
  } catch (error) {
    console.warn('Advertencia al consultar Firestore:', error);
    return [];
  }
}

function filtrarRegistrosEnMemoria(
  registros: RegistroArmadoDocumento[],
  filtros?: FiltrosAnalisis
): RegistroArmadoDocumento[] {
  if (!filtros) return registros;

  return registros.filter((reg) => {
    if (filtros.empleado && reg.empleadoHeader !== filtros.empleado) {
      const tieneEnFilas = reg.filas?.some(
        (f) => f.empleadoAsignado === filtros.empleado || f.nuevoEmpleado === filtros.empleado
      );
      if (!tieneEnFilas) return false;
    }
    if (filtros.fechaInicio) {
      const algunDespues = reg.filas?.some((f) => f.fecha >= filtros.fechaInicio!);
      if (!algunDespues) return false;
    }
    if (filtros.fechaFin) {
      const algunAntes = reg.filas?.some((f) => f.fecha <= filtros.fechaFin!);
      if (!algunAntes) return false;
    }
    return true;
  });
}

/**
 * Actualiza una fila individual de un documento verificado en Firestore (para re-etiquetar o normalizar irregularidades).
 */
export async function actualizarFilaEnDocumento(
  docId: string,
  filaId: string,
  cambiosFila: Partial<FilaArmado>
): Promise<void> {
  if (!docId || docId.startsWith('mock-') || docId.startsWith('scan-')) return;
  const docRef = doc(db, NOMBRE_COLECCION, docId);

  const snapshot = await getDocs(query(collection(db, NOMBRE_COLECCION), where('__name__', '==', docId)));
  if (!snapshot.empty) {
    const data = snapshot.docs[0].data() as RegistroArmadoDocumento;
    const nuevasFilas = (data.filas || []).map((f) => {
      if (f.id === filaId) {
        return { ...f, ...cambiosFila };
      }
      return f;
    });
    await updateDoc(docRef, limpiarUndefined({ filas: nuevasFilas }));
  }
}
