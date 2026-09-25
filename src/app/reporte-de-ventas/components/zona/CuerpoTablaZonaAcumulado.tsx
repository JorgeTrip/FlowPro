'use client';

import React from 'react';
import { FilaTablaZonaAcumulado } from './types';

interface CuerpoTablaZonaAcumuladoProps {
  datos: FilaTablaZonaAcumulado[];
  totales: {
    importeA: number;
    importeX: number;
    cantidadA: number;
    cantidadX: number;
    total: number;
    totalCantidad: number;
  };
  mostrarCantidad: boolean;
  mostrarTotales: boolean;
  formatCurrency: (v: number) => string;
  formatQuantity: (v: number) => string;
}

export const CuerpoTablaZonaAcumulado: React.FC<CuerpoTablaZonaAcumuladoProps> = ({
  datos,
  totales,
  mostrarCantidad,
  mostrarTotales,
  formatCurrency,
  formatQuantity,
}) => {
  return (
    <>
      <thead className="bg-gray-50 dark:bg-gray-700">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 sticky left-0 bg-gray-50 dark:bg-gray-700 z-10">
            Zona
          </th>
          {mostrarCantidad ? (
            <>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Cant. Facturas
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Cant. Remitos
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Total Cantidad
              </th>
            </>
          ) : (
            <>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Imp. Facturas
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Imp. Remitos
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Total Importe
              </th>
            </>
          )}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
        {datos.map((item, index) => (
          <tr
            key={item.zona}
            className={index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'}
          >
            <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white sticky left-0 bg-inherit">
              🏷️ {item.zona}
            </td>
            {mostrarCantidad ? (
              <>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                  {formatQuantity(item.cantidadA)}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                  {formatQuantity(item.cantidadX)}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                  {formatQuantity(item.totalCantidad)}
                </td>
              </>
            ) : (
              <>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                  {formatCurrency(item.importeA)}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                  {formatCurrency(item.importeX)}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                  {formatCurrency(item.total)}
                </td>
              </>
            )}
          </tr>
        ))}

        {mostrarTotales && (
          <tr className="bg-blue-50 dark:bg-blue-900/20 border-t-2 border-blue-200 dark:border-blue-700">
            <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-blue-900 dark:text-blue-300 sticky left-0 bg-blue-50 dark:bg-blue-900/20">
              📊 TOTAL
            </td>
            {mostrarCantidad ? (
              <>
                <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-blue-900 dark:text-blue-300">
                  {formatQuantity(totales.cantidadA || 0)}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-blue-900 dark:text-blue-300">
                  {formatQuantity(totales.cantidadX || 0)}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-blue-900 dark:text-blue-300">
                  {formatQuantity(totales.totalCantidad || 0)}
                </td>
              </>
            ) : (
              <>
                <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-blue-900 dark:text-blue-300">
                  {formatCurrency(totales.importeA || 0)}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-blue-900 dark:text-blue-300">
                  {formatCurrency(totales.importeX || 0)}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-blue-900 dark:text-blue-300">
                  {formatCurrency(totales.total || 0)}
                </td>
              </>
            )}
          </tr>
        )}
      </tbody>
    </>
  );
};
