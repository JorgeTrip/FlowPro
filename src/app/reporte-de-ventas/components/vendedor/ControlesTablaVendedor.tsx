'use client';

import React from 'react';
import { ClipboardDocumentIcon, ClipboardDocumentCheckIcon } from '@heroicons/react/24/outline';
import { MultiSelectDropdown } from '../shared/ControlPanel';

interface ControlesTablaVendedorProps {
  vendedorDebugLog?: string[];
  copied: boolean;
  onCopyLog: () => void;
  meses: string[];
  mesesSeleccionados: string[];
  setMesesSeleccionados: (m: string[]) => void;
  mesesConDatos: string[];
  todosLosVendedores: string[];
  vendedoresSeleccionados: string[];
  setVendedoresSeleccionados: (v: string[]) => void;
  ordenAscendente: boolean;
  setOrdenAscendente: (v: boolean) => void;
  mostrarCantidad: boolean;
  setMostrarCantidad: (v: boolean) => void;
  mostrarTotales: boolean;
  setMostrarTotales: (v: boolean) => void;
  mostrarVariacion: boolean;
  setMostrarVariacion: (v: boolean) => void;
  modoVista: 'acumulado' | 'comparativo';
  setModoVista: (v: 'acumulado' | 'comparativo') => void;
  onExportar: () => void;
}

export const ControlesTablaVendedor: React.FC<ControlesTablaVendedorProps> = ({
  vendedorDebugLog,
  copied,
  onCopyLog,
  meses,
  mesesSeleccionados,
  setMesesSeleccionados,
  mesesConDatos,
  todosLosVendedores,
  vendedoresSeleccionados,
  setVendedoresSeleccionados,
  ordenAscendente,
  setOrdenAscendente,
  mostrarCantidad,
  setMostrarCantidad,
  mostrarTotales,
  setMostrarTotales,
  mostrarVariacion,
  setMostrarVariacion,
  modoVista,
  setModoVista,
  onExportar,
}) => {
  return (
    <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          Ventas por Vendedor
        </h4>

        <div className="flex flex-wrap items-center gap-3">
          {vendedorDebugLog && vendedorDebugLog.length > 0 && (
            <button
              onClick={onCopyLog}
              className="inline-flex items-center px-2 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 dark:bg-gray-600 dark:text-gray-400 dark:border-gray-500 dark:hover:bg-gray-500 transition-colors cursor-pointer"
              title="Copiar log de cruce de vendedores al portapapeles"
            >
              {copied ? (
                <>
                  <ClipboardDocumentCheckIcon className="w-3.5 h-3.5 mr-1 text-green-500" /> Copiado
                </>
              ) : (
                <>
                  <ClipboardDocumentIcon className="w-3.5 h-3.5 mr-1" /> Log debug
                </>
              )}
            </button>
          )}

          <MultiSelectDropdown
            label="Meses"
            options={meses}
            selected={mesesSeleccionados}
            onChange={setMesesSeleccionados}
            optionsWithData={mesesConDatos}
          />

          <MultiSelectDropdown
            label="Vendedores"
            options={todosLosVendedores}
            selected={vendedoresSeleccionados}
            onChange={setVendedoresSeleccionados}
          />

          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={ordenAscendente}
              onChange={(e) => setOrdenAscendente(e.target.checked)}
              className="sr-only peer"
            />
            <div className="border border-gray-300 dark:border-gray-500 relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[1px] after:left-[1px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
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
            <div className="border border-gray-300 dark:border-gray-500 relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[1px] after:left-[1px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
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
            <div className="border border-gray-300 dark:border-gray-500 relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[1px] after:left-[1px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">Totales</span>
          </label>

          {modoVista === 'comparativo' && (
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={mostrarVariacion}
                onChange={(e) => setMostrarVariacion(e.target.checked)}
                className="sr-only peer"
              />
              <div className="border border-gray-300 dark:border-gray-500 relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[1px] after:left-[1px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                Variación %
              </span>
            </label>
          )}

          <select
            value={modoVista}
            onChange={(e) => setModoVista(e.target.value as 'acumulado' | 'comparativo')}
            className="bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2"
          >
            <option value="acumulado">Acumulado</option>
            <option value="comparativo" disabled={mesesSeleccionados.length < 2}>
              Comparativo
            </option>
          </select>

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
