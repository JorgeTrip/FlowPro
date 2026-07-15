// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import React, { useState, useEffect, useRef } from 'react';

interface DropdownCriticidadProps {
  criticidades: string[];
  setCriticidades: (criticidades: string[]) => void;
}

export default function DropdownCriticidad({
  criticidades,
  setCriticidades,
}: DropdownCriticidadProps) {
  const [abierto, setAbierto] = useState(false);
  const refContenedor = useRef<HTMLDivElement>(null);

  const toggleCriticidad = (c: string) => {
    if (criticidades.includes(c)) {
      if (criticidades.length > 1) {
        setCriticidades(criticidades.filter((x) => x !== c));
      }
    } else {
      setCriticidades([...criticidades, c]);
    }
  };

  useEffect(() => {
    const alHacerClickAfuera = (evento: MouseEvent) => {
      if (refContenedor.current && !refContenedor.current.contains(evento.target as Node)) {
        setAbierto(false);
      }
    };
    if (abierto) {
      document.addEventListener('mousedown', alHacerClickAfuera);
    }
    return () => {
      document.removeEventListener('mousedown', alHacerClickAfuera);
    };
  }, [abierto]);

  const opciones = [
    { id: 'alta', etiqueta: 'Alta' },
    { id: 'media', etiqueta: 'Media' },
    { id: 'baja', etiqueta: 'Baja' },
  ];

  const cantidadActivos = 3 - criticidades.length;

  return (
    <div ref={refContenedor} className="relative inline-block text-left">
      <button
        onClick={() => setAbierto(!abierto)}
        type="button"
        className="px-4 h-9 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#2C2C2E] hover:bg-gray-50 dark:hover:bg-[#3A3A3C] text-xs font-bold text-gray-700 dark:text-gray-200 transition-all flex items-center space-x-2 cursor-pointer shadow-sm"
      >
        <span>Criticidad</span>
        {cantidadActivos > 0 && (
          <span className="w-5 h-5 rounded-full bg-blue-500 text-white text-[10px] flex items-center justify-center font-bold font-mono">
            {cantidadActivos}
          </span>
        )}
        <span className="text-[10px] text-gray-400">▼</span>
      </button>

      {abierto && (
        <div className="absolute left-0 mt-1.5 w-48 rounded-xl bg-white dark:bg-[#1C1C1E] border border-gray-250 dark:border-gray-800 shadow-lg p-3 z-30 space-y-2 transition-all animate-in fade-in slide-in-from-top-1 duration-100">
          <h3 className="text-xs font-bold text-gray-700 dark:text-gray-200 mb-1">Filtrar Criticidad</h3>
          <div className="space-y-1.5">
            {opciones.map((op) => (
              <label
                key={op.id}
                className="flex items-center space-x-2.5 p-1 hover:bg-gray-50 dark:hover:bg-[#2C2C2E]/40 rounded-lg cursor-pointer transition-colors text-xs text-gray-700 dark:text-gray-300"
              >
                <input
                  type="checkbox"
                  checked={criticidades.includes(op.id)}
                  onChange={() => toggleCriticidad(op.id)}
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
