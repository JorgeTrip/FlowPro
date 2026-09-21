// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
import { RegistroArmadoDocumento } from '../types/armado';
import { normalizarFechaYYYYMMDD } from '../services/firestoreService';

/**
 * Ordena las planillas pendientes de verificación:
 * 1. Alfabéticamente por nombre de operador/empleado.
 * 2. Cronológicamente (ascendente) por la fecha de la planilla.
 * 3. Por la hora de inicio de la primera fila.
 * Esto permite cotejar y verificar las planillas en orden cronológico por cada operador.
 */
export function ordenarPlanillasPendientes(items: RegistroArmadoDocumento[]): RegistroArmadoDocumento[] {
  return [...items].sort((a, b) => {
    const opA = (a.empleadoHeader || 'Empleado Desconocido').trim().toUpperCase();
    const opB = (b.empleadoHeader || 'Empleado Desconocido').trim().toUpperCase();
    if (opA !== opB) {
      return opA.localeCompare(opB, 'es', { sensitivity: 'base' });
    }

    // Mismo operador: ordenar por fecha cronológica ascendente
    const fechaA = normalizarFechaYYYYMMDD(a.fechaPrimeraFila || a.fechaPlanilla || a.filas?.[0]?.fecha) || '9999-99-99';
    const fechaB = normalizarFechaYYYYMMDD(b.fechaPrimeraFila || b.fechaPlanilla || b.filas?.[0]?.fecha) || '9999-99-99';
    if (fechaA !== fechaB) {
      return fechaA.localeCompare(fechaB);
    }

    // Misma fecha: ordenar por hora inicial ascendente
    const horaA = a.horaInicioPrimeraFila || a.filas?.[0]?.horaInicio || '00:00';
    const horaB = b.horaInicioPrimeraFila || b.filas?.[0]?.horaInicio || '00:00';
    return horaA.localeCompare(horaB);
  });
}
