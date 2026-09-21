// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados

/**
 * Función utilitaria para ordenar colecciones de resultados MRP según campo y dirección.
 */
export function ordenarItems<T>(items: T[], config: { key: keyof T; direction: 'asc' | 'desc' } | null): T[] {
  if (!config) return items;
  return [...items].sort((a, b) => {
    const valA = config.key === 'movimientoSugerido' ? (a as any).movimientoSugerido.tipo : a[config.key];
    const valB = config.key === 'movimientoSugerido' ? (b as any).movimientoSugerido.tipo : b[config.key];
    if (valA === undefined) return 1;
    if (valB === undefined) return -1;
    if (typeof valA === 'string' && typeof valB === 'string') {
      return config.direction === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }
    if (typeof valA === 'number' && typeof valB === 'number') {
      return config.direction === 'asc' ? valA - valB : valB - valA;
    }
    return 0;
  });
}
