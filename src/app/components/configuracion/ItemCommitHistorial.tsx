// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import React, { useState } from 'react';
import type { CommitHistorial, TipoCommit } from './typesConfiguracion';
import { ChevronDown, ChevronUp } from 'lucide-react';

const BADGES_TIPO: Record<TipoCommit, { etiqueta: string; clases: string }> = {
  feat: { etiqueta: 'feat: 🚀', clases: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800' },
  fix: { etiqueta: 'fix: 🔧', clases: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800' },
  breaking: { etiqueta: 'BREAKING: 💥', clases: 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 border border-red-300 dark:border-red-800' },
  chore: { etiqueta: 'chore', clases: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border border-gray-300 dark:border-gray-700' },
  refactor: { etiqueta: 'refactor', clases: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-300 dark:border-purple-800' },
  otros: { etiqueta: 'commit', clases: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700' },
};

export function ItemCommitHistorial({ commit }: { commit: CommitHistorial }) {
  const [expandido, setExpandido] = useState(false);
  const badge = BADGES_TIPO[commit.tipo] || BADGES_TIPO.otros;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3.5 shadow-sm transition-all hover:border-gray-300 dark:border-gray-800 dark:bg-[#1C1C1E] dark:hover:border-gray-700">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${badge.clases}`}>
            {badge.etiqueta}
          </span>
          <span className="font-mono text-[11px] font-semibold text-blue-600 dark:text-blue-400">
            {commit.shortHash}
          </span>
        </div>
        <span className="text-[11px] text-gray-500 dark:text-gray-400">
          {commit.fecha}
        </span>
      </div>

      <p className="mt-1.5 text-xs font-semibold text-gray-900 dark:text-gray-100 leading-snug">
        {commit.titulo}
      </p>

      {commit.cuerpo && (
        <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-800/80">
          <button
            type="button"
            onClick={() => setExpandido(!expandido)}
            className="flex items-center space-x-1 text-[11px] font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
          >
            {expandido ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            <span>{expandido ? 'Ocultar detalles' : 'Ver detalles del cambio'}</span>
          </button>

          {expandido && (
            <pre className="mt-2 whitespace-pre-wrap rounded-lg bg-gray-50 p-2.5 font-mono text-[11px] text-gray-700 dark:bg-gray-900/60 dark:text-gray-300 leading-relaxed border border-gray-200/60 dark:border-gray-800">
              {commit.cuerpo}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
