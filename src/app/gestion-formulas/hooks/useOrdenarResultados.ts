// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
import { useMemo, useState } from 'react';
import { ResultadoMRP } from '../lib/types';

/**
 * Hook puro que administra el ordenamiento interactivo de los resultados del cálculo MRP.
 */
export function useOrdenarResultados(resultados: ResultadoMRP[] | null) {
  const [sortConfig, setSortConfig] = useState<{
    key: keyof ResultadoMRP;
    direction: 'asc' | 'desc';
  } | null>(null);

  const solicitarOrden = (columna: keyof ResultadoMRP) => {
    let direccion: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === columna && sortConfig.direction === 'asc') {
      direccion = 'desc';
    }
    setSortConfig({ key: columna, direction: direccion });
  };

  const resultadosOrdenados = useMemo(() => {
    if (!resultados) return [];
    const items = [...resultados];

    if (sortConfig !== null) {
      items.sort((a, b) => {
        const valA = a[sortConfig.key];
        const valB = b[sortConfig.key];

        if (valA === undefined) return 1;
        if (valB === undefined) return -1;

        // Comparación de cadenas de texto
        if (typeof valA === 'string' && typeof valB === 'string') {
          return sortConfig.direction === 'asc'
            ? valA.localeCompare(valB)
            : valB.localeCompare(valA);
        }

        // Comparación numérica
        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortConfig.direction === 'asc' ? valA - valB : valB - valA;
        }

        return 0;
      });
    }

    return items;
  }, [resultados, sortConfig]);

  return {
    resultadosOrdenados,
    solicitarOrden,
    sortConfig,
  };
}
