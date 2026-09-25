'use client';

import React from 'react';

interface ControlesTablaMensualProps {
  filtroMeses: 'todos' | 'conDatos' | 'seleccionados';
  setFiltroMeses: (v: 'todos' | 'conDatos' | 'seleccionados') => void;
  mesesSeleccionados: string[];
  setMesesSeleccionados: (v: string[]) => void;
  mesesConDatos: string[];
  mostrarCantidad: boolean;
  setMostrarCantidad: (v: boolean) => void;
  mostrarTotales: boolean;
  setMostrarTotales: (v: boolean) => void;
  mostrarVariacion: boolean;
  setMostrarVariacion: (v: boolean) => void;
  onExportar: () => void;
}

export const ControlesTablaMensual: React.FC<ControlesTablaMensualProps> = ({
  filtroMeses,
  setFiltroMeses,
  mesesSeleccionados,
  setMesesSeleccionados,
  mesesConDatos,
  mostrarCantidad,
  setMostrarCantidad,
  mostrarTotales,
  setMostrarTotales,
  mostrarVariacion,
  setMostrarVariacion,
  onExportar,
}) => {
  return (
    <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          Ventas Mensuales
        </h4>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={filtroMeses}
            onChange={(e) =>
              setFiltroMeses(e.target.value as 'todos' | 'conDatos' | 'seleccionados')
            }
            className="bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-40 p-2"
          >
            <option value="todos">Todos los meses</option>
            <option value="conDatos">Solo con datos</option>
            <option value="seleccionados">Seleccionados</option>
          </select>

          {filtroMeses === 'seleccionados' && (
            <div className="relative">
              <select
                multiple
                value={mesesSeleccionados}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions, (option) => option.value);
                  setMesesSeleccionados(selected);
                }}
                className="bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-48 p-2"
                size={4}
              >
                {mesesConDatos.map((mes) => (
                  <option key={mes} value={mes}>
                    {mes}
                  </option>
                ))}
              </select>
            </div>
          )}

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
              checked={mostrarTotales}
              onChange={(e) => setMostrarTotales(e.target.checked)}
              className="sr-only peer"
            />
            <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
              Totales
            </span>
          </label>

          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={mostrarVariacion}
              onChange={(e) => setMostrarVariacion(e.target.checked)}
              className="sr-only peer"
            />
            <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
              Variación %
            </span>
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
