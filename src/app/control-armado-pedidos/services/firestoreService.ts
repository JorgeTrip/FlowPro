// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
import { collection, query, where, getDocs, getDoc, addDoc, updateDoc, deleteDoc, doc, getDocsFromServer } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { RegistroArmadoDocumento, FiltrosAnalisis, FilaArmado } from '../types/armado';

export * from './firestorePendientesService';
const NOMBRE_COLECCION = 'control_armado_pedidos';

function limpiarUndefined(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj ?? null;
  if (Array.isArray(obj)) return obj.map(limpiarUndefined);
  const cleaned: Record<string, any> = {};
  for (const [k, v] of Object.entries(obj)) if (v !== undefined) cleaned[k] = limpiarUndefined(v);
  return cleaned;
}

export function normalizarFechaYYYYMMDD(fechaStr?: string): string {
  if (!fechaStr) return '';
  let str = fechaStr.trim().split('T')[0].replace(/\./g, '-').replace(/\//g, '-');
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
    return `${new Date().getFullYear()}-${p[1].padStart(2, '0')}-${p[0].padStart(2, '0')}`;
  }
  return str;
}

export async function verificarDuplicado(empleadoHeader: string, fechaPrimeraFila: string, horaInicioPrimeraFila: string) {
  try {
    const uid = auth.currentUser?.uid;
    if (!uid) return { esDuplicado: false };
    const q = query(
      collection(db, NOMBRE_COLECCION),
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
    return { esDuplicado: false };
  }
}

export async function guardarPlanillaVerificada(docData: RegistroArmadoDocumento): Promise<string> {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Usuario no autenticado');

  const filasNormalizadas = (docData.filas || []).map((f) => {
    const esIrregularActiva = !f.accionIrregularidad && Boolean(f.esIrregular && f.notaIrregularidad?.trim());
    return {
      ...f,
      fecha: normalizarFechaYYYYMMDD(f.fecha) || normalizarFechaYYYYMMDD(docData.fechaPrimeraFila || docData.fechaPlanilla),
      esIrregular: esIrregularActiva,
      notaIrregularidad: esIrregularActiva ? f.notaIrregularidad : null,
    };
  });

  const fechaPrimera = filasNormalizadas[0]?.fecha || normalizarFechaYYYYMMDD(docData.fechaPrimeraFila || docData.fechaPlanilla);
  const horaInicioPrimera = filasNormalizadas[0]?.horaInicio || docData.horaInicioPrimeraFila || '';

  const { id: docId, ...restoDoc } = docData;
  const payloadLimpio = limpiarUndefined({
    ...restoDoc,
    fechaPrimeraFila: fechaPrimera,
    fechaPlanilla: fechaPrimera,
    horaInicioPrimeraFila: horaInicioPrimera,
    filas: filasNormalizadas,
    userId: uid,
    estado: 'verificado' as const,
    verificadoEn: new Date().toISOString(),
  });

  if (docId && !docId.startsWith('mock-') && !docId.startsWith('scan-') && !docId.startsWith('ext-')) {
    await updateDoc(doc(db, NOMBRE_COLECCION, docId), payloadLimpio);
    return docId;
  }
  const res = await addDoc(collection(db, NOMBRE_COLECCION), payloadLimpio);
  return res.id;
}

export async function eliminarPlanillaVerificada(id: string): Promise<void> {
  await deleteDoc(doc(db, NOMBRE_COLECCION, id));
}

export async function obtenerRegistrosVerificados(filtros?: FiltrosAnalisis): Promise<RegistroArmadoDocumento[]> {
  try {
    const uid = auth.currentUser?.uid;
    if (!uid) return [];
    const ref = collection(db, NOMBRE_COLECCION);
    const q = query(ref, where('userId', '==', uid), where('estado', '==', 'verificado'));
    let snapshot;
    try {
      snapshot = await getDocsFromServer(q);
    } catch {
      snapshot = await getDocs(q);
    }

    const registros: RegistroArmadoDocumento[] = [];
    snapshot.forEach((d) => registros.push({ id: d.id, ...(d.data() as RegistroArmadoDocumento) }));

    registros.sort((a, b) => {
      const tA = new Date(a.verificadoEn || a.creadoEn || 0).getTime();
      const tB = new Date(b.verificadoEn || b.creadoEn || 0).getTime();
      return tB - tA;
    });

    console.log(`[DIAG-OBTENER] Documentos obtenidos de Firestore: ${registros.length}`, { filtros, uid });

    const registrosSanitizados = registros.map((docData) => {
      const fechaBaseDoc = normalizarFechaYYYYMMDD(docData.fechaPrimeraFila || docData.fechaPlanilla || docData.filas?.[0]?.fecha);
      const filasNorm = (docData.filas || []).map((f) => {
        const fechaNorm = normalizarFechaYYYYMMDD(f.fecha) || fechaBaseDoc;
        const esIrregularActiva = !f.accionIrregularidad && Boolean(f.esIrregular && f.notaIrregularidad && f.notaIrregularidad.trim());
        let armador = f.empleadoAsignado || docData.empleadoHeader;
        if (f.accionIrregularidad === 'asignar_nuevo' && f.nuevoEmpleado) armador = f.nuevoEmpleado;
        else if (f.accionIrregularidad === 'asignar_cabecera') armador = docData.empleadoHeader;
        return {
          ...f,
          fecha: fechaNorm,
          empleadoAsignado: armador,
          esIrregular: esIrregularActiva,
          notaIrregularidad: esIrregularActiva ? f.notaIrregularidad : null,
        };
      });
      const fechaPrimera = filasNorm[0]?.fecha || fechaBaseDoc;
      return { ...docData, fechaPrimeraFila: fechaPrimera, fechaPlanilla: fechaPrimera, filas: filasNorm };
    });

    return filtrarRegistrosEnMemoria(registrosSanitizados, filtros);
  } catch (error) {
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
        const fechaNorm = f.fecha;
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
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    const data = docSnap.data() as RegistroArmadoDocumento;
    const nuevasFilas = (data.filas || []).map((f) => {
      if (f.id === filaId) {
        const fAct = { ...f, ...cambiosFila };
        if (fAct.fecha) fAct.fecha = normalizarFechaYYYYMMDD(fAct.fecha);
        return fAct;
      }
      return f;
    });
    const fechaPrimera = nuevasFilas[0]?.fecha || data.fechaPrimeraFila;
    await updateDoc(docRef, limpiarUndefined({ filas: nuevasFilas, fechaPrimeraFila: fechaPrimera }));
  }
}
