'use client';

import React from 'react';
import { TotalesTablaMensual } from './exportadorTablaMensual';

interface FilaTotalesMensualProps {
  totales: TotalesTablaMensual;
  mostrarCantidad: boolean;
  mostrarVariacion: boolean;
  formatCurrency: (value: number) => string;
  formatQuantity: (value: number) => string;
}

export const FilaTotalesMensual: React.FC<FilaTotalesMensualProps> = ({
  totales,
  mostrarCantidad,
  mostrarVariacion,
  formatCurrency,
  formatQuantity,
}) => {
  return (
    <tr className="bg-blue-50 dark:bg-blue-900/20 border-t-2 border-blue-200 dark:border-blue-700">
      <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-blue-900 dark:text-blue-300">
        TOTAL
      </td>
      {mostrarCantidad ? (
        <>
          <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-blue-900 dark:text-blue-300">
            {formatQuantity(totales.cantidadA)}
          </td>
          {mostrarVariacion && <td className="px-6 py-4"></td>}
          <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-blue-900 dark:text-blue-300">
            {formatQuantity(totales.cantidadX)}
          </td>
          {mostrarVariacion && <td className="px-6 py-4"></td>}
          <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-blue-900 dark:text-blue-300">
            {formatQuantity(totales.totalCantidad)}
          </td>
          {mostrarVariacion && <td className="px-6 py-4"></td>}
        </>
      ) : (
        <>
          <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-blue-900 dark:text-blue-300">
            {formatCurrency(totales.importeA)}
          </td>
          {mostrarVariacion && <td className="px-6 py-4"></td>}
          <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-blue-900 dark:text-blue-300">
            {formatCurrency(totales.importeX)}
          </td>
          {mostrarVariacion && <td className="px-6 py-4"></td>}
          <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-blue-900 dark:text-blue-300">
            {formatCurrency(totales.total)}
          </td>
          {mostrarVariacion && <td className="px-6 py-4"></td>}
        </>
      )}
    </tr>
  );
};
