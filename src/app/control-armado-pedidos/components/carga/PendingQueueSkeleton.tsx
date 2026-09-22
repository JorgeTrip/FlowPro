// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import React from 'react';

export function PendingQueueSkeleton() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-[#1C1C1E]">
      <div className="mb-3 flex items-center justify-between">
        <div className="h-4 w-52 rounded bg-gray-200 dark:bg-gray-800 animate-pulse" />
        <div className="h-3 w-40 rounded bg-gray-150 dark:bg-gray-800/60 animate-pulse" />
      </div>

      <div className="space-y-4">
        {[1, 2].map((grupo) => (
          <div key={grupo} className="space-y-2">
            {/* Separador de operador skeleton */}
            <div className="flex items-center justify-between border-b border-gray-200 pb-2 pt-3 first:pt-1 dark:border-gray-600">
              <div className="flex items-center space-x-2">
                <div className="h-5 w-5 rounded-full bg-gray-200 dark:bg-gray-800 animate-pulse" />
                <div className="h-3.5 w-28 rounded bg-gray-200 dark:bg-gray-800 animate-pulse" />
              </div>
              <div className="h-5 w-24 rounded-full bg-gray-100 dark:bg-gray-800/60 animate-pulse" />
            </div>

            {/* Tarjetas de planillas skeleton */}
            <div className="space-y-2">
              {[1, 2].map((card) => (
                <div
                  key={card}
                  className="flex items-center justify-between rounded-lg border border-gray-150 p-3 dark:border-gray-800/60"
                >
                  <div className="flex items-center space-x-3">
                    <div className="h-5 w-6 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
                    <div className="h-4 w-4 rounded bg-gray-200 dark:bg-gray-800 animate-pulse" />
                    <div className="space-y-1.5">
                      <div className="h-3.5 w-28 rounded bg-gray-200 dark:bg-gray-800 animate-pulse" />
                      <div className="h-2.5 w-20 rounded bg-gray-150 dark:bg-gray-800/60 animate-pulse" />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="h-6 w-16 rounded-md bg-gray-100 dark:bg-gray-800 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
