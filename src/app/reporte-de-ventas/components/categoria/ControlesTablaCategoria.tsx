'use client';

import React from 'react';

interface ControlesTablaCategoriaProps {
  filtroMeses: 'todos' | 'conDatos' | 'individual';
  setFiltroMeses: (v: 'todos' | 'conDatos' | 'individual') => void;
  topN: number;
  setTopN: (v: number) => void;
  categoriasSeleccionadas: string[];
  handleCategoriaToggle: (cat: string) => void;
  seleccionarTodasCategorias: () => void;
  limpiarCategorias: () => void;
  todasLasCategorias: string[];
  ordenAscendente: boolean;
  setOrdenAscendente: (v: boolean) => void;
  mostrarCantidad: boolean;
  setMostrarCantidad: (v: boolean) => void;
  mostrarPorcentajes: boolean;
  setMostrarPorcentajes: (v: boolean) => void;
  onExportar: () => void;
}

export const ControlesTablaCategoria: React.FC<ControlesTablaCategoriaProps> = ({
  filtroMeses,
  setFiltroMeses,
  topN,
  setTopN,
  categoriasSeleccionadas,
  handleCategoriaToggle,
  seleccionarTodasCategorias,
  limpiarCategorias,
  todasLasCategorias,
  ordenAscendente,
  setOrdenAscendente,
  mostrarCantidad,
  setMostrarCantidad,
  mostrarPorcentajes,
  setMostrarPorcentajes,
  onExportar,
}) => {
  return (
    <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          Top Productos por Categoría
        </h4>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={filtroMeses}
            onChange={(e) =>
              setFiltroMeses(e.target.value as 'todos' | 'conDatos' | 'individual')
            }
            className="bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-36 p-2"
          >
            <option value="todos">Todos</option>
            <option value="conDatos">Con datos</option>
            <option value="individual">Individual</option>
          </select>

          <select
            value={topN}
            onChange={(e) => setTopN(Number(e.target.value))}
            className="bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-24 p-2"
          >
            {[1, 2, 3, 4, 5, 10, 20].map((n) => (
              <option key={n} value={n}>
                Top {n}
              </option>
            ))}
          </select>

          <div className="relative">
            <button
              className="bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-32 p-2 text-left cursor-pointer"
              onClick={() => {
                const popup = document.getElementById('categorias-popup');
                popup?.classList.toggle('hidden');
              }}
            >
              Categorías ({categoriasSeleccionadas.length})
            </button>

            <div
              id="categorias-popup"
              className="hidden absolute top-full left-0 mt-1 w-64 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto"
            >
              <div className="p-3">
                <div className="flex gap-2 mb-3">
                  <button
                    onClick={seleccionarTodasCategorias}
                    className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 cursor-pointer"
                  >
                    Todas
                  </button>
                  <button
                    onClick={limpiarCategorias}
                    className="text-xs bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600 cursor-pointer"
                  >
                    Limpiar
                  </button>
                </div>

                {todasLasCategorias.map((categoria) => (
                  <label key={categoria} className="flex items-center mb-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={categoriasSeleccionadas.includes(categoria)}
                      onChange={() => handleCategoriaToggle(categoria)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-900 dark:text-white">{categoria}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={ordenAscendente}
              onChange={(e) => setOrdenAscendente(e.target.checked)}
              className="sr-only peer"
            />
            <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
              {ordenAscendente ? '↑ Asc' : '↓ Desc'}
            </span>
          </label>

          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={mostrarCantidad}
              onChange={(e) => setMostrarCantidad(e.target.checked)}
              className="sr-only peer"
            />
            <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
              {mostrarCantidad ? 'Cantidad' : 'Importe'}
            </span>
          </label>

          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={mostrarPorcentajes}
              onChange={(e) => setMostrarPorcentajes(e.target.checked)}
              className="sr-only peer"
            />
            <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">%</span>
          </label>

          <button
            onClick={onExportar}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors cursor-pointer"
          >
            📊 Exportar
          </button>
        </div>
      </div>
    </div>
  );
};
