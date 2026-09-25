'use client';

import React from 'react';
import { MultiSelectDropdown } from '../shared/ControlPanel';

interface ControlesTablaZonaProps {
  modoVista: 'acumulado' | 'comparativo';
  setModoVista: (v: 'acumulado' | 'comparativo') => void;
  meses: string[];
  mesesSeleccionados: string[];
  setMesesSeleccionados: (m: string[]) => void;
  mesesConDatos: string[];
  zonasSeleccionadas: string[];
  handleZonaToggle: (z: string) => void;
  seleccionarTodasZonas: () => void;
  limpiarZonas: () => void;
  todasLasZonas: string[];
  ordenAscendente: boolean;
  setOrdenAscendente: (v: boolean) => void;
  mostrarCantidad: boolean;
  setMostrarCantidad: (v: boolean) => void;
  mostrarTotales: boolean;
  setMostrarTotales: (v: boolean) => void;
  mostrarVariacion: boolean;
  setMostrarVariacion: (v: boolean) => void;
  onExportar: () => void;
}

export const ControlesTablaZona: React.FC<ControlesTablaZonaProps> = ({
  modoVista,
  setModoVista,
  meses,
  mesesSeleccionados,
  setMesesSeleccionados,
  mesesConDatos,
  zonasSeleccionadas,
  handleZonaToggle,
  seleccionarTodasZonas,
  limpiarZonas,
  todasLasZonas,
  ordenAscendente,
  setOrdenAscendente,
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
          Ventas por Zona
        </h4>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={modoVista}
            onChange={(e) => setModoVista(e.target.value as 'acumulado' | 'comparativo')}
            className="bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2"
          >
            <option value="acumulado">Acumulado</option>
            <option value="comparativo">Comparativo Mes a Mes</option>
          </select>

          <MultiSelectDropdown
            label="Meses"
            options={meses}
            selected={mesesSeleccionados}
            onChange={setMesesSeleccionados}
            optionsWithData={mesesConDatos}
          />

          <div className="relative">
            <button
              className="bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-32 p-2 text-left truncate cursor-pointer"
              onClick={() => {
                const popup = document.getElementById('zonas-popup');
                popup?.classList.toggle('hidden');
              }}
            >
              Zonas ({zonasSeleccionadas.length})
            </button>

            <div
              id="zonas-popup"
              className="hidden absolute top-full left-0 mt-1 w-64 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto"
            >
              <div className="p-3">
                <div className="flex gap-2 mb-3">
                  <button
                    onClick={seleccionarTodasZonas}
                    className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 cursor-pointer"
                  >
                    Todos
                  </button>
                  <button
                    onClick={limpiarZonas}
                    className="text-xs bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600 cursor-pointer"
                  >
                    Limpiar
                  </button>
                </div>

                {todasLasZonas.map((zona) => (
                  <label key={zona} className="flex items-center mb-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={zonasSeleccionadas.includes(zona)}
                      onChange={() => handleZonaToggle(zona)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-900 dark:text-white">{zona}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <label className="flex items-center cursor-pointer" title="Orden Ascendente/Descendente">
            <input
              type="checkbox"
              checked={ordenAscendente}
              onChange={(e) => setOrdenAscendente(e.target.checked)}
              className="sr-only peer"
            />
            <div className="relative w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            <span className="ml-2 text-xs font-medium text-gray-900 dark:text-gray-300">
              {ordenAscendente ? 'Asc' : 'Desc'}
            </span>
          </label>

          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={mostrarCantidad}
              onChange={(e) => setMostrarCantidad(e.target.checked)}
              className="sr-only peer"
            />
            <div className="relative w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            <span className="ml-2 text-xs font-medium text-gray-900 dark:text-gray-300">
              {mostrarCantidad ? 'Cant' : 'Imp'}
            </span>
          </label>

          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={mostrarTotales}
              onChange={(e) => setMostrarTotales(e.target.checked)}
              className="sr-only peer"
            />
            <div className="relative w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            <span className="ml-2 text-xs font-medium text-gray-900 dark:text-gray-300">
              Totales
            </span>
          </label>

          {modoVista === 'comparativo' && (
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={mostrarVariacion}
                onChange={(e) => setMostrarVariacion(e.target.checked)}
                className="sr-only peer"
              />
              <div className="relative w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              <span className="ml-2 text-xs font-medium text-gray-900 dark:text-gray-300">
                Var %
              </span>
            </label>
          )}

          <button
            onClick={onExportar}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium py-2 px-3 rounded-lg transition-colors cursor-pointer"
          >
            Exportar
          </button>
        </div>
      </div>
    </div>
  );
};
