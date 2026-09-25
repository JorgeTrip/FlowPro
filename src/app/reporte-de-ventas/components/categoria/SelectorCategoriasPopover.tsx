'use client';

import React from 'react';
import { CategoriaData } from './types';

interface SelectorCategoriasPopoverProps {
  categoriasSeleccionadas: string[];
  setCategoriasSeleccionadas: (cats: string[]) => void;
  popoverVisible: boolean;
  setPopoverVisible: (visible: boolean) => void;
  data: CategoriaData[];
  mostrarCantidad: boolean;
}

export const SelectorCategoriasPopover: React.FC<SelectorCategoriasPopoverProps> = ({
  categoriasSeleccionadas,
  setCategoriasSeleccionadas,
  popoverVisible,
  setPopoverVisible,
  data,
  mostrarCantidad,
}) => {
  return (
    <div className="relative">
      <button
        onClick={() => setPopoverVisible(!popoverVisible)}
        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-44 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
      >
        {categoriasSeleccionadas.length === 0
          ? 'Todas las categorías'
          : categoriasSeleccionadas.length === 1
            ? categoriasSeleccionadas[0]
            : `${categoriasSeleccionadas.length} categorías`}
      </button>

      {popoverVisible && (
        <div className="absolute top-full left-0 mt-1 w-96 bg-white border border-gray-300 rounded-lg shadow-lg z-10 dark:bg-gray-700 dark:border-gray-600">
          <div className="p-4">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Categorías ordenadas por {mostrarCantidad ? 'cantidad' : 'importe'} (mayor a menor)
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {data
                .slice()
                .sort((a, b) => {
                  const valorA = mostrarCantidad ? a.cantidadCategoria : a.totalCategoria;
                  const valorB = mostrarCantidad ? b.cantidadCategoria : b.totalCategoria;
                  return valorB - valorA;
                })
                .map((cat) => (
                  <label
                    key={cat.categoria}
                    className="flex items-center space-x-2 text-sm cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={categoriasSeleccionadas.includes(cat.categoria)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setCategoriasSeleccionadas([
                            ...categoriasSeleccionadas,
                            cat.categoria,
                          ]);
                        } else {
                          setCategoriasSeleccionadas(
                            categoriasSeleccionadas.filter((c) => c !== cat.categoria)
                          );
                        }
                      }}
                      className="rounded"
                    />
                    <span className="flex-1 text-gray-900 dark:text-gray-100">
                      {cat.categoria}
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                        {mostrarCantidad
                          ? `(${cat.cantidadCategoria?.toLocaleString('es-AR')} u.)`
                          : `(${cat.totalCategoria?.toLocaleString('es-AR', {
                              style: 'currency',
                              currency: 'ARS',
                              maximumFractionDigits: 0,
                            })})`}
                      </span>
                    </span>
                  </label>
                ))}
            </div>
            <div className="flex justify-between mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
              <button
                onClick={() => setCategoriasSeleccionadas([])}
                disabled={categoriasSeleccionadas.length === 0}
                className={`text-sm px-3 py-1 rounded transition-colors ${
                  categoriasSeleccionadas.length === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500'
                }`}
              >
                Limpiar
              </button>
              <div className="space-x-2">
                <button
                  onClick={() =>
                    setCategoriasSeleccionadas(data.map((cat) => cat.categoria))
                  }
                  className="text-sm px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800"
                >
                  Seleccionar todas
                </button>
                <button
                  onClick={() => setPopoverVisible(false)}
                  className="text-sm px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Aplicar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
