// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import React, { useState } from 'react';

interface DropdownFiltrosProps {
  soloConDatos: boolean;
  setSoloConDatos: (v: boolean) => void;
  criticidades: string[];
  setCriticidades: (v: string[]) => void;
}

/**
 * Componente Dropdown interactivo de selección múltiple para filtros del MRP.
 */
export default function DropdownFiltros({
  soloConDatos,
  setSoloConDatos,
  criticidades,
  setCriticidades,
}: DropdownFiltrosProps) {
  const [abierto, setAbierto] = useState(false);

  const toggleCriticidad = (c: string) => {
    if (criticidades.includes(c)) {
      // Evitar que se desmarquen todos por completo para no dejar la vista vacía
      if (criticidades.length > 1) {
        setCriticidades(criticidades.filter((x) => x !== c));
      }
    } else {
      setCriticidades([...criticidades, c]);
    }
  };

  const cantidadActivos = (soloConDatos ? 1 : 0) + (3 - criticidades.length);
  const totalFiltros = 4; // soloConDatos + 3 criticidades

  return (
    <div
      className="relative inline-block text-left"
      onMouseLeave={() => setAbierto(false)}
    >
      <button
        onClick={() => setAbierto(!abierto)}
        type="button"
        className="px-4 h-9 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#2C2C2E] hover:bg-gray-50 dark:hover:bg-[#3A3A3C] text-xs font-bold text-gray-700 dark:text-gray-200 transition-all flex items-center space-x-2 cursor-pointer shadow-sm"
      >
        <span>Filtros Avanzados</span>
        {cantidadActivos > 0 && (
          <span className="w-5 h-5 rounded-full bg-blue-500 text-white text-[10px] flex items-center justify-center font-bold font-mono">
            {totalFiltros - cantidadActivos}
          </span>
        )}
        <span className="text-[10px] text-gray-400">▼</span>
      </button>

      {abierto && (
        <div className="absolute left-0 mt-1.5 w-60 rounded-xl bg-white dark:bg-[#1C1C1E] border border-gray-250 dark:border-gray-800 shadow-lg p-3 z-30 space-y-3 transition-all animate-in fade-in slide-in-from-top-1 duration-100">
          <h4 className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Criterios de Vista</h4>
          
          <div className="space-y-2">
            {/* Filtro con datos */}
            <label className="flex items-center space-x-2.5 p-1 hover:bg-gray-50 dark:hover:bg-[#2C2C2E]/40 rounded-lg cursor-pointer transition-colors text-xs text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                checked={soloConDatos}
                onChange={(e) => setSoloConDatos(e.target.checked)}
                className="rounded border-gray-300 dark:border-gray-700 text-blue-600 focus:ring-blue-500 h-4 w-4 bg-white dark:bg-[#2C2C2E]"
              />
              <span className="font-medium select-none">Sólo productos con datos</span>
            </label>

            <div className="border-t border-gray-100 dark:border-gray-850 my-1" />
            <h4 className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider pt-1">Nivel de Criticidad</h4>

            {/* Filtros de criticidad */}
            {['alta', 'media', 'baja'].map((c) => (
              <label
                key={c}
                className="flex items-center space-x-2.5 p-1 hover:bg-gray-50 dark:hover:bg-[#2C2C2E]/40 rounded-lg cursor-pointer transition-colors text-xs text-gray-700 dark:text-gray-300"
              >
                <input
                  type="checkbox"
                  checked={criticidades.includes(c)}
                  onChange={() => toggleCriticidad(c)}
                  className="rounded border-gray-300 dark:border-gray-700 text-blue-600 focus:ring-blue-500 h-4 w-4 bg-white dark:bg-[#2C2C2E]"
                />
                <span className="capitalize font-medium select-none">Criticidad {c}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
