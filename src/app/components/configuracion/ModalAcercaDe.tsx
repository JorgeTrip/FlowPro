// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import React from 'react';
import { X, Layers, History, ShieldCheck, User } from 'lucide-react';

interface ModalAcercaDeProps {
  abierto: boolean;
  version: string;
  onCerrar: () => void;
  onAbrirHistorial: () => void;
}

export function ModalAcercaDe({
  abierto,
  version,
  onCerrar,
  onAbrirHistorial,
}: ModalAcercaDeProps) {
  if (!abierto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-800 dark:bg-[#1C1C1E] text-gray-900 dark:text-gray-100">
        {/* Botón cerrar */}
        <button
          onClick={onCerrar}
          className="absolute right-4 top-4 rounded-xl p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          title="Cerrar"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Cabecera */}
        <div className="flex items-center space-x-3.5 mb-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/30">
            <Layers className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold">FlowPro Utilidades</h3>
            <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold font-mono">
              Versión {version || '1.0.0'}
            </p>
          </div>
        </div>

        {/* Información del Sistema */}
        <div className="space-y-3.5 text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
          <p>
            Suite integral de optimización de operaciones: Planificación MRP, Gestión de Fórmulas y Recetas, Control de Armado de Pedidos y Análisis de Asistencias y Ventas.
          </p>

          <div className="rounded-xl border border-gray-200/80 bg-gray-50/80 p-3.5 dark:border-gray-800 dark:bg-gray-900/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-500 dark:text-gray-400 font-medium">Desarrollo y Autoría:</span>
              <span className="font-bold text-gray-900 dark:text-gray-100 flex items-center space-x-1">
                <User className="h-3.5 w-3.5 text-blue-500" />
                <span>Jorge O. Tripodi</span>
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-500 dark:text-gray-400 font-medium">Identificador:</span>
              <span className="font-semibold font-mono text-gray-700 dark:text-gray-300">J.O.T.</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-500 dark:text-gray-400 font-medium">Estado del Sistema:</span>
              <span className="flex items-center space-x-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Producción Activa</span>
              </span>
            </div>
          </div>

          <p className="text-[11px] text-gray-500 dark:text-gray-400 text-center pt-1 font-medium">
            © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados.
          </p>
        </div>

        {/* Acciones */}
        <div className="mt-6 flex items-center justify-between gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
          <button
            type="button"
            onClick={() => {
              onCerrar();
              onAbrirHistorial();
            }}
            className="flex items-center space-x-1.5 rounded-xl border border-gray-300 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 transition-all shadow-sm"
          >
            <History className="h-4 w-4 text-blue-500" />
            <span>Historial de cambios</span>
          </button>

          <button
            type="button"
            onClick={onCerrar}
            className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-blue-700 transition-all"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
