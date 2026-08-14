// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
import { RegistroArmadoDocumento } from '../../types/armado';
import { normalizarFechaYYYYMMDD } from '../../services/firestoreService';

export function getFechaLocalYYYYMMDD(d: Date = new Date()): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function obtenerRangoFechasInteligente(
  rango: 'todos' | 'dia' | 'semana' | 'mes' | 'personalizado',
  registros: RegistroArmadoDocumento[] = [],
  inicioActual?: string,
  finActual?: string
) {
  const todasLasFechas: string[] = [];
  registros.forEach((r) => {
    if (r.fechaPrimeraFila) todasLasFechas.push(normalizarFechaYYYYMMDD(r.fechaPrimeraFila));
    if (r.verificadoEn) todasLasFechas.push(normalizarFechaYYYYMMDD(r.verificadoEn));
    r.filas?.forEach((f) => f.fecha && todasLasFechas.push(normalizarFechaYYYYMMDD(f.fecha)));
  });

  const fechasValidas = Array.from(new Set(todasLasFechas.filter((f) => /^\d{4}-\d{2}-\d{2}$/.test(f)))).sort();

  if (rango === 'todos') {
    if (fechasValidas.length > 0) return { fechaInicio: fechasValidas[0], fechaFin: fechasValidas[fechasValidas.length - 1] };
    return { fechaInicio: undefined, fechaFin: undefined };
  }

  let fechaRefStr = getFechaLocalYYYYMMDD(new Date());
  if (fechasValidas.length > 0) fechaRefStr = fechasValidas[fechasValidas.length - 1];

  const [y, m, d] = fechaRefStr.split('-').map(Number);
  const fechaRefObj = new Date(y, m - 1, d);
  const format = (dt: Date) => getFechaLocalYYYYMMDD(dt);

  if (rango === 'dia') return { fechaInicio: fechaRefStr, fechaFin: fechaRefStr };

  if (rango === 'semana') {
    const hace7 = new Date(fechaRefObj);
    hace7.setDate(fechaRefObj.getDate() - 6);
    return { fechaInicio: format(hace7), fechaFin: fechaRefStr };
  }

  if (rango === 'mes') {
    const hace30 = new Date(fechaRefObj);
    hace30.setDate(fechaRefObj.getDate() - 29);
    return { fechaInicio: format(hace30), fechaFin: fechaRefStr };
  }

  return { fechaInicio: inicioActual || format(fechaRefObj), fechaFin: finActual || format(fechaRefObj) };
}
