// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados

export interface FechaExcelParseada {
  fecha: Date;
  texto: string;
}

/**
 * Convierte un valor de fecha heterogéneo (serial de Excel, string, Date) a Date válido,
 * preservando los componentes de calendario (día, mes, año) sin distorsión por huso horario (UTC-3).
 */
export function parsearFechaExcel(valor: any): FechaExcelParseada | null {
  if (valor === undefined || valor === null || valor === '') return null;

  let d: Date | null = null;
  let diaStr = '', mesStr = '', anioStr = '';

  if (typeof valor === 'number') {
    // Número de serie de Excel (días desde 30/12/1899)
    d = new Date(Date.UTC(1899, 11, 30) + Math.round(valor) * 86400000);
    diaStr = String(d.getUTCDate()).padStart(2, '0');
    mesStr = String(d.getUTCMonth() + 1).padStart(2, '0');
    anioStr = String(d.getUTCFullYear());
  } else if (typeof valor === 'string') {
    const limpio = valor.trim();
    if (limpio.includes('/')) {
      const p = limpio.split('/');
      if (p.length === 3) {
        let anio = parseInt(p[2], 10);
        if (anio < 100) anio += 2000;
        diaStr = p[0].padStart(2, '0');
        mesStr = p[1].padStart(2, '0');
        anioStr = String(anio);
        d = new Date(Date.UTC(anio, parseInt(mesStr, 10) - 1, parseInt(diaStr, 10)));
      }
    } else if (/^\d{4}-\d{2}-\d{2}/.test(limpio)) {
      const p = limpio.slice(0, 10).split('-');
      anioStr = p[0];
      mesStr = p[1];
      diaStr = p[2];
      d = new Date(Date.UTC(parseInt(anioStr, 10), parseInt(mesStr, 10) - 1, parseInt(diaStr, 10)));
    } else {
      const parsed = new Date(limpio);
      if (!isNaN(parsed.getTime())) {
        diaStr = String(parsed.getUTCDate()).padStart(2, '0');
        mesStr = String(parsed.getUTCMonth() + 1).padStart(2, '0');
        anioStr = String(parsed.getUTCFullYear());
        d = parsed;
      }
    }
  } else if (valor instanceof Date && !isNaN(valor.getTime())) {
    diaStr = String(valor.getUTCDate()).padStart(2, '0');
    mesStr = String(valor.getUTCMonth() + 1).padStart(2, '0');
    anioStr = String(valor.getUTCFullYear());
    d = valor;
  }

  if (!d || isNaN(d.getTime()) || !diaStr) return null;
  return { fecha: d, texto: `${diaStr}/${mesStr}/${anioStr}` };
}
