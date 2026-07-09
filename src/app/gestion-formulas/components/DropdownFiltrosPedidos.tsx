// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import React, { useState } from 'react';

interface DropdownFiltrosPedidosProps {
  filtrosActivos: string[];
  setFiltrosActivos: (filtros: string[]) => void;
}

export default function DropdownFiltrosPedidos({
  filtrosActivos,
  setFiltrosActivos,
}: DropdownFiltrosPedidosProps) {
  const [abierto, setAbierto] = useState(false);

  const toggleFiltro = (filtro: string) => {
    if (filtrosActivos.includes(filtro)) {
      setFiltrosActivos(filtrosActivos.filter((f) => f !== filtro));
    } else {
      setFiltrosActivos([...filtrosActivos, filtro]);
    }
  };

  const opciones = [
    { id: 'eliminar_sin_accion', etiqueta: 'Eliminar Sin acción' },
    { id: 'con_datos', etiqueta: 'Productos con datos' },
  ];

  return (
    <div
      className="relative inline-block text-left"
      onMouseLeave={() => setAbierto(false)}
    >
      <button
        onClick={() => setAbierto(!abierto)}
        type="button"
        className="px-4 h-9 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#2C2C2E] hover:bg-gray-50 dark:hover:bg-[#3A3A3C] text-xs font-bold text-gray-700 dark:text-gray-200 transition-all flex items-center space-x-2 cursor-pointer shadow-sm animate-fade-in"
      >
        <span>Filtros</span>
        {filtrosActivos.length > 0 && (
          <span className="w-5 h-5 rounded-full bg-blue-500 text-white text-[10px] flex items-center justify-center font-bold font-mono">
            {filtrosActivos.length}
          </span>
        )}
        <span className="text-[10px] text-gray-400">▼</span>
      </button>

      {abierto && (
        <div className="absolute left-0 mt-1.5 w-52 rounded-xl bg-white dark:bg-[#1C1C1E] border border-gray-250 dark:border-gray-800 shadow-lg p-3 z-30 space-y-2 transition-all animate-in fade-in slide-in-from-top-1 duration-100">
          <h4 className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Criterios de Vista</h4>
          <div className="space-y-1">
            {opciones.map((op) => (
              <label
                key={op.id}
                className="flex items-center space-x-2.5 p-1 hover:bg-gray-50 dark:hover:bg-[#2C2C2E]/40 rounded-lg cursor-pointer transition-colors text-xs text-gray-700 dark:text-gray-300"
              >
                <input
                  type="checkbox"
                  checked={filtrosActivos.includes(op.id)}
                  onChange={() => toggleFiltro(op.id)}
                  className="rounded border-gray-300 dark:border-gray-700 text-blue-600 focus:ring-blue-500 h-4 w-4 bg-white dark:bg-[#2C2C2E]"
                />
                <span className="font-medium select-none">{op.etiqueta}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
