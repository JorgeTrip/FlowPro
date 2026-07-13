// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import React from 'react';

interface SelectorMesesRotacionProps {
  mesesRotacion: number;
  setMesesRotacion: (meses: number) => void;
}

/**
 * Componente selector de meses de rotación para previsión de stock.
 */
export default function SelectorMesesRotacion({
  mesesRotacion,
  setMesesRotacion,
}: SelectorMesesRotacionProps) {
  return (
    <div className="flex flex-col">
      <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">
        Meses de Rotación
      </span>
      <select
        value={mesesRotacion}
        onChange={(e) => setMesesRotacion(Number(e.target.value))}
        className="h-9 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#2C2C2E] text-xs text-gray-700 dark:text-gray-300 px-3 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer shadow-sm transition-all"
      >
        {[1, 2, 3, 4].map((mes) => (
          <option key={mes} value={mes}>
            {mes} {mes === 1 ? 'mes' : 'meses'}
          </option>
        ))}
      </select>
    </div>
  );
}
