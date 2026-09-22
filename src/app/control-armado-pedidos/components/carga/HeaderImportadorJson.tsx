// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import React from 'react';
import { FileJson, Copy, Check, ExternalLink } from 'lucide-react';

interface HeaderImportadorJsonProps {
  copiado: boolean;
  onCopiarPrompt: () => void;
}

export function HeaderImportadorJson({
  copiado,
  onCopiarPrompt,
}: HeaderImportadorJsonProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-purple-100 pb-3 dark:border-purple-900/40">
      <div className="flex items-center space-x-2">
        <div className="rounded-lg bg-purple-500/10 p-2 text-purple-600 dark:text-purple-400">
          <FileJson className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
            Importación Externa de JSON
          </h3>
          <p className="text-[11px] text-gray-500 dark:text-gray-400">
            Pega estructuras generadas por IA externa
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-1.5">
        <button
          type="button"
          onClick={onCopiarPrompt}
          className={`flex items-center space-x-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold shadow-sm transition-all shrink-0 ${
            copiado
              ? 'border border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
              : 'border border-purple-300 bg-purple-50 text-purple-600 hover:bg-purple-100 dark:border-purple-800 dark:bg-purple-950/30 dark:text-purple-400'
          }`}
          title="Copiar prompt al portapapeles"
        >
          {copiado ? (
            <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
          <span>{copiado ? '¡Copiado!' : 'Copiar Prompt IA'}</span>
        </button>

        <a
          href="https://gemini.google.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center rounded-xl border border-purple-200 bg-purple-50 p-1.5 text-purple-600 hover:bg-purple-100 dark:border-purple-800 dark:bg-purple-950/30 dark:text-purple-400 transition-all"
          title="Abrir Gemini Web"
        >
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    </div>
  );
}
