// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import React from 'react';
import type { VariacionPorcentualFormateada } from '../../utils/calculadorVariacionMensual';

interface CeldaVariacionPorcentualProps {
  variacion: VariacionPorcentualFormateada;
  bordeDerecho?: boolean;
}

export function CeldaVariacionPorcentual({
  variacion,
  bordeDerecho = false,
}: CeldaVariacionPorcentualProps) {
  const borde = bordeDerecho ? 'border-r border-gray-200 dark:border-gray-800' : '';

  if (variacion.porcentaje === null || variacion.texto === '-') {
    return (
      <td className={`px-1 py-3 text-center text-[10px] text-gray-400 dark:text-gray-600 bg-gray-50/20 dark:bg-gray-800/10 ${borde}`}>
        -
      </td>
    );
  }

  const estiloColor = variacion.esPositivo
    ? 'text-emerald-700 bg-emerald-100/70 dark:text-emerald-300 dark:bg-emerald-950/50'
    : variacion.esNegativo
    ? 'text-rose-700 bg-rose-100/70 dark:text-rose-300 dark:bg-rose-950/50'
    : 'text-gray-500 bg-gray-100 dark:text-gray-400 dark:bg-gray-800';

  return (
    <td className={`px-1 py-3 text-center bg-gray-50/20 dark:bg-gray-800/10 ${borde}`}>
      <span className={`inline-block rounded px-1 py-0.5 text-[10px] font-bold ${estiloColor}`}>
        {variacion.texto}
      </span>
    </td>
  );
}
