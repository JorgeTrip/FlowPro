// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import React from 'react';
import { CheckCircle, SkipForward, SkipBack, RefreshCw } from 'lucide-react';

interface BarraAccionesVerificacionProps {
  guardando: boolean;
  reescaneando: boolean;
  onAnterior: () => void;
  onConfirmar: () => void;
  onReescanear: () => void;
  onSaltar: () => void;
}

export function BarraAccionesVerificacion({
  guardando,
  reescaneando,
  onAnterior,
  onConfirmar,
  onReescanear,
  onSaltar,
}: BarraAccionesVerificacionProps) {
  return (
    <div className="mt-6 flex flex-col space-y-2 sm:flex-row sm:space-x-3 sm:space-y-0">
      <button
        onClick={onAnterior}
        disabled={guardando || reescaneando}
        className="flex items-center justify-center space-x-2 rounded-xl border border-gray-300 bg-gray-100 px-4 py-3 text-xs font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 disabled:opacity-50"
        title="Volver a la planilla no verificada anterior"
      >
        <SkipBack className="h-4 w-4" />
        <span>Anterior</span>
      </button>

      <button
        onClick={onConfirmar}
        disabled={guardando || reescaneando}
        className="flex-1 flex items-center justify-center space-x-2 rounded-xl bg-blue-600 px-4 py-3 text-xs font-semibold text-white shadow-md transition-all hover:bg-blue-700 disabled:opacity-50"
      >
        <CheckCircle className="h-4 w-4" />
        <span>{guardando ? 'Guardando en Firestore...' : 'Confirmar Planilla Verificada'}</span>
      </button>

      <button
        onClick={onReescanear}
        disabled={guardando || reescaneando}
        className="flex items-center justify-center space-x-2 rounded-xl bg-purple-600 px-4 py-3 text-xs font-semibold text-white shadow-md transition-all hover:bg-purple-700 disabled:opacity-50"
        title="Re-escanear esta planilla ordenándole a la IA prestar máxima atención"
      >
        <RefreshCw className={`h-4 w-4 ${reescaneando ? 'animate-spin' : ''}`} />
        <span>{reescaneando ? 'Re-escaneando...' : 'Re-escanear (IA)'}</span>
      </button>

      <button
        onClick={onSaltar}
        disabled={guardando || reescaneando}
        className="flex items-center justify-center space-x-2 rounded-xl border border-gray-300 bg-gray-100 px-4 py-3 text-xs font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 disabled:opacity-50"
        title="Posponer esta planilla para revisarla más tarde y pasar a la siguiente"
      >
        <SkipForward className="h-4 w-4" />
        <span>Saltar</span>
      </button>
    </div>
  );
}
