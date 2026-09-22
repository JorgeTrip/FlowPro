// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import React from 'react';
import { Copy, Check, ExternalLink, AlertCircle, CheckCircle2 } from 'lucide-react';
import { MiniDropzoneImagenesJson } from './MiniDropzoneImagenesJson';

interface WizardStepPanelsProps {
  pasoActual: number;
  copiado: boolean;
  onCopiarPrompt: () => void;
  jsonInput: string;
  onJsonInputChange: (val: string) => void;
  archivosFotos: File[];
  onArchivosFotosChange: (archivos: File[]) => void;
  errorParse: string | null;
  exitoMensaje: string | null;
}

export function WizardStepPanels({
  pasoActual,
  copiado,
  onCopiarPrompt,
  jsonInput,
  onJsonInputChange,
  archivosFotos,
  onArchivosFotosChange,
  errorParse,
  exitoMensaje,
}: WizardStepPanelsProps) {
  if (pasoActual === 1) {
    return (
      <div className="space-y-3">
        <p className="text-xs text-gray-600 dark:text-gray-300">
          Copia este prompt del sistema. Le indicará a la IA las columnas exactas de las planillas de armado y le exigirá responder únicamente con el formato JSON listo para copiar.
        </p>
        <button
          onClick={onCopiarPrompt}
          className="flex w-full items-center justify-center space-x-2 rounded-xl border border-purple-300 bg-purple-50 p-4 text-xs font-bold text-purple-700 shadow-sm transition-all hover:bg-purple-100 dark:border-purple-800 dark:bg-purple-950/40 dark:text-purple-300"
        >
          {copiado ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
          <span>{copiado ? '¡Prompt Copiado al Portapapeles!' : 'Copiar Prompt Especializado'}</span>
        </button>
      </div>
    );
  }

  if (pasoActual === 2) {
    return (
      <div className="space-y-3">
        <p className="text-xs text-gray-600 dark:text-gray-300">
          Abre la IA de tu preferencia. En el chat, <strong>pega el prompt</strong> que acabas de copiar y luego <strong>adjunta las fotos</strong> de las planillas:
        </p>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
          <a href="https://gemini.google.com/" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 p-3 text-xs font-semibold hover:border-purple-400 dark:border-gray-800 dark:bg-gray-900/50">
            <span>Gemini Web</span>
            <ExternalLink className="h-3.5 w-3.5 text-purple-500" />
          </a>
          <a href="https://chatgpt.com/" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 p-3 text-xs font-semibold hover:border-purple-400 dark:border-gray-800 dark:bg-gray-900/50">
            <span>ChatGPT</span>
            <ExternalLink className="h-3.5 w-3.5 text-emerald-500" />
          </a>
          <a href="https://claude.ai/" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 p-3 text-xs font-semibold hover:border-purple-400 dark:border-gray-800 dark:bg-gray-900/50">
            <span>Claude</span>
            <ExternalLink className="h-3.5 w-3.5 text-amber-500" />
          </a>
        </div>
      </div>
    );
  }

  if (pasoActual === 3) {
    return (
      <div className="space-y-3">
        <p className="text-xs text-gray-600 dark:text-gray-300">
          Cuando la IA termine de analizar tus imágenes, mostrará una caja de código con el rótulo <strong>json</strong>. Haz clic en el botón <strong>&quot;Copiar código&quot;</strong> en la respuesta de la IA.
        </p>
        <div className="rounded-xl border border-gray-700 bg-gray-900 p-3 text-xs text-gray-300 font-mono">
          <div className="flex justify-between border-b border-gray-800 pb-1.5 text-[11px] text-gray-400">
            <span>json</span>
            <span className="flex items-center space-x-1 text-purple-400">
              <Copy className="h-3 w-3" />
              <span>Copiar código (en la IA)</span>
            </span>
          </div>
          <pre className="mt-2 text-[11px] text-emerald-400">{'{\n  "planillas": [\n    { "nombreArchivo": "foto1.jpg", "empleadoHeader": "GABRIEL", ... }\n  ]\n}'}</pre>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-600 dark:text-gray-300">
        Pega aquí el código JSON emitido por la IA y, opcionalmente, adjunta las fotos para vincularlas de forma automática:
      </p>
      <textarea
        value={jsonInput}
        onChange={(e) => onJsonInputChange(e.target.value)}
        placeholder='Pega aquí el código JSON emitido por la IA...'
        className="h-24 w-full rounded-xl border border-gray-200 bg-gray-50 p-3 font-mono text-xs focus:border-purple-500 focus:outline-none dark:border-gray-800 dark:bg-gray-900/60 dark:text-gray-200"
      />

      <MiniDropzoneImagenesJson
        archivos={archivosFotos}
        onArchivosChange={onArchivosFotosChange}
        compacto
      />

      {errorParse && (
        <div className="flex items-center space-x-1.5 text-xs text-red-600 dark:text-red-400 font-medium">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorParse}</span>
        </div>
      )}
      {exitoMensaje && (
        <div className="flex items-center space-x-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{exitoMensaje}</span>
        </div>
      )}
    </div>
  );
}
