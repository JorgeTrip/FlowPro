// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import React from 'react';
import { X, Keyboard } from 'lucide-react';

interface ModalAtajosTecladoProps {
  abierto: boolean;
  onCerrar: () => void;
}

interface Atajo {
  teclas: string[];
  descripcion: string;
}

const ATAJOS_SISTEMA: Atajo[] = [
  { teclas: ['Alt', 'D'], descripcion: 'Ir al Dashboard principal' },
  { teclas: ['Alt', 'A'], descripcion: 'Abrir Control de Armado de Pedidos' },
  { teclas: ['Alt', 'F'], descripcion: 'Abrir Módulo Pedido MP/PT (Fórmulas)' },
  { teclas: ['Alt', 'C'], descripcion: 'Abrir Control de Asistencias' },
  { teclas: ['Esc'], descripcion: 'Cerrar cualquier modal o menú emergente' },
];

export function ModalAtajosTeclado({ abierto, onCerrar }: ModalAtajosTecladoProps) {
  if (!abierto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white/95 p-6 shadow-2xl backdrop-blur-xl dark:border-gray-800 dark:bg-[#1C1C1E]/95">
        {/* Cabecera */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center space-x-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950/80 dark:text-blue-400">
              <Keyboard className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">Atajos de Teclado</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Navegación rápida y productividad</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCerrar}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Lista de Atajos */}
        <div className="mt-4 space-y-3">
          {ATAJOS_SISTEMA.map((atajo, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/70 px-3 py-2 text-xs dark:border-gray-800/60 dark:bg-gray-900/40"
            >
              <span className="font-medium text-gray-700 dark:text-gray-300">{atajo.descripcion}</span>
              <div className="flex items-center gap-1">
                {atajo.teclas.map((tecla, kIdx) => (
                  <kbd
                    key={kIdx}
                    className="inline-flex min-w-[24px] items-center justify-center rounded-md border border-gray-300 bg-white px-1.5 py-0.5 font-mono text-[11px] font-bold text-gray-800 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                  >
                    {tecla}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Pie */}
        <div className="mt-5 flex justify-end border-t border-gray-100 pt-3 dark:border-gray-800">
          <button
            type="button"
            onClick={onCerrar}
            className="rounded-xl bg-gray-100 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 transition-all"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
