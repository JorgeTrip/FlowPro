// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import React, { useState } from 'react';
import { useArmadoStore } from '../../stores/armadoStore';
import { useProcesarLoteScan } from '../../hooks/useProcesarLoteScan';
import { PROMPT_IA_EXTERNA } from '../../utils/promptsImportacion';
import { AlertTriangle, X, Copy, Check, RotateCw, FileJson, FileWarning } from 'lucide-react';

/**
 * Modal que se abre tras un escaneo por lote en caso de que alguna planilla falle.
 * Detalla cada archivo no procesado con su motivo y ofrece alternativas directas:
 * reintento individual/masivo o derivación al importador de fallback JSON.
 */
export function ModalFallosScan() {
  const { modalFallosScanAbierto, archivosFallidosScan, setModalFallosScanAbierto, limpiarArchivosFallidosScan } =
    useArmadoStore();
  const { procesarArchivos } = useProcesarLoteScan();

  const [copiadoNombres, setCopiadoNombres] = useState(false);
  const [copiadoPrompt, setCopiadoPrompt] = useState(false);

  if (!modalFallosScanAbierto || archivosFallidosScan.length === 0) return null;

  const handleCopiarNombres = async () => {
    try {
      const texto = archivosFallidosScan.map((a) => a.nombreArchivo).join('\n');
      await navigator.clipboard.writeText(texto);
      setCopiadoNombres(true);
      setTimeout(() => setCopiadoNombres(false), 2500);
    } catch (err) {
      console.error('Error al copiar nombres:', err);
    }
  };

  const handleCopiarPromptYIrAFallback = async () => {
    try {
      await navigator.clipboard.writeText(PROMPT_IA_EXTERNA);
      setCopiadoPrompt(true);
      setTimeout(() => {
        setCopiadoPrompt(false);
        setModalFallosScanAbierto(false);
      }, 1000);
    } catch (err) {
      console.error('Error al copiar prompt:', err);
    }
  };

  const handleReintentarTodos = () => {
    const archivosReintentables = archivosFallidosScan.map((a) => a.archivo).filter(Boolean) as File[];
    limpiarArchivosFallidosScan();
    if (archivosReintentables.length > 0) {
      procesarArchivos(archivosReintentables);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative flex max-h-[85vh] w-full max-w-xl flex-col rounded-2xl border border-red-200 bg-white p-6 shadow-2xl dark:border-red-900/40 dark:bg-[#1C1C1E]">
        {/* Cabecera */}
        <div className="flex items-start justify-between border-b border-gray-100 pb-4 dark:border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="rounded-xl bg-red-100 p-2.5 text-red-600 dark:bg-red-950/50 dark:text-red-400">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">
                Planillas no procesadas ({archivosFallidosScan.length})
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Ocurrió un inconveniente al escanear estas imágenes con la IA.
              </p>
            </div>
          </div>
          <button
            onClick={() => setModalFallosScanAbierto(false)}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Lista de Archivos Fallidos */}
        <div className="my-4 max-h-60 overflow-y-auto space-y-2 pr-1">
          {archivosFallidosScan.map((item) => (
            <div
              key={item.id}
              className="flex items-start space-x-3 rounded-xl border border-red-100 bg-red-50/50 p-3 text-xs dark:border-red-950/40 dark:bg-red-950/20"
            >
              <FileWarning className="mt-0.5 h-4 w-4 shrink-0 text-red-500 dark:text-red-400" />
              <div className="flex-1 min-w-0">
                <p className="truncate font-semibold text-gray-900 dark:text-gray-200">{item.nombreArchivo}</p>
                <p className="mt-0.5 text-[11px] text-red-600 dark:text-red-400 font-medium">{item.motivo}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Barra de Recomendación */}
        <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3 text-xs text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-300">
          <p className="font-semibold">💡 Alternativa recomendada:</p>
          <p className="text-[11px] mt-0.5 opacity-90">
            Puedes copiar el prompt especializado y adjuntar estas fotos directamente en Gemini Web o ChatGPT, luego
            pegar el JSON resultante en la caja de <strong>Importación Externa</strong>.
          </p>
        </div>

        {/* Botones de Acción */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-4 dark:border-gray-800">
          <div className="flex space-x-2">
            <button
              onClick={handleCopiarNombres}
              className="flex items-center space-x-1.5 rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              {copiadoNombres ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copiadoNombres ? '¡Nombres Copiados!' : 'Copiar Nombres'}</span>
            </button>

            <button
              onClick={handleCopiarPromptYIrAFallback}
              className="flex items-center space-x-1.5 rounded-xl border border-purple-300 bg-purple-50 px-3 py-2 text-xs font-semibold text-purple-700 hover:bg-purple-100 dark:border-purple-900/60 dark:bg-purple-950/40 dark:text-purple-300"
            >
              {copiadoPrompt ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <FileJson className="h-3.5 w-3.5" />}
              <span>{copiadoPrompt ? '¡Prompt Copiado!' : 'Copiar Prompt para Fallback'}</span>
            </button>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={handleReintentarTodos}
              className="flex items-center space-x-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500"
            >
              <RotateCw className="h-3.5 w-3.5" />
              <span>Reintentar ({archivosFallidosScan.length})</span>
            </button>

            <button
              onClick={() => setModalFallosScanAbierto(false)}
              className="rounded-xl px-3.5 py-2 text-xs font-semibold text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
