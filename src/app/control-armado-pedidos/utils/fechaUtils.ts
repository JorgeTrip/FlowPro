// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados

export interface FilaArmadoRaw {
  fecha?: string | null;
  horaInicio?: string;
  horaFin?: string;
  cantArticulos?: number | string;
  notaIrregularidad?: string | null;
  esIrregular?: boolean;
}

/**
 * Resta exactamente N días a una fecha en formato YYYY-MM-DD sin sufrir desfasajes de zona horaria.
 */
export function restarDiasAFechaString(fechaStr: string, dias: number): string {
  const partes = fechaStr.split('-');
  if (partes.length !== 3) return fechaStr;

  const anio = parseInt(partes[0], 10);
  const mes = parseInt(partes[1], 10) - 1;
  const dia = parseInt(partes[2], 10);

  // Crear objeto Date en horario UTC para evitar desfasajes locales
  const fechaUtc = new Date(Date.UTC(anio, mes, dia));
  fechaUtc.setUTCDate(fechaUtc.getUTCDate() - dias);

  const anioRes = fechaUtc.getUTCFullYear();
  const mesRes = String(fechaUtc.getUTCMonth() + 1).padStart(2, '0');
  const diaRes = String(fechaUtc.getUTCDate()).padStart(2, '0');

  return `${anioRes}-${mesRes}-${diaRes}`;
}

/**
 * Procesa la asignación de fechas en las filas de una planilla de armado de pedidos.
 *
 * Reglas de negocio:
 * 1. Si la planilla comienza con filas con la fecha vacía y más abajo aparece la primera fecha escrita F,
 *    las filas vacías anteriores se asignan con la fecha del día anterior (F - 1 día).
 * 2. Desde la fila con fecha escrita F hacia abajo, las filas heredan esa fecha F hasta que aparezca una nueva fecha escrita F2.
 * 3. Si no hay ninguna fecha escrita en toda la planilla, se utiliza hoyStr.
 */
export function procesarFechasPlanilla<T extends FilaArmadoRaw>(filas: T[], hoyStr: string): T[] {
  if (!filas || filas.length === 0) return [];

  // Buscar el índice de la primera fila que posea una fecha escrita válida
  const indicePrimeraFecha = filas.findIndex(
    (f) => f.fecha && String(f.fecha).trim().length >= 8 && String(f.fecha).trim() !== 'null'
  );

  // Determinar la fecha base inicial para las filas anteriores
  let fechaBaseInicial = hoyStr;
  if (indicePrimeraFecha !== -1) {
    const primeraFechaEscrita = String(filas[indicePrimeraFecha].fecha).trim();
    if (indicePrimeraFecha > 0) {
      // Si la primera fecha escrita aparece más abajo (ej. fila index 3), las filas 0..2 toman el día anterior
      fechaBaseInicial = restarDiasAFechaString(primeraFechaEscrita, 1);
    } else {
      fechaBaseInicial = primeraFechaEscrita;
    }
  }

  let fechaActualCorriendo = fechaBaseInicial;

  return filas.map((fila, index) => {
    // Si esta fila tiene fecha explícita escrita (y no estamos en las filas vacías iniciales que ya resolvimos)
    const tieneFechaExplicita =
      fila.fecha && String(fila.fecha).trim().length >= 8 && String(fila.fecha).trim() !== 'null';

    if (index >= (indicePrimeraFecha !== -1 ? indicePrimeraFecha : 0) && tieneFechaExplicita) {
      fechaActualCorriendo = String(fila.fecha).trim();
    }

    return {
      ...fila,
      fecha: fechaActualCorriendo,
    };
  });
}
