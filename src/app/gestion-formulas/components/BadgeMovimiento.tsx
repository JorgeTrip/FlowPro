// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
import React from 'react';
import { ResultadoMRP } from '../lib/motorMRP';

interface BadgeMovimientoProps {
  movimiento: ResultadoMRP['movimientoSugerido'];
}

/**
 * Componente presentacional que renderiza las cápsulas (badges) del movimiento sugerido.
 * Diseñado con la paleta de Grises Pro y Tailwind.
 */
export function BadgeMovimiento({ movimiento }: BadgeMovimientoProps) {
  if (!movimiento || movimiento.tipo === 'sin_accion') {
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-[10px] font-semibold">
        Sin Acción
      </span>
    );
  }

  const renders: React.ReactNode[] = [];

  if (
    (movimiento.tipo === 'transferencia' || movimiento.tipo === 'combinado') &&
    movimiento.transferencia !== undefined
  ) {
    renders.push(
      <span
        key="transf"
        className="inline-flex items-center px-2 py-1 rounded-md bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-[10px] font-semibold"
      >
        Transf E/R: {movimiento.transferencia.toFixed(1)}
      </span>
    );
  }

  if (
    (movimiento.tipo === 'compra' || movimiento.tipo === 'combinado') &&
    movimiento.compra !== undefined
  ) {
    renders.push(
      <span
        key="compra"
        className="inline-flex items-center px-2 py-1 rounded-md bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-[10px] font-semibold"
      >
        Compra: {movimiento.compra.toFixed(1)}
      </span>
    );
  }

  return (
    <div className="flex flex-col gap-1 items-start">
      {renders}
    </div>
  );
}
