'use client';

import React from 'react';

interface CuerpoTablaZonaComparativoProps {
  datos: any[];
  totales: {
    totalesMeses: Record<string, number>;
    granTotal: number;
  };
  mesesSeleccionados: string[];
  mostrarVariacion: boolean;
  mostrarCantidad: boolean;
  mostrarTotales: boolean;
  formatCurrency: (v: number) => string;
  formatQuantity: (v: number) => string;
}

export const CuerpoTablaZonaComparativo: React.FC<CuerpoTablaZonaComparativoProps> = ({
  datos,
  totales,
  mesesSeleccionados,
  mostrarVariacion,
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
          {mesesSeleccionados.map((mes, idx) => (
            <React.Fragment key={mes}>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {mes}
              </th>
              {mostrarVariacion && idx > 0 && (
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Var %
                </th>
              )}
            </React.Fragment>
          ))}
          <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-bold">
            Total
          </th>
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
            {mesesSeleccionados.map((mes, idx) => (
              <React.Fragment key={mes}>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                  {mostrarCantidad
                    ? formatQuantity(item.meses[mes] || 0)
                    : formatCurrency(item.meses[mes] || 0)}
                </td>
                {mostrarVariacion && idx > 0 && (
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                    {item.variaciones[mes] !== undefined ? (
                      <span
                        className={
                          item.variaciones[mes] > 0
                            ? 'text-green-600 dark:text-green-400'
                            : item.variaciones[mes] < 0
                              ? 'text-red-600 dark:text-red-400'
                              : 'text-gray-500 dark:text-gray-400'
                        }
                      >
                        {item.variaciones[mes] > 0 ? '+' : ''}
                        {item.variaciones[mes].toFixed(1)}%
                      </span>
                    ) : (
                      <span className="text-gray-400 dark:text-gray-600">-</span>
                    )}
                  </td>
                )}
              </React.Fragment>
            ))}
            <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-gray-900 dark:text-white">
              {mostrarCantidad ? formatQuantity(item.total) : formatCurrency(item.total)}
            </td>
          </tr>
        ))}

        {mostrarTotales && (
          <tr className="bg-blue-50 dark:bg-blue-900/20 border-t-2 border-blue-200 dark:border-blue-700">
            <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-blue-900 dark:text-blue-300 sticky left-0 bg-blue-50 dark:bg-blue-900/20">
              📊 TOTAL
            </td>
            {mesesSeleccionados.map((mes, idx) => (
              <React.Fragment key={mes}>
                <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-blue-900 dark:text-blue-300">
                  {mostrarCantidad
                    ? formatQuantity(totales.totalesMeses[mes] || 0)
                    : formatCurrency(totales.totalesMeses[mes] || 0)}
                </td>
                {mostrarVariacion && idx > 0 && <td className="px-6 py-4"></td>}
              </React.Fragment>
            ))}
            <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-blue-900 dark:text-blue-300">
              {mostrarCantidad ? formatQuantity(totales.granTotal) : formatCurrency(totales.granTotal)}
            </td>
          </tr>
        )}
      </tbody>
    </>
  );
};
