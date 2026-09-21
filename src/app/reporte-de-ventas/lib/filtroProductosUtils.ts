// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados

/**
 * Determina si un código de artículo debe excluirse del análisis de productos
 * (ajustes de inventario y variantes específicas terminadas en G, C o M).
 */
export function debeExcluirProducto(articulo: string): boolean {
  const cod = articulo.trim().toUpperCase();
  if (cod === '50AJU003') return true;
  if (cod.endsWith('G') || cod.endsWith('C') || cod.endsWith('M')) return true;
  return false;
}
