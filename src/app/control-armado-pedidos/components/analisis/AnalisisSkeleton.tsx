// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import React from 'react';

export function AnalisisSkeleton() {
  return (
    <div className="space-y-6">
      {/* Barra de resumen skeleton */}
      <div className="h-10 w-full rounded-xl border border-gray-200 bg-white/95 p-2.5 shadow-sm dark:border-gray-800 dark:bg-[#1C1C1E]/95">
        <div className="flex items-center space-x-4">
          <div className="h-4 w-28 rounded bg-gray-200 dark:bg-gray-800 animate-pulse" />
          <div className="h-4 w-24 rounded bg-gray-150 dark:bg-gray-800/60 animate-pulse" />
          <div className="h-4 w-32 rounded bg-gray-150 dark:bg-gray-800/60 animate-pulse" />
          <div className="h-4 w-36 rounded bg-gray-150 dark:bg-gray-800/60 animate-pulse" />
        </div>
      </div>

      {/* Tarjetas KPI skeleton (4 tarjetas) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((id) => (
          <div
            key={id}
            className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-[#1C1C1E]"
          >
            <div className="flex items-center justify-between">
              <div className="h-4 w-28 rounded bg-gray-200 dark:bg-gray-800 animate-pulse" />
              <div className="h-8 w-8 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
            </div>
            <div className="mt-4 h-8 w-24 rounded bg-gray-200 dark:bg-gray-800 animate-pulse" />
            <div className="mt-2 h-3.5 w-36 rounded bg-gray-150 dark:bg-gray-800/60 animate-pulse" />
          </div>
        ))}
      </div>

      {/* Gráficos de Rendimiento skeleton (2 contenedores) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map((id) => (
          <div
            key={id}
            className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-[#1C1C1E]"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="h-5 w-48 rounded bg-gray-200 dark:bg-gray-800 animate-pulse" />
              <div className="h-4 w-20 rounded bg-gray-150 dark:bg-gray-800/60 animate-pulse" />
            </div>
            {/* Gráfico simulado con barras */}
            <div className="h-64 w-full rounded-xl bg-gray-50 dark:bg-gray-900/40 p-4 flex items-end gap-3 justify-around">
              <div className="h-2/5 w-8 rounded-t bg-gray-200 dark:bg-gray-800 animate-pulse" />
              <div className="h-4/5 w-8 rounded-t bg-gray-200 dark:bg-gray-800 animate-pulse" />
              <div className="h-3/5 w-8 rounded-t bg-gray-200 dark:bg-gray-800 animate-pulse" />
              <div className="h-1/2 w-8 rounded-t bg-gray-200 dark:bg-gray-800 animate-pulse" />
              <div className="h-3/4 w-8 rounded-t bg-gray-200 dark:bg-gray-800 animate-pulse" />
              <div className="h-2/3 w-8 rounded-t bg-gray-200 dark:bg-gray-800 animate-pulse" />
            </div>
          </div>
        ))}
      </div>

      {/* Tabla de Analítica skeleton */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-[#1C1C1E]">
        <div className="h-5 w-40 rounded bg-gray-200 dark:bg-gray-800 animate-pulse mb-4" />
        <div className="space-y-3">
          <div className="h-8 w-full rounded-lg bg-gray-100 dark:bg-gray-800/60 animate-pulse" />
          <div className="h-10 w-full rounded-lg bg-gray-50 dark:bg-gray-800/30 animate-pulse" />
          <div className="h-10 w-full rounded-lg bg-gray-50 dark:bg-gray-800/30 animate-pulse" />
          <div className="h-10 w-full rounded-lg bg-gray-50 dark:bg-gray-800/30 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
