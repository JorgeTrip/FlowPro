// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
import React from 'react';

/**
 * Pantalla Esqueleto (Skeleton Screen) para la tabla de prefijos durante
 * la sincronización y carga inicial desde Google Cloud Firestore.
 */
export function EsqueletoTablaPrefijos() {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1C1C1E] shadow-sm animate-pulse">
      <div className="px-6 py-3.5 bg-gray-50/50 dark:bg-[#2C2C2E]/40 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="h-2.5 w-2.5 rounded-full bg-blue-500 animate-ping" />
          <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
            Sincronizando prefijos con la nube...
          </span>
        </div>
        <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700/60 rounded" />
      </div>

      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800 text-left text-xs">
        <thead className="bg-gray-50 dark:bg-[#2C2C2E] text-gray-400 dark:text-gray-500 uppercase font-bold tracking-wider select-none">
          <tr>
            <th className="px-6 py-3">Prefijo PT</th>
            <th className="px-6 py-3">Línea de Productos</th>
            <th className="px-6 py-3">Planta de Fabricación</th>
            <th className="px-6 py-3">Descripción / Notas</th>
            <th className="px-6 py-3 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <tr key={i} className="hover:bg-gray-50/30 dark:hover:bg-[#2C2C2E]/20">
              <td className="px-6 py-4">
                <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
              </td>
              <td className="px-6 py-4">
                <div className="h-4 w-36 bg-gray-200 dark:bg-gray-700 rounded" />
              </td>
              <td className="px-6 py-4">
                <div className="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded-full" />
              </td>
              <td className="px-6 py-4">
                <div className="h-4 w-48 bg-gray-100 dark:bg-gray-800 rounded" />
              </td>
              <td className="px-6 py-4 text-right">
                <div className="inline-flex space-x-2">
                  <div className="h-7 w-7 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                  <div className="h-7 w-7 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
