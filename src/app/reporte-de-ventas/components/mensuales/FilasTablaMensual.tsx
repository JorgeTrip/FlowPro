'use client';

import React from 'react';
import { FilaTablaMensual } from './exportadorTablaMensual';

interface FilasTablaMensualProps {
  datosFiltrados: FilaTablaMensual[];
  mostrarCantidad: boolean;
  mostrarVariacion: boolean;
  formatCurrency: (value: number) => string;
  formatQuantity: (value: number) => string;
}

export const FilasTablaMensual: React.FC<FilasTablaMensualProps> = ({
  datosFiltrados,
  mostrarCantidad,
  mostrarVariacion,
  formatCurrency,
  formatQuantity,
}) => {
  return (
    <>
      {datosFiltrados.map((item, index) => (
        <tr
          key={item.mes}
          className={index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'}
        >
          <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
            {item.mes}
          </td>
          {mostrarCantidad ? (
            <>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                {formatQuantity(item.cantidadA)}
              </td>
              {mostrarVariacion && (
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                  {item.tieneVariacion ? (
                    <span
                      className={
                        item.varCantidadA > 0
                          ? 'text-green-600 dark:text-green-400'
                          : item.varCantidadA < 0
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-gray-500 dark:text-gray-400'
                      }
                    >
                      {item.varCantidadA > 0 ? '+' : ''}
                      {item.varCantidadA.toFixed(1)}%
                    </span>
                  ) : (
                    <span className="text-gray-400 dark:text-gray-600">-</span>
                  )}
                </td>
              )}
              <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                {formatQuantity(item.cantidadX)}
              </td>
              {mostrarVariacion && (
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                  {item.tieneVariacion ? (
                    <span
                      className={
                        item.varCantidadX > 0
                          ? 'text-green-600 dark:text-green-400'
                          : item.varCantidadX < 0
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-gray-500 dark:text-gray-400'
                      }
                    >
                      {item.varCantidadX > 0 ? '+' : ''}
                      {item.varCantidadX.toFixed(1)}%
                    </span>
                  ) : (
                    <span className="text-gray-400 dark:text-gray-600">-</span>
                  )}
                </td>
              )}
              <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                {formatQuantity(item.totalCantidad)}
              </td>
              {mostrarVariacion && (
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                  {item.tieneVariacion ? (
                    <span
                      className={
                        item.varTotalCantidad > 0
                          ? 'text-green-600 dark:text-green-400'
                          : item.varTotalCantidad < 0
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-gray-500 dark:text-gray-400'
                      }
                    >
                      {item.varTotalCantidad > 0 ? '+' : ''}
                      {item.varTotalCantidad.toFixed(1)}%
                    </span>
                  ) : (
                    <span className="text-gray-400 dark:text-gray-600">-</span>
                  )}
                </td>
              )}
            </>
          ) : (
            <>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                {formatCurrency(item.importeA)}
              </td>
              {mostrarVariacion && (
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                  {item.tieneVariacion ? (
                    <span
                      className={
                        item.varImporteA > 0
                          ? 'text-green-600 dark:text-green-400'
                          : item.varImporteA < 0
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-gray-500 dark:text-gray-400'
                      }
                    >
                      {item.varImporteA > 0 ? '+' : ''}
                      {item.varImporteA.toFixed(1)}%
                    </span>
                  ) : (
                    <span className="text-gray-400 dark:text-gray-600">-</span>
                  )}
                </td>
              )}
              <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                {formatCurrency(item.importeX)}
              </td>
              {mostrarVariacion && (
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                  {item.tieneVariacion ? (
                    <span
                      className={
                        item.varImporteX > 0
                          ? 'text-green-600 dark:text-green-400'
                          : item.varImporteX < 0
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-gray-500 dark:text-gray-400'
                      }
                    >
                      {item.varImporteX > 0 ? '+' : ''}
                      {item.varImporteX.toFixed(1)}%
                    </span>
                  ) : (
                    <span className="text-gray-400 dark:text-gray-600">-</span>
                  )}
                </td>
              )}
              <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                {formatCurrency(item.total)}
              </td>
              {mostrarVariacion && (
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                  {item.tieneVariacion ? (
                    <span
                      className={
                        item.varTotal > 0
                          ? 'text-green-600 dark:text-green-400'
                          : item.varTotal < 0
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-gray-500 dark:text-gray-400'
                      }
                    >
                      {item.varTotal > 0 ? '+' : ''}
                      {item.varTotal.toFixed(1)}%
                    </span>
                  ) : (
                    <span className="text-gray-400 dark:text-gray-600">-</span>
                  )}
                </td>
              )}
            </>
          )}
        </tr>
      ))}
    </>
  );
};
