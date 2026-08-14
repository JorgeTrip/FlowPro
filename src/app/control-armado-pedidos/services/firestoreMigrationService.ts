// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { RegistroArmadoDocumento } from '../types/armado';
import { optimizarImagenBase64 } from '../utils/imageUtils';
import { normalizarFechaYYYYMMDD } from './firestoreService';

const NOMBRE_COLECCION = 'control_armado_pedidos';
const documentosMigrados = new Set<string>();
let colaEnProceso = false;

/**
 * Optimiza en segundo plano y de forma secuencial las imágenes históricas hacia WebP.
 */
export async function optimizarImagenesHistoricasFirestore(registros: RegistroArmadoDocumento[]): Promise<void> {
  if (colaEnProceso) return;
  colaEnProceso = true;

  try {
    for (const r of registros) {
      if (!r.id || !r.imagenBase64 || documentosMigrados.has(r.id)) continue;

      const esLegacy =
        r.imagenBase64.startsWith('data:image/jpeg') ||
        r.imagenBase64.startsWith('data:image/png') ||
        r.imagenBase64.length > 200000;

      if (esLegacy) {
        documentosMigrados.add(r.id);
        try {
          const webpBase64 = await optimizarImagenBase64(r.imagenBase64);
          if (webpBase64 && webpBase64.startsWith('data:image/webp') && r.id) {
            await updateDoc(doc(db, NOMBRE_COLECCION, r.id), {
              imagenBase64: webpBase64,
            });
            await new Promise((resolve) => setTimeout(resolve, 800));
          }
        } catch (e) {
          console.warn(`No se pudo migrar imagen de ${r.id}:`, e);
        }
      }
    }
  } finally {
    colaEnProceso = false;
  }
}

/**
 * Normaliza y persiste retroactivamente en Firestore las fechas y datos de planillas históricas.
 */
export async function normalizarDatosHistoricosFirestore(registros: RegistroArmadoDocumento[]): Promise<void> {
  if (colaEnProceso) return;
  colaEnProceso = true;

  try {
    for (const r of registros) {
      if (!r.id || documentosMigrados.has(`norm-${r.id}`)) continue;

      let huboCambios = false;
      const fechaBaseDoc = normalizarFechaYYYYMMDD(r.fechaPrimeraFila || r.fechaPlanilla || r.filas?.[0]?.fecha);

      const filasLimpias = (r.filas || []).map((f) => {
        const fechaNorm = normalizarFechaYYYYMMDD(f.fecha) || fechaBaseDoc || '';
        const esIrregularActiva = !f.accionIrregularidad && Boolean(f.esIrregular && f.notaIrregularidad && f.notaIrregularidad.trim());
        if (f.fecha !== fechaNorm || f.esIrregular !== esIrregularActiva) huboCambios = true;
        return {
          ...f,
          fecha: fechaNorm,
          esIrregular: esIrregularActiva,
          notaIrregularidad: esIrregularActiva ? f.notaIrregularidad : null,
          empleadoAsignado: f.empleadoAsignado || r.empleadoHeader || 'Empleado Desconocido',
        };
      });

      const fechaPrimeraNorm = filasLimpias[0]?.fecha || fechaBaseDoc;
      if (r.fechaPrimeraFila !== fechaPrimeraNorm || r.fechaPlanilla !== fechaPrimeraNorm) {
        huboCambios = true;
      }

      if (huboCambios && r.id) {
        documentosMigrados.add(`norm-${r.id}`);
        try {
          await updateDoc(doc(db, NOMBRE_COLECCION, r.id), {
            filas: filasLimpias,
            fechaPrimeraFila: fechaPrimeraNorm,
            fechaPlanilla: fechaPrimeraNorm,
          });
          await new Promise((resolve) => setTimeout(resolve, 600));
        } catch (e) {
          console.warn(`Error al normalizar documento histórico ${r.id}:`, e);
        }
      }
    }
  } finally {
    colaEnProceso = false;
  }
}
