// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import React from 'react';
import { ResultadoItem, getCriticalityColor } from '@/app/lib/demandEstimator';

export const ResultsTable = ({ data }: { data: ResultadoItem[] }) => (
  <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
      <thead className="bg-gray-100 dark:bg-gray-800">
        <tr>
          <th scope="col" className="px-6 py-3 text-center text-sm font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-200">ID Producto</th>
          <th scope="col" className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-200">Descripción</th>
          <th scope="col" className="px-6 py-3 text-center text-sm font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-200">Venta Mensual</th>
          <th scope="col" className="px-6 py-3 text-center text-sm font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-200">Stock CABA</th>
          <th scope="col" className="px-6 py-3 text-center text-sm font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-200">Stock Reservado</th>
          <th scope="col" className="px-6 py-3 text-center text-sm font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-200">Stock Neto CABA</th>
          <th scope="col" className="px-6 py-3 text-center text-sm font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-200">Stock Entre Ríos</th>
          <th scope="col" className="px-6 py-3 text-center text-sm font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-200">Pedir a Entre Ríos</th>
          <th scope="col" className="px-6 py-3 text-center text-sm font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-200">Meses Cobertura</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
        {data.map((item, index) => {
          const criticalityClass = getCriticalityColor(item.criticidad);
          return (
            <tr key={`${item.productoId}-${index}`} className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 ${criticalityClass}`}>
              <td className="whitespace-nowrap px-6 py-4 text-sm font-mono text-gray-900 dark:text-white text-center">
                {item.productoId}
              </td>
              <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white w-64 break-words">
                {item.descripcion}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-white text-center">
                {item.venta.toLocaleString()}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-white text-center">
                {item.stockCABA.toLocaleString()}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-white text-center">
                {item.stockReservadoCABA.toLocaleString()}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white text-center">
                {item.stockNetoCABA.toLocaleString()}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-white text-center">
                {item.stockEntreRios.toLocaleString()}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white text-center">
                {item.pedirAEntreRios}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white text-center">
                {item.mesesCobertura}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);
