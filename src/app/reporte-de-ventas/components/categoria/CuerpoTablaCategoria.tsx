'use client';

import React from 'react';
import { CategoriaData } from './types';

interface CuerpoTablaCategoriaProps {
  datosProcesados: CategoriaData[];
  totalesGenerales: { cantidad: number; importe: number };
  mostrarCantidad: boolean;
  mostrarPorcentajes: boolean;
  formatCurrency: (value: number) => string;
  formatQuantity: (value: number) => string;
  calcularPorcentaje: (valor: number, total: number) => string;
}

export const CuerpoTablaCategoria: React.FC<CuerpoTablaCategoriaProps> = ({
  datosProcesados,
  totalesGenerales,
  mostrarCantidad,
  mostrarPorcentajes,
  formatCurrency,
  formatQuantity,
  calcularPorcentaje,
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Categoría/Producto
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Artículo
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Descripción
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              {mostrarCantidad ? 'Cantidad' : 'Importe'}
            </th>
            {mostrarPorcentajes && (
              <>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  % Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  % Categoría
                </th>
              </>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
          {datosProcesados.map((categoria, categoriaIndex) => {
            const totalGeneral = mostrarCantidad
              ? totalesGenerales.cantidad
              : totalesGenerales.importe;
            const valorCategoria = mostrarCantidad
              ? categoria.cantidadCategoria
              : categoria.totalCategoria;

            return (
              <React.Fragment key={categoria.categoria}>
                <tr className="bg-blue-100 dark:bg-blue-900/30 border-t-2 border-blue-200 dark:border-blue-700">
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-blue-900 dark:text-blue-300">
                    📁 {categoria.categoria}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    -
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    -
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-blue-900 dark:text-blue-300">
                    {mostrarCantidad
                      ? formatQuantity(categoria.cantidadCategoria)
                      : formatCurrency(categoria.totalCategoria)}
                  </td>
                  {mostrarPorcentajes && (
                    <>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-blue-900 dark:text-blue-300">
                        {calcularPorcentaje(valorCategoria, totalGeneral)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-blue-900 dark:text-blue-300">
                        100%
                      </td>
                    </>
                  )}
                </tr>

                {categoria.productos.map((producto, productoIndex) => {
                  const valorProducto = mostrarCantidad ? producto.cantidad : producto.total;
                  const isEven = (categoriaIndex + productoIndex) % 2 === 0;

                  return (
                    <tr
                      key={`${categoria.categoria}-${producto.articulo}`}
                      className={isEven ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'}
                    >
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400 pl-12">
                        📦 {producto.articulo}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {producto.articulo}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {producto.descripcion}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                        {mostrarCantidad
                          ? formatQuantity(producto.cantidad)
                          : formatCurrency(producto.total)}
                      </td>
                      {mostrarPorcentajes && (
                        <>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                            {calcularPorcentaje(valorProducto, totalGeneral)}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                            {calcularPorcentaje(valorProducto, valorCategoria)}
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
