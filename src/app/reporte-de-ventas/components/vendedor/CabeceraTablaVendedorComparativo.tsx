'use client';

import React from 'react';

interface CabeceraTablaVendedorComparativoProps {
  mesesSeleccionados: string[];
  mostrarVariacion: boolean;
}

export const CabeceraTablaVendedorComparativo: React.FC<CabeceraTablaVendedorComparativoProps> = ({
  mesesSeleccionados,
  mostrarVariacion,
}) => {
  return (
    <thead className="bg-gray-50 dark:bg-gray-700">
      <tr>
        <th
          rowSpan={2}
          className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700 align-middle"
        >
          Vendedor
        </th>
        {mesesSeleccionados.map((mes) => (
          <th
            key={mes}
            colSpan={mostrarVariacion ? 4 : 3}
            className="px-4 py-2 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700"
          >
            {mes}
          </th>
        ))}
        <th
          rowSpan={2}
          className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700 align-middle"
        >
          TOTAL GLOBAL
        </th>
      </tr>
      <tr>
        {mesesSeleccionados.map((mes) => (
          <React.Fragment key={`${mes}-sub`}>
            <th className="px-4 py-2 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
              Fact
            </th>
            <th className="px-4 py-2 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
              Rem
            </th>
            <th className="px-4 py-2 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
              Total
            </th>
            {mostrarVariacion && (
              <th className="px-4 py-2 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                Var %
              </th>
            )}
          </React.Fragment>
        ))}
      </tr>
    </thead>
  );
};
