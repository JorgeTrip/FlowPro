'use client';

import React from 'react';
import { FilaVendedorComparativo, MesDato } from './types';
import { CabeceraTablaVendedorComparativo } from './CabeceraTablaVendedorComparativo';

interface CuerpoTablaVendedorComparativoProps {
  datos: FilaVendedorComparativo[];
  totales: {
    totalGlobalImporte: number;
    totalGlobalCantidad: number;
    meses: Record<string, MesDato>;
  } | null;
  mesesSeleccionados: string[];
  mostrarCantidad: boolean;
  mostrarTotales: boolean;
  mostrarVariacion: boolean;
  formatCurrency: (v: number) => string;
  formatQuantity: (v: number) => string;
}

export const CuerpoTablaVendedorComparativo: React.FC<CuerpoTablaVendedorComparativoProps> = ({
  datos,
  totales,
  mesesSeleccionados,
  mostrarCantidad,
  mostrarTotales,
  mostrarVariacion,
  formatCurrency,
  formatQuantity,
}) => {
  return (
    <>
      <CabeceraTablaVendedorComparativo
        mesesSeleccionados={mesesSeleccionados}
        mostrarVariacion={mostrarVariacion}
      />
      <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
        {datos.map((item, index) => (
          <tr
            key={item.vendedor}
            className={index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'}
          >
            <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">
              👤 {item.vendedor}
            </td>
            {mesesSeleccionados.map((mes, mesIndex) => {
              const mesData = item.meses[mes];
              let variacion = 0;
              let tieneVariacion = false;
              if (mesIndex > 0) {
                const dataAnt = item.meses[mesesSeleccionados[mesIndex - 1]];
                const valAct = mostrarCantidad ? mesData.totalCantidad : mesData.totalImporte;
                const valAnt = mostrarCantidad ? dataAnt.totalCantidad : dataAnt.totalImporte;
                if (valAnt > 0) {
                  variacion = ((valAct - valAnt) / valAnt) * 100;
                  tieneVariacion = true;
                }
              }

              return (
                <React.Fragment key={mes}>
                  <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-500 dark:text-gray-400 text-right">
                    {mostrarCantidad ? formatQuantity(mesData.cantidadA) : formatCurrency(mesData.importeA)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-500 dark:text-gray-400 text-right">
                    {mostrarCantidad ? formatQuantity(mesData.cantidadX) : formatCurrency(mesData.importeX)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm font-medium text-gray-900 dark:text-white text-right">
                    {mostrarCantidad ? formatQuantity(mesData.totalCantidad) : formatCurrency(mesData.totalImporte)}
                  </td>
                  {mostrarVariacion && (
                    <td className="whitespace-nowrap px-4 py-4 text-sm font-medium text-right border-r border-gray-200 dark:border-gray-700">
                      {tieneVariacion ? (
                        <span
                          className={
                            variacion > 0
                              ? 'text-green-600 dark:text-green-400'
                              : variacion < 0
                                ? 'text-red-600 dark:text-red-400'
                                : 'text-gray-500 dark:text-gray-400'
                          }
                        >
                          {variacion > 0 ? '+' : ''}
                          {variacion.toFixed(1)}%
                        </span>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-600">-</span>
                      )}
                    </td>
                  )}
                </React.Fragment>
              );
            })}
            <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-gray-900 dark:text-white text-center">
              {mostrarCantidad ? formatQuantity(item.totalGlobalCantidad) : formatCurrency(item.totalGlobalImporte)}
            </td>
          </tr>
        ))}

        {mostrarTotales && totales && (
          <tr className="bg-blue-50 dark:bg-blue-900/20 border-t-2 border-blue-200 dark:border-blue-700">
            <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-blue-900 dark:text-blue-300 border-r border-blue-200 dark:border-blue-700">
              TOTAL
            </td>
            {mesesSeleccionados.map((mes, mesIndex) => {
              const d = totales.meses[mes];
              let variacion = 0;
              let tieneVariacion = false;
              if (mesIndex > 0) {
                const dataAnt = totales.meses[mesesSeleccionados[mesIndex - 1]];
                const valAct = mostrarCantidad ? d.totalCantidad : d.totalImporte;
                const valAnt = mostrarCantidad ? dataAnt.totalCantidad : dataAnt.totalImporte;
                if (valAnt > 0) {
                  variacion = ((valAct - valAnt) / valAnt) * 100;
                  tieneVariacion = true;
                }
              }

              return (
                <React.Fragment key={mes}>
                  <td className="whitespace-nowrap px-4 py-4 text-sm font-bold text-blue-900 dark:text-blue-300 text-right">
                    {mostrarCantidad ? formatQuantity(d.cantidadA) : formatCurrency(d.importeA)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm font-bold text-blue-900 dark:text-blue-300 text-right">
                    {mostrarCantidad ? formatQuantity(d.cantidadX) : formatCurrency(d.importeX)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm font-bold text-blue-900 dark:text-blue-300 text-right">
                    {mostrarCantidad ? formatQuantity(d.totalCantidad) : formatCurrency(d.totalImporte)}
                  </td>
                  {mostrarVariacion && (
                    <td className="whitespace-nowrap px-4 py-4 text-sm font-bold text-right border-r border-blue-200 dark:border-blue-700">
                      {tieneVariacion ? (
                        <span
                          className={
                            variacion > 0
                              ? 'text-green-600 dark:text-green-400'
                              : variacion < 0
                                ? 'text-red-600 dark:text-red-400'
                                : 'text-gray-500 dark:text-gray-400'
                          }
                        >
                          {variacion > 0 ? '+' : ''}
                          {variacion.toFixed(1)}%
                        </span>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-600">-</span>
                      )}
                    </td>
                  )}
                </React.Fragment>
              );
            })}
            <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-blue-900 dark:text-blue-300 text-center">
              {mostrarCantidad
                ? formatQuantity(totales.totalGlobalCantidad)
                : formatCurrency(totales.totalGlobalImporte)}
            </td>
          </tr>
        )}
      </tbody>
    </>
  );
};
