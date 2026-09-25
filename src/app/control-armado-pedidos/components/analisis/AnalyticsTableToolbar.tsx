// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import React from 'react';
import { Search, Filter, ArrowUpDown } from 'lucide-react';

export type CriterioOrdenTabla = 'velocidad' | 'pedidos' | 'articulos' | 'irregularidades';

interface AnalyticsTableToolbarProps {
  busqueda: string;
  onCambiarBusqueda: (valor: string) => void;
  filtroArmador: string;
  onCambiarFiltroArmador: (valor: string) => void;
  armadoresDisponibles: string[];
  criterioOrden: CriterioOrdenTabla;
  onCambiarCriterioOrden: (valor: CriterioOrdenTabla) => void;
}

export function AnalyticsTableToolbar({
  busqueda,
  onCambiarBusqueda,
  filtroArmador,
  onCambiarFiltroArmador,
  armadoresDisponibles,
  criterioOrden,
  onCambiarCriterioOrden,
}: AnalyticsTableToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 bg-gray-50/80 p-3 dark:border-gray-800 dark:bg-gray-900/50 text-xs">
      <div className="flex flex-wrap items-center gap-2 flex-1">
        {/* Buscador de Armador */}
        <div className="relative min-w-[200px] flex-1 sm:flex-none">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar armador..."
            value={busqueda}
            onChange={(e) => onCambiarBusqueda(e.target.value.toUpperCase())}
            className="w-full rounded-lg border border-gray-300 bg-white pl-8 pr-3 py-1.5 text-xs text-gray-900 focus:outline-none uppercase dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
        </div>

        {/* Selector de Armador */}
        <div className="flex items-center space-x-1">
          <Filter className="h-3.5 w-3.5 text-gray-400" />
          <select
            value={filtroArmador}
            onChange={(e) => onCambiarFiltroArmador(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs text-gray-900 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white cursor-pointer"
          >
            <option value="">Todos los armadores</option>
            {armadoresDisponibles.map((emp) => (
              <option key={emp} value={emp}>
                {emp}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Criterio de Ordenamiento */}
      <div className="flex items-center space-x-2">
        <ArrowUpDown className="h-3.5 w-3.5 text-gray-400" />
        <span className="text-gray-500 dark:text-gray-400 font-medium">Ordenar por:</span>
        <select
          value={criterioOrden}
          onChange={(e) => onCambiarCriterioOrden(e.target.value as CriterioOrdenTabla)}
          className="rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-blue-600 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-blue-400 cursor-pointer"
        >
          <option value="velocidad">Mayor Velocidad (Art/hs)</option>
          <option value="pedidos">Más Pedidos Armados</option>
          <option value="articulos">Más Artículos Procesados</option>
          <option value="irregularidades">Más Irregularidades</option>
        </select>
      </div>
    </div>
  );
}
