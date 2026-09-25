// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import React, { useState } from 'react';
import type { TipoTareaFila } from '../../types/armado';
import { Users, Factory, MoreHorizontal, Sparkles } from 'lucide-react';

interface SelectorDerivacionTareaProps {
  sugerencia: TipoTareaFila | null;
  tipoActual?: TipoTareaFila;
  onDerivar: (tipo: TipoTareaFila, detalle?: string) => void;
}

export function SelectorDerivacionTarea({
  sugerencia,
  tipoActual,
  onDerivar,
}: SelectorDerivacionTareaProps) {
  const [mostrarInputOtro, setMostrarInputOtro] = useState(false);
  const [detalleOtro, setDetalleOtro] = useState('');

  const handleConfirmarOtro = () => {
    onDerivar('otros', detalleOtro.trim() || undefined);
    setMostrarInputOtro(false);
  };

  return (
    <div className="mt-2.5 rounded-md border border-blue-200 bg-blue-50/70 p-2.5 dark:border-blue-900/40 dark:bg-blue-950/30">
      <div className="mb-2 flex items-center justify-between text-[11px] font-semibold text-blue-900 dark:text-blue-200">
        <span className="flex items-center space-x-1">
          <Sparkles className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
          <span>Derivar a Tarea No-Armado (protege la velocidad del armador):</span>
        </span>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {/* Botón Atención al Cliente */}
        <button
          type="button"
          onClick={() => onDerivar('atencion_cliente')}
          className={`relative flex items-center justify-center space-x-1.5 rounded-md px-2.5 py-1.5 font-medium transition-all ${
            tipoActual === 'atencion_cliente'
              ? 'bg-blue-600 text-white shadow-sm font-semibold'
              : sugerencia === 'atencion_cliente'
              ? 'bg-blue-100 text-blue-900 border-2 border-blue-500 font-bold hover:bg-blue-200 dark:bg-blue-900/60 dark:text-blue-100'
              : 'bg-white text-blue-900 border border-blue-200 hover:bg-blue-100 dark:bg-gray-800 dark:text-blue-200 dark:border-blue-800'
          }`}
          title="Derivar tiempo a Atención al Cliente"
        >
          <Users className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
          <span className="truncate">Atención al Cliente</span>
          {sugerencia === 'atencion_cliente' && (
            <span className="ml-1 rounded bg-blue-500 px-1 py-0.2 text-[9px] font-bold text-white uppercase">
              Sugerido
            </span>
          )}
        </button>

        {/* Botón Producción */}
        <button
          type="button"
          onClick={() => onDerivar('produccion')}
          className={`relative flex items-center justify-center space-x-1.5 rounded-md px-2.5 py-1.5 font-medium transition-all ${
            tipoActual === 'produccion'
              ? 'bg-indigo-600 text-white shadow-sm font-semibold'
              : sugerencia === 'produccion'
              ? 'bg-indigo-100 text-indigo-900 border-2 border-indigo-500 font-bold hover:bg-indigo-200 dark:bg-indigo-900/60 dark:text-indigo-100'
              : 'bg-white text-indigo-900 border border-indigo-200 hover:bg-indigo-100 dark:bg-gray-800 dark:text-indigo-200 dark:border-indigo-800'
          }`}
          title="Derivar tiempo a tareas de Producción"
        >
          <Factory className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <span className="truncate">Producción</span>
          {sugerencia === 'produccion' && (
            <span className="ml-1 rounded bg-indigo-500 px-1 py-0.2 text-[9px] font-bold text-white uppercase">
              Sugerido
            </span>
          )}
        </button>

        {/* Botón Otros */}
        <button
          type="button"
          onClick={() => setMostrarInputOtro(!mostrarInputOtro)}
          className={`flex items-center justify-center space-x-1.5 rounded-md px-2.5 py-1.5 font-medium transition-all ${
            tipoActual === 'otros'
              ? 'bg-slate-700 text-white shadow-sm font-semibold'
              : 'bg-white text-slate-800 border border-slate-300 hover:bg-slate-100 dark:bg-gray-800 dark:text-slate-200 dark:border-slate-700'
          }`}
          title="Derivar a otra tarea específica"
        >
          <MoreHorizontal className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400 shrink-0" />
          <span>Otras Tareas...</span>
        </button>
      </div>

      {mostrarInputOtro && (
        <div className="mt-2 flex items-center space-x-1.5 animate-fadeIn">
          <input
            type="text"
            placeholder="Especificar tarea (ej: Mantenimiento, Limpieza)..."
            value={detalleOtro}
            onChange={(e) => setDetalleOtro(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleConfirmarOtro();
              }
            }}
            className="w-full rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-gray-900 focus:outline-none dark:border-slate-700 dark:bg-gray-800 dark:text-white"
            autoFocus
          />
          <button
            type="button"
            onClick={handleConfirmarOtro}
            className="rounded-md bg-slate-700 px-3 py-1 text-xs font-semibold text-white hover:bg-slate-800 shrink-0"
          >
            Aplicar
          </button>
        </div>
      )}
    </div>
  );
}
