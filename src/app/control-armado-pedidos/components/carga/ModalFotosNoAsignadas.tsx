// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import React from 'react';
import { AlertTriangle, CheckCircle2, ImageIcon, Sparkles, X } from 'lucide-react';

interface ModalFotosNoAsignadasProps {
  isOpen: boolean;
  cantAsignadas: number;
  archivosSobrantes: File[];
  onClose: () => void;
  onEscanearSobrantes?: (archivos: File[]) => void;
}

export function ModalFotosNoAsignadas({
  isOpen,
  cantAsignadas,
  archivosSobrantes,
  onClose,
  onEscanearSobrantes,
}: ModalFotosNoAsignadasProps) {
  if (!isOpen || archivosSobrantes.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative flex max-h-[85vh] w-full max-w-lg flex-col rounded-2xl border border-amber-200 bg-white p-6 shadow-2xl dark:border-amber-900/50 dark:bg-[#1C1C1E]">
        {/* Cabecera */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-4 dark:border-gray-800">
          <div className="flex items-center space-x-2.5">
            <div className="rounded-xl bg-amber-500/10 p-2 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                Imágenes no emparejadas ({archivosSobrantes.length})
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Fotos que no pertenecen a ninguna planilla o están de más
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 dark:hover:text-gray-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Resumen de éxito si hubo asignaciones */}
        {cantAsignadas > 0 && (
          <div className="mt-4 flex items-center space-x-2 rounded-xl border border-emerald-200 bg-emerald-50/80 p-3 text-xs font-semibold text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span>
              ¡Se asignaron correctamente {cantAsignadas} foto(s) a sus respectivas planillas!
            </span>
          </div>
        )}

        {/* Lista de archivos sobrantes */}
        <div className="mt-4 flex-1 overflow-hidden">
          <p className="mb-2 text-xs font-medium text-gray-700 dark:text-gray-300">
            Las siguientes {archivosSobrantes.length} foto(s) no coincidieron con ninguna planilla:
          </p>
          <div className="max-h-48 space-y-1.5 overflow-y-auto rounded-xl border border-gray-150 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-900/50">
            {archivosSobrantes.map((archivo, idx) => (
              <div
                key={idx}
                className="flex items-center space-x-2 rounded-lg bg-white px-2.5 py-1.5 text-xs text-gray-800 shadow-sm dark:bg-[#252528] dark:text-gray-200"
              >
                <ImageIcon className="h-3.5 w-3.5 shrink-0 text-amber-500" />
                <span className="truncate font-mono text-[11px]">{archivo.name}</span>
                <span className="ml-auto text-[10px] text-gray-400 shrink-0">
                  {(archivo.size / 1024).toFixed(0)} KB
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Botones de acción */}
        <div className="mt-6 flex flex-wrap items-center justify-end gap-2.5 border-t border-gray-100 pt-4 dark:border-gray-800">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-gray-300 bg-gray-100 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Descartar sobrantes
          </button>
          {onEscanearSobrantes && (
            <button
              type="button"
              onClick={() => {
                onEscanearSobrantes(archivosSobrantes);
                onClose();
              }}
              className="flex items-center space-x-1.5 rounded-xl bg-purple-600 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-purple-700 active:scale-98"
            >
              <Sparkles className="h-4 w-4" />
              <span>Escanear sobrantes con IA</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
