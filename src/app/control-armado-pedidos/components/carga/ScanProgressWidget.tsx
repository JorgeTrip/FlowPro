// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import React from 'react';
import { useArmadoStore } from '../../stores/armadoStore';
import { Loader2, Minimize2, Maximize2, X, Sparkles, FileText, Clock, RefreshCw } from 'lucide-react';

export function ScanProgressWidget() {
  const { progresoScan, setMinimizadoScan, setOcultoScan } = useArmadoStore();
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || !progresoScan.activo || progresoScan.oculto) return null;

  const {
    totalArchivos,
    indiceActual,
    nombreArchivo,
    porcentajePlanilla,
    porcentajeGlobal,
    minimizado,
  } = progresoScan;

  // Estado Minimizado (Pastilla Flotante)
  if (minimizado) {
    return (
      <div className="fixed bottom-6 right-6 z-[999] flex items-center space-x-3 rounded-full border border-blue-500/40 bg-gray-900/95 px-4 py-2.5 shadow-2xl backdrop-blur-md text-xs text-white animate-fade-in">
        <Loader2 className="h-4 w-4 animate-spin text-blue-400 shrink-0" />
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-blue-300">
            Escaneando {indiceActual}/{totalArchivos}
          </span>
          <span className="rounded bg-blue-500/20 px-1.5 py-0.5 text-[10px] font-bold text-blue-200">
            {porcentajePlanilla}%
          </span>
        </div>

        <div className="flex items-center space-x-1 border-l border-gray-700/60 pl-2">
          <button
            onClick={() => setMinimizadoScan(false)}
            className="rounded p-1 text-gray-400 hover:bg-gray-800 hover:text-white"
            title="Expandir ventana de progreso"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setOcultoScan(true)}
            className="rounded p-1 text-gray-400 hover:bg-gray-800 hover:text-red-400"
            title="Ocultar"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // Estado Expandido (Modal Flotante por Defecto)
  return (
    <div className="fixed bottom-6 right-6 z-[999] w-96 max-w-[92vw] overflow-hidden rounded-2xl border border-gray-800 bg-[#1C1C1E]/95 p-4 shadow-2xl backdrop-blur-xl text-xs text-white transition-all">
      {/* Encabezado */}
      <div className="flex items-center justify-between border-b border-gray-800 pb-2.5">
        <div className="flex items-center space-x-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30">
            <Sparkles className="h-4 w-4 animate-pulse" />
          </div>
          <div>
            <h4 className="font-bold text-gray-100">Escaneo de Planillas con IA</h4>
            <p className="text-[10px] text-gray-400">Gemini Vision OCR Multimodal</p>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={() => setMinimizadoScan(true)}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
            title="Minimizar a pastilla"
          >
            <Minimize2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => setOcultoScan(true)}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-800 hover:text-red-400 transition-colors"
            title="Cerrar widget"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Avance de la Planilla Actual o Cuenta Regresiva de Cuota */}
      <div className="mt-3.5 space-y-2">
        <div className="flex items-center justify-between text-[11px]">
          <div className="flex items-center space-x-1.5 truncate max-w-[75%]">
            {progresoScan.mensajeEstado ? (
              <Clock className="h-3.5 w-3.5 text-amber-400 animate-spin shrink-0" />
            ) : (
              <FileText className="h-3.5 w-3.5 text-blue-400 shrink-0" />
            )}
            <span className="truncate font-medium text-gray-200">
              {progresoScan.mensajeEstado || nombreArchivo || `Planilla #${indiceActual}`}
            </span>
          </div>
          <span className={`font-mono font-bold ${progresoScan.mensajeEstado ? 'text-amber-400' : 'text-blue-400'}`}>
            {porcentajePlanilla}%
          </span>
        </div>

        {/* Barra de Progreso de la Planilla Actual */}
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-800 border border-gray-700/50">
          <div
            className={`h-full transition-all duration-150 ease-out ${
              progresoScan.mensajeEstado
                ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 animate-pulse'
                : 'bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-500'
            }`}
            style={{ width: `${porcentajePlanilla}%` }}
          />
        </div>
      </div>

      {/* Progreso del Lote Completo (si hay más de 1 planilla) */}
      {totalArchivos > 1 && (
        <div className="mt-3.5 border-t border-gray-800/80 pt-2.5 space-y-1.5">
          <div className="flex justify-between text-[10px] text-gray-400">
            <span>
              Progreso del Lote (<strong className="text-gray-200">{indiceActual}</strong> de {totalArchivos})
            </span>
            <span className="font-mono text-gray-300">{porcentajeGlobal}%</span>
          </div>

          <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-800">
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${porcentajeGlobal}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
