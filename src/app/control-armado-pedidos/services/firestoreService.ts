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

export * from './firestorePendientesService';

const NOMBRE_COLECCION = 'control_armado_pedidos';

function limpiarUndefined(obj: any): any {
  if (obj === null || obj === undefined) return null;
  if (Array.isArray(obj)) return obj.map((item) => limpiarUndefined(item));
  if (typeof obj === 'object') {
    const cleaned: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) cleaned[key] = limpiarUndefined(value);
    }
    return cleaned;
  }
  return obj;
}

export function normalizarFechaYYYYMMDD(fechaStr?: string): string {
  if (!fechaStr) return '';
  let str = fechaStr.trim();
  if (str.includes('T')) str = str.split('T')[0];
  str = str.replace(/\./g, '-').replace(/\//g, '-');

  if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(str)) {
    const p = str.split('-');
    return `${p[0]}-${p[1].padStart(2, '0')}-${p[2].padStart(2, '0')}`;
  }
  if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(str)) {
    const p = str.split('-');
    return `${p[2]}-${p[1].padStart(2, '0')}-${p[0].padStart(2, '0')}`;
  }
  if (/^\d{1,2}-\d{1,2}-\d{2}$/.test(str)) {
    const p = str.split('-');
    return `20${p[2]}-${p[1].padStart(2, '0')}-${p[0].padStart(2, '0')}`;
  }
  if (/^\d{1,2}-\d{1,2}$/.test(str)) {
    const p = str.split('-');
    const yyyy = new Date().getFullYear();
    return `${yyyy}-${p[1].padStart(2, '0')}-${p[0].padStart(2, '0')}`;
  }
  return str;
}

export interface ResultadoVerificacionDuplicado {
  esDuplicado: boolean;
  docExistenteId?: string;
  docIncompleto?: boolean;
  docData?: RegistroArmadoDocumento;
}

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
      return { esDuplicado: true, docExistenteId: docMatch.id, docIncompleto: !docData.filas?.length, docData };
    }
    return { esDuplicado: false };
  } catch (error) {
    console.warn('Advertencia en verificarDuplicado Firestore:', error);
    return { esDuplicado: false };
  }
}

export async function guardarPlanillaVerificada(docData: RegistroArmadoDocumento): Promise<string> {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Usuario no autenticado');

  const { id: docId, ...restoDoc } = docData;
  const payloadLimpio = limpiarUndefined({
    ...restoDoc,
    userId: uid,
    estado: 'verificado' as const,
    verificadoEn: new Date().toISOString(),
  });

  try {
    if (docId && !docId.startsWith('mock-') && !docId.startsWith('scan-') && !docId.startsWith('ext-')) {
      await updateDoc(doc(db, NOMBRE_COLECCION, docId), payloadLimpio);
      return docId;
    } else {
      const res = await addDoc(collection(db, NOMBRE_COLECCION), payloadLimpio);
      return res.id;
    }
  } catch (error) {
    console.error('Error al guardar planilla en Firestore:', error);
    throw error;
  }
}

export async function eliminarPlanillaVerificada(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, NOMBRE_COLECCION, id));
  } catch (error) {
    console.error('Error al eliminar planilla de Firestore:', error);
    throw new Error('No se pudo eliminar la planilla de Firestore.');
  }
}

export async function obtenerRegistrosVerificados(filtros?: FiltrosAnalisis): Promise<RegistroArmadoDocumento[]> {
  try {
    const uid = auth.currentUser?.uid;
    if (!uid) return [];

    const ref = collection(db, NOMBRE_COLECCION);
    const q = query(ref, where('userId', '==', uid), where('estado', '==', 'verificado'));
    const snapshot = await getDocs(q);
    const registros: RegistroArmadoDocumento[] = [];

    snapshot.forEach((d) => registros.push({ id: d.id, ...(d.data() as RegistroArmadoDocumento) }));

    registros.sort((a, b) => {
      const tA = new Date(a.verificadoEn || a.creadoEn || 0).getTime();
      const tB = new Date(b.verificadoEn || b.creadoEn || 0).getTime();
      return tB - tA;
    });

    return filtrarRegistrosEnMemoria(registros, filtros);
  } catch (error) {
    console.warn('Advertencia al consultar Firestore:', error);
    return [];
  }
}

function filtrarRegistrosEnMemoria(registros: RegistroArmadoDocumento[], filtros?: FiltrosAnalisis): RegistroArmadoDocumento[] {
  if (!filtros || filtros.rango === 'todos') return registros;

  return registros
    .map((reg) => {
      if (!reg.filas?.length) return null;

      const filasFiltradas = reg.filas.filter((f) => {
        if (f.accionIrregularidad === 'ignorar') return false;

        if (filtros.empleado) {
          const armador = f.empleadoAsignado || f.nuevoEmpleado || reg.empleadoHeader;
          if (armador !== filtros.empleado && reg.empleadoHeader !== filtros.empleado) return false;
        }

        const fechaRaw = f.fecha || reg.fechaPrimeraFila || (reg.creadoEn ? reg.creadoEn.split('T')[0] : '');
        const fechaNorm = normalizarFechaYYYYMMDD(fechaRaw);

        if (filtros.fechaInicio && fechaNorm && fechaNorm < filtros.fechaInicio) return false;
        if (filtros.fechaFin && fechaNorm && fechaNorm > filtros.fechaFin) return false;

        return true;
      });

      if (!filasFiltradas.length) return null;
      return { ...reg, filas: filasFiltradas };
    })
    .filter((reg): reg is RegistroArmadoDocumento => reg !== null);
}

export async function actualizarFilaEnDocumento(docId: string, filaId: string, cambiosFila: Partial<FilaArmado>): Promise<void> {
  if (!docId || docId.startsWith('mock-') || docId.startsWith('scan-')) return;
  const docRef = doc(db, NOMBRE_COLECCION, docId);
  const snapshot = await getDocs(query(collection(db, NOMBRE_COLECCION), where('__name__', '==', docId)));
  if (!snapshot.empty) {
    const data = snapshot.docs[0].data() as RegistroArmadoDocumento;
    const nuevasFilas = (data.filas || []).map((f) => (f.id === filaId ? { ...f, ...cambiosFila } : f));
    await updateDoc(docRef, limpiarUndefined({ filas: nuevasFilas }));
  }
}
