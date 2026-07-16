// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { TipoAnalisisHierbas } from '../hooks/useVistaResultados';

interface DropdownAnalisisHierbasProps {
  analisisHierbas: TipoAnalisisHierbas;
  setAnalisisHierbas: (opcion: TipoAnalisisHierbas) => void;
}

export default function DropdownAnalisisHierbas({
  analisisHierbas,
  setAnalisisHierbas,
}: DropdownAnalisisHierbasProps) {
  const [abierto, setAbierto] = useState(false);
  const refContenedor = useRef<HTMLDivElement>(null);

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
    { id: 'todos' as const, etiqueta: '🌿 Desactivado (Ver todo)' },
    { id: 'hierbas' as const, etiqueta: '🍃 Solo Hierbas (MP)' },
    { id: 'insumos' as const, etiqueta: '📦 Solo Insumos (Bolsas + Etiq.)' },
  ];

  const obtenerEtiquetaBoton = () => {
    switch (analisisHierbas) {
      case 'hierbas':
        return 'Análisis: Hierbas';
      case 'insumos':
        return 'Análisis: Insumos';
      default:
        return 'Análisis Hierbas';
    }
  };

  return (
    <div ref={refContenedor} className="relative inline-block text-left">
      <button
        onClick={() => setAbierto(!abierto)}
        type="button"
        className="px-4 h-9 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#2C2C2E] hover:bg-gray-50 dark:hover:bg-[#3A3A3C] text-xs font-bold text-gray-700 dark:text-gray-200 transition-all flex items-center space-x-2 cursor-pointer shadow-sm"
      >
        <span>{obtenerEtiquetaBoton()}</span>
        {analisisHierbas !== 'todos' && (
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
        )}
        <span className="text-[10px] text-gray-400">▼</span>
      </button>

      {abierto && (
        <div className="absolute left-0 mt-1.5 w-60 rounded-xl bg-white dark:bg-[#1C1C1E] border border-gray-250 dark:border-gray-800 shadow-lg p-2.5 z-30 space-y-1 transition-all animate-in fade-in slide-in-from-top-1 duration-100">
          <h3 className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-2 py-1 select-none">
            Análisis de Hierbas PT
          </h3>
          <div className="space-y-0.5">
            {opciones.map((op) => (
              <button
                key={op.id}
                type="button"
                onClick={() => {
                  setAnalisisHierbas(op.id);
                  setAbierto(false);
                }}
                className={`w-full text-left flex items-center space-x-2 px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors text-xs font-semibold ${
                  analisisHierbas === op.id
                    ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#2C2C2E]/40'
                }`}
              >
                <span>{op.etiqueta}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
