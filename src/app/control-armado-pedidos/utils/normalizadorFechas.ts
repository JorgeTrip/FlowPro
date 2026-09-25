// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados

/**
 * Normaliza cadenas de fecha en diversos formatos a estándar ISO YYYY-MM-DD.
 */
export function normalizarFechaYYYYMMDD(fechaStr?: string): string {
  if (!fechaStr) return '';
  const str = fechaStr.trim().split('T')[0].replace(/\./g, '-').replace(/\//g, '-');
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
