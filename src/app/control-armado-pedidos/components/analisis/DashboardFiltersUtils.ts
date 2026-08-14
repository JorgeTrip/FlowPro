// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
import { RegistroArmadoDocumento } from '../../types/armado';
import { normalizarFechaYYYYMMDD } from '../../services/firestoreService';

export function getFechaLocalYYYYMMDD(d: Date = new Date()): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function extraerFechasValidasBD(registros: RegistroArmadoDocumento[] = []): string[] {
  const todasLasFechas: string[] = [];
  registros.forEach((r) => {
    if (r.fechaPrimeraFila) todasLasFechas.push(normalizarFechaYYYYMMDD(r.fechaPrimeraFila));
    if (r.fechaPlanilla) todasLasFechas.push(normalizarFechaYYYYMMDD(r.fechaPlanilla));
    r.filas?.forEach((f) => f.fecha && todasLasFechas.push(normalizarFechaYYYYMMDD(f.fecha)));
  });
  return Array.from(new Set(todasLasFechas.filter((f) => /^\d{4}-\d{2}-\d{2}$/.test(f)))).sort();
}

export function obtenerRangoFechasInteligente(
  rango: 'todos' | 'dia' | 'semana' | 'mes' | 'personalizado',
  registros: RegistroArmadoDocumento[] = []
): { fechaInicio?: string; fechaFin?: string } {
  const fechasValidas = extraerFechasValidasBD(registros);
  const hoyStr = getFechaLocalYYYYMMDD(new Date());

  const primeraFechaBD = fechasValidas.length > 0 ? fechasValidas[0] : hoyStr;
  const ultimaFechaBD = fechasValidas.length > 0 ? fechasValidas[fechasValidas.length - 1] : hoyStr;

  if (rango === 'todos') {
    return {
      fechaInicio: fechasValidas.length > 0 ? primeraFechaBD : undefined,
      fechaFin: fechasValidas.length > 0 ? ultimaFechaBD : undefined,
    };
  }

  if (rango === 'dia') {
    return { fechaInicio: ultimaFechaBD, fechaFin: ultimaFechaBD };
  }

  const [y, m, d] = ultimaFechaBD.split('-').map(Number);
  const fechaUltimaObj = new Date(y, m - 1, d);

  if (rango === 'semana') {
    const hace6 = new Date(fechaUltimaObj);
    hace6.setDate(hace6.getDate() - 6);
    return { fechaInicio: getFechaLocalYYYYMMDD(hace6), fechaFin: ultimaFechaBD };
  }

  if (rango === 'mes') {
    const ultDiaMes = new Date(y, m, 0).getDate();
    const mmStr = String(m).padStart(2, '0');
    return {
      fechaInicio: `${y}-${mmStr}-01`,
      fechaFin: `${y}-${mmStr}-${String(ultDiaMes).padStart(2, '0')}`,
    };
  }

  if (rango === 'personalizado') {
    return { fechaInicio: primeraFechaBD, fechaFin: ultimaFechaBD };
  }

  return { fechaInicio: undefined, fechaFin: undefined };
}
