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

/**
 * Evalúa si una fecha de la base de datos (en formato YYYY-MM-DD o variantes) coincide con el término de búsqueda ingresado.
 * Admite formatos como DD-MM-AAAA, DD/MM/AAAA, D/M, D-M, DD/MM, DD-MM, DD/MM/AA, etc.
 */
export function coincideFechaConBusquedaFlexible(fechaOriginal?: string, terminoBusqueda?: string): boolean {
  if (!fechaOriginal || !terminoBusqueda) return false;

  const fechaNorm = normalizarFechaYYYYMMDD(fechaOriginal);
  const termLimpio = terminoBusqueda.trim().toLowerCase().replace(/[\/\.\s]/g, '-');
  if (!termLimpio) return false;

  if (fechaOriginal.toLowerCase().includes(termLimpio) || (fechaNorm && fechaNorm.includes(termLimpio))) {
    return true;
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaNorm)) {
    return false;
  }

  const [anioStr, mesStr, diaStr] = fechaNorm.split('-');
  const anio = parseInt(anioStr, 10);
  const mes = parseInt(mesStr, 10);
  const dia = parseInt(diaStr, 10);

  const partes = termLimpio.split('-').filter(Boolean);

  // Caso D/M o DD/MM (ej: "1/7", "01/07", "1-7", "01-07")
  if (partes.length === 2) {
    const pDia = parseInt(partes[0], 10);
    const pMes = parseInt(partes[1], 10);
    if (!isNaN(pDia) && !isNaN(pMes)) {
      // Coincidencia estándar DD-MM (ej: 1 de Julio)
      if (pDia === dia && pMes === mes) return true;
      // Compatibilidad por si el OCR guardó MM-DD (ej: 2026-01-07)
      if (pDia === mes && pMes === dia) return true;
    }
  }

  // Caso DD/MM/AAAA o DD/MM/AA (ej: "1/7/2026", "01/07/2026", "1/7/26")
  if (partes.length === 3) {
    const pDia = parseInt(partes[0], 10);
    const pMes = parseInt(partes[1], 10);
    let pAnio = parseInt(partes[2], 10);
    if (!isNaN(pDia) && !isNaN(pMes) && !isNaN(pAnio)) {
      if (pAnio < 100) pAnio += 2000;
      if (pDia === dia && pMes === mes && (pAnio === anio || pAnio === anio % 100)) return true;
      if (pDia === mes && pMes === dia && (pAnio === anio || pAnio === anio % 100)) return true;
    }
  }

  // Caso sólo 1 número (ej: busca "7" para Julio o "1" para día 1)
  if (partes.length === 1) {
    const pNum = parseInt(partes[0], 10);
    if (!isNaN(pNum)) {
      if (pNum === dia || pNum === mes || pNum === anio) return true;
    }
  }

  const anioCorto = String(anio).slice(-2);
  const formatosVisuales = [
    `${diaStr}-${mesStr}-${anioStr}`,
    `${diaStr}/${mesStr}/${anioStr}`,
    `${dia}-${mes}-${anioStr}`,
    `${dia}/${mes}/${anioStr}`,
    `${diaStr}-${mesStr}-${anioCorto}`,
    `${diaStr}/${mesStr}/${anioCorto}`,
    `${dia}-${mes}-${anioCorto}`,
    `${dia}/${mes}/${anioCorto}`,
    `${diaStr}-${mesStr}`,
    `${diaStr}/${mesStr}`,
    `${dia}-${mes}`,
    `${dia}/${mes}`,
  ];

  return formatosVisuales.some((fv) => fv.includes(terminoBusqueda.trim()) || fv.includes(termLimpio));
}

/**
 * Transforma el texto ingresado por el usuario (ej: "1-7", "1/7", "01/07", "1-7-2026")
 * en los formatos exactos con los que se almacenan las fechas en la base de datos (YYYY-MM-DD y MM-DD).
 */
export function generarVariacionesBusquedaBD(terminoUsuario: string): string[] {
  const term = terminoUsuario.trim().toLowerCase();
  if (!term) return [];
  const variaciones = new Set<string>();
  variaciones.add(term);

  const limpio = term.replace(/[\/\.\s]/g, '-');
  variaciones.add(limpio);

  const partes = limpio.split('-').filter(Boolean);

  if (partes.length === 2) {
    const diaNum = parseInt(partes[0], 10);
    const mesNum = parseInt(partes[1], 10);
    if (!isNaN(diaNum) && !isNaN(mesNum) && diaNum >= 1 && diaNum <= 31 && mesNum >= 1 && mesNum <= 12) {
      const dd = String(diaNum).padStart(2, '0');
      const mm = String(mesNum).padStart(2, '0');
      const anioActual = new Date().getFullYear();

      variaciones.add(`-${mm}-${dd}`);
      variaciones.add(`${mm}-${dd}`);
      variaciones.add(`${anioActual}-${mm}-${dd}`);
      variaciones.add(`${anioActual - 1}-${mm}-${dd}`);
      variaciones.add(`${anioActual + 1}-${mm}-${dd}`);
      variaciones.add(`-${dd}-${mm}`);
      variaciones.add(`${dd}-${mm}`);
    }
  }

  if (partes.length === 3) {
    const diaNum = parseInt(partes[0], 10);
    const mesNum = parseInt(partes[1], 10);
    let anioNum = parseInt(partes[2], 10);
    if (!isNaN(diaNum) && !isNaN(mesNum) && !isNaN(anioNum)) {
      if (anioNum < 100) anioNum += 2000;
      const dd = String(diaNum).padStart(2, '0');
      const mm = String(mesNum).padStart(2, '0');
      const yyyy = String(anioNum);

      variaciones.add(`${yyyy}-${mm}-${dd}`);
      variaciones.add(`-${mm}-${dd}`);
      variaciones.add(`${mm}-${dd}`);
    }
  }

  return Array.from(variaciones);
}
