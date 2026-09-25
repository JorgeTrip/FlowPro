'use client';

import React from 'react';
import { FilaVendedorAcumulado } from './types';

interface CuerpoTablaVendedorAcumuladoProps {
  datos: FilaVendedorAcumulado[];
  totales: {
    importeA: number;
    importeX: number;
    cantidadA: number;
    cantidadX: number;
    total: number;
    totalCantidad: number;
  } | null;
  mostrarCantidad: boolean;
  mostrarTotales: boolean;
  formatCurrency: (v: number) => string;
  formatQuantity: (v: number) => string;
}

export const CuerpoTablaVendedorAcumulado: React.FC<CuerpoTablaVendedorAcumuladoProps> = ({
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
          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Vendedor
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
            {mostrarCantidad ? 'Cant. Facturas' : 'Imp. Facturas'}
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
            {mostrarCantidad ? 'Cant. Remitos' : 'Imp. Remitos'}
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
            {mostrarCantidad ? 'Total Cantidad' : 'Total Importe'}
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
        {datos.map((item, index) => (
          <tr
            key={item.vendedor}
            className={index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'}
          >
            <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
              👤 {item.vendedor}
            </td>
            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
              {mostrarCantidad ? formatQuantity(item.cantidadA) : formatCurrency(item.importeA)}
            </td>
            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
              {mostrarCantidad ? formatQuantity(item.cantidadX) : formatCurrency(item.importeX)}
            </td>
            <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
              {mostrarCantidad ? formatQuantity(item.totalCantidad) : formatCurrency(item.total)}
            </td>
          </tr>
        ))}

        {mostrarTotales && totales && (
          <tr className="bg-blue-50 dark:bg-blue-900/20 border-t-2 border-blue-200 dark:border-blue-700">
            <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-blue-900 dark:text-blue-300">
              TOTAL
            </td>
            <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-blue-900 dark:text-blue-300">
              {mostrarCantidad ? formatQuantity(totales.cantidadA) : formatCurrency(totales.importeA)}
            </td>
            <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-blue-900 dark:text-blue-300">
              {mostrarCantidad ? formatQuantity(totales.cantidadX) : formatCurrency(totales.importeX)}
            </td>
            <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-blue-900 dark:text-blue-300">
              {mostrarCantidad ? formatQuantity(totales.totalCantidad) : formatCurrency(totales.total)}
            </td>
          </tr>
        )}
      </tbody>
    </>
  );
};
