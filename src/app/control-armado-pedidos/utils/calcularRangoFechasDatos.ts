// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
import { RegistroArmadoDocumento } from '../types/armado';
import { normalizarFechaYYYYMMDD } from '../services/firestoreService';

/**
 * Convierte una fecha ISO (YYYY-MM-DD) a formato visual argentino (DD/MM/AAAA).
 */
export function formatearFechaVisualDDMMAAAA(fechaIso?: string): string {
  if (!fechaIso || !fechaIso.includes('-')) return fechaIso || '';
  const partes = fechaIso.split('-');
  if (partes.length === 3 && partes[0].length === 4) {
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }
  return fechaIso;
}

/**
 * Extrae y calcula el rango de fechas (mínima y máxima) existente en una lista de registros.
 * Examina las fechas registradas en cabeceras de planilla y en cada una de las filas individuales.
 */
export function calcularRangoFechasRegistros(registros: RegistroArmadoDocumento[] = []): {
  fechaInicioIso?: string;
  fechaFinIso?: string;
  textoRango: string;
} {
  if (!registros || registros.length === 0) {
    return { textoRango: 'Sin datos' };
  }

  const todasLasFechas: string[] = [];
  registros.forEach((r) => {
    if (r.fechaPrimeraFila) todasLasFechas.push(normalizarFechaYYYYMMDD(r.fechaPrimeraFila));
    if (r.fechaPlanilla) todasLasFechas.push(normalizarFechaYYYYMMDD(r.fechaPlanilla));
    r.filas?.forEach((f) => {
      if (f.fecha) todasLasFechas.push(normalizarFechaYYYYMMDD(f.fecha));
    });
  });

  const fechasValidas = Array.from(
    new Set(todasLasFechas.filter((f) => /^\d{4}-\d{2}-\d{2}$/.test(f)))
  ).sort();

  if (fechasValidas.length === 0) {
    return { textoRango: 'Sin fechas' };
  }

  const fechaInicioIso = fechasValidas[0];
  const fechaFinIso = fechasValidas[fechasValidas.length - 1];

  const inicioVis = formatearFechaVisualDDMMAAAA(fechaInicioIso);
  const finVis = formatearFechaVisualDDMMAAAA(fechaFinIso);

  const textoRango = inicioVis === finVis ? inicioVis : `${inicioVis} al ${finVis}`;

  return {
    fechaInicioIso,
    fechaFinIso,
    textoRango,
  };
}
