// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import React from 'react';
import { FiltrosAnalisis } from '../../types/armado';
import { Filter, User } from 'lucide-react';

interface DashboardFiltersProps {
  filtros: FiltrosAnalisis;
  empleadosDisponibles: string[];
  onCambiarFiltros: (nuevos: FiltrosAnalisis) => void;
}

export function DashboardFilters({
  filtros,
  empleadosDisponibles,
  onCambiarFiltros,
}: DashboardFiltersProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-[#1C1C1E]">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center space-x-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
          <Filter className="h-4 w-4" />
          <span>Filtros de Análisis:</span>
        </div>

        <div className="flex rounded-lg border border-gray-200 bg-gray-50 p-1 dark:border-gray-700 dark:bg-gray-800">
          {(['dia', 'semana', 'mes', 'personalizado'] as const).map((r) => (
            <button
              key={r}
              onClick={() => onCambiarFiltros({ ...filtros, rango: r })}
              className={`rounded-md px-3 py-1 text-xs font-medium capitalize transition-all ${
                filtros.rango === r
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center space-x-2">
          <User className="h-4 w-4 text-gray-400" />
          <select
            value={filtros.empleado || ''}
            onChange={(e) => onCambiarFiltros({ ...filtros, empleado: e.target.value || undefined })}
            className="rounded-lg border border-gray-300 bg-gray-50 px-3 py-1.5 text-xs text-gray-900 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          >
            <option value="">Todos los empleados</option>
            {empleadosDisponibles.map((emp) => (
              <option key={emp} value={emp}>
                {emp}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
