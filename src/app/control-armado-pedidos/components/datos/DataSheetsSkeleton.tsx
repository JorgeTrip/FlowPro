// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import React from 'react';

export function DataSheetsSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((id) => (
        <div
          key={id}
          className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-[#1C1C1E]"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            {/* Skeleton Thumbnail */}
            <div className="h-24 w-24 shrink-0 rounded-xl bg-gray-200 dark:bg-gray-800 animate-pulse" />

            {/* Skeleton Info Principal */}
            <div className="flex-1 min-w-0 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="space-y-1.5">
                  <div className="h-5 w-44 rounded bg-gray-200 dark:bg-gray-800 animate-pulse" />
                  <div className="h-3.5 w-60 rounded bg-gray-150 dark:bg-gray-800/60 animate-pulse" />
                </div>
                {/* Botones de acción skeleton */}
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-20 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
                  <div className="h-8 w-8 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
                </div>
              </div>

              {/* Chips de métricas */}
              <div className="flex flex-wrap gap-2 pt-1">
                <div className="h-6 w-24 rounded-lg bg-gray-100 dark:bg-gray-800/70 animate-pulse" />
                <div className="h-6 w-28 rounded-lg bg-gray-100 dark:bg-gray-800/70 animate-pulse" />
                <div className="h-6 w-32 rounded-lg bg-gray-100 dark:bg-gray-800/70 animate-pulse" />
              </div>

              {/* Pie de tarjeta skeleton */}
              <div className="h-3 w-40 rounded bg-gray-100 dark:bg-gray-800/40 animate-pulse pt-1" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
