'use client';

import React from 'react';
import { FilaTablaMensual, TotalesTablaMensual } from './exportadorTablaMensual';
import { FilasTablaMensual } from './FilasTablaMensual';
import { FilaTotalesMensual } from './FilaTotalesMensual';

interface CuerpoTablaMensualProps {
  datosFiltrados: FilaTablaMensual[];
  totales: TotalesTablaMensual;
  mostrarCantidad: boolean;
  mostrarVariacion: boolean;
  mostrarTotales: boolean;
  formatCurrency: (value: number) => string;
  formatQuantity: (value: number) => string;
}

export const CuerpoTablaMensual: React.FC<CuerpoTablaMensualProps> = ({
  datosFiltrados,
  totales,
  mostrarCantidad,
  mostrarVariacion,
  mostrarTotales,
  formatCurrency,
  formatQuantity,
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Mes
            </th>
            {mostrarCantidad ? (
              <>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Cant. Facturas
                </th>
                {mostrarVariacion && (
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Var %
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Cant. Remitos
                </th>
                {mostrarVariacion && (
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Var %
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Total Cantidad
                </th>
                {mostrarVariacion && (
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Var %
                  </th>
                )}
              </>
            ) : (
              <>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Imp. Facturas
                </th>
                {mostrarVariacion && (
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Var %
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Imp. Remitos
                </th>
                {mostrarVariacion && (
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Var %
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Total Importe
                </th>
                {mostrarVariacion && (
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Var %
                  </th>
                )}
              </>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
          <FilasTablaMensual
            datosFiltrados={datosFiltrados}
            mostrarCantidad={mostrarCantidad}
            mostrarVariacion={mostrarVariacion}
            formatCurrency={formatCurrency}
            formatQuantity={formatQuantity}
          />

          {mostrarTotales && (
            <FilaTotalesMensual
              totales={totales}
              mostrarCantidad={mostrarCantidad}
              mostrarVariacion={mostrarVariacion}
              formatCurrency={formatCurrency}
              formatQuantity={formatQuantity}
            />
          )}
        </tbody>
      </table>
    </div>
  );
};
