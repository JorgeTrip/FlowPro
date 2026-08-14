// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import React from 'react';
import { FiltrosAnalisis, RegistroArmadoDocumento } from '../../types/armado';
import { User, Calendar, Info, Clock } from 'lucide-react';

interface DashboardFiltersProps {
  filtros: FiltrosAnalisis;
  empleadosDisponibles: string[];
  registrosCompletos?: RegistroArmadoDocumento[];
  onCambiarFiltros: (nuevos: FiltrosAnalisis) => void;
}

import { getFechaLocalYYYYMMDD, obtenerRangoFechasInteligente, extraerFechasValidasBD } from './DashboardFiltersUtils';

export function DashboardFilters({ filtros, empleadosDisponibles, registrosCompletos = [], onCambiarFiltros }: DashboardFiltersProps) {
  const handleSeleccionarRango = (r: 'todos' | 'dia' | 'semana' | 'mes' | 'personalizado') => {
    const { fechaInicio, fechaFin } = obtenerRangoFechasInteligente(r, registrosCompletos);
    onCambiarFiltros({ ...filtros, rango: r, fechaInicio, fechaFin });
  };

  const handleCambiarDiaEspecifico = (fecha: string) => {
    if (fecha) onCambiarFiltros({ ...filtros, rango: 'dia', fechaInicio: fecha, fechaFin: fecha });
  };

  const handleCambiarSemanaEspecifica = (fechaFin: string) => {
    if (!fechaFin) return;
    const [y, m, d] = fechaFin.split('-').map(Number);
    const hace6 = new Date(y, m - 1, d);
    hace6.setDate(hace6.getDate() - 6);
    onCambiarFiltros({ ...filtros, rango: 'semana', fechaInicio: getFechaLocalYYYYMMDD(hace6), fechaFin });
  };

  const handleCambiarMesEspecifico = (yyyyMm: string) => {
    if (!yyyyMm || !yyyyMm.includes('-')) return;
    const [y, m] = yyyyMm.split('-').map(Number);
    const ultDia = new Date(y, m, 0).getDate();
    const mmStr = String(m).padStart(2, '0');
    onCambiarFiltros({
      ...filtros,
      rango: 'mes',
      fechaInicio: `${y}-${mmStr}-01`,
      fechaFin: `${y}-${mmStr}-${String(ultDia).padStart(2, '0')}`,
    });
  };

  const formatFechaVisual = (fStr?: string) => {
    if (!fStr || !fStr.includes('-')) return fStr || '';
    const p = fStr.split('-');
    return p.length === 3 && p[0].length === 4 ? `${p[2]}/${p[1]}/${p[0]}` : fStr;
  };

  const getTextoBadgeTodos = () => {
    const fechasValidas = extraerFechasValidasBD(registrosCompletos);
    const fInicio = filtros.fechaInicio || (fechasValidas.length > 0 ? fechasValidas[0] : undefined);
    const fFin = filtros.fechaFin || (fechasValidas.length > 0 ? fechasValidas[fechasValidas.length - 1] : undefined);

    if (fInicio && fFin) {
      const visInicio = formatFechaVisual(fInicio);
      const visFin = formatFechaVisual(fFin);
      return visInicio === visFin
        ? `Mostrando registros del ${visInicio}`
        : `Mostrando registros del ${visInicio} al ${visFin}`;
    }
    return 'Mostrando todos los registros históricos';
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-[#1C1C1E]">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center space-x-2">
          <User className="h-4 w-4 text-gray-400" />
          <select
            value={filtros.empleado || ''}
            onChange={(e) => onCambiarFiltros({ ...filtros, empleado: e.target.value || undefined })}
            className="rounded-lg border border-gray-300 bg-gray-50 px-3 py-1.5 text-xs text-gray-900 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white cursor-pointer font-medium"
          >
            <option value="">Todos los empleados</option>
            {empleadosDisponibles.map((emp) => (
              <option key={emp} value={emp}>
                {emp}
              </option>
            ))}
          </select>
        </div>

        <div className="h-4 w-px bg-gray-200 dark:bg-gray-700 hidden sm:block" />

        <Clock className="h-4 w-4 text-gray-400 shrink-0" />

        <div className="flex rounded-lg border border-gray-200 bg-gray-50 p-1 dark:border-gray-700 dark:bg-gray-800">
          {(['todos', 'dia', 'semana', 'mes', 'personalizado'] as const).map((r) => (
            <button
              key={r}
              onClick={() => handleSeleccionarRango(r)}
              className={`rounded-md px-3 py-1 text-xs font-medium capitalize transition-all ${
                filtros.rango === r ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
              }`}
            >
              {r === 'todos' ? 'Todos' : r}
            </button>
          ))}
        </div>

        {filtros.rango === 'todos' && (
          <div className="flex items-center space-x-1.5 rounded-lg bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
            <Info className="h-3.5 w-3.5 shrink-0" />
            <span>{getTextoBadgeTodos()}</span>
          </div>
        )}

        {filtros.rango === 'dia' && (
          <div className="flex items-center space-x-1.5 text-xs bg-gray-50 dark:bg-gray-800 p-1 rounded-lg border border-gray-200 dark:border-gray-700">
            <Calendar className="h-3.5 w-3.5 text-blue-500 shrink-0" />
            <span className="text-gray-500 dark:text-gray-400 font-medium">Elegir día:</span>
            <input
              type="date"
              suppressHydrationWarning
              value={filtros.fechaFin || ''}
              onChange={(e) => e.target.value && handleCambiarDiaEspecifico(e.target.value)}
              className="rounded-md border border-gray-300 bg-white px-2 py-0.5 text-xs dark:border-gray-700 dark:bg-gray-900 dark:text-white cursor-pointer"
            />
          </div>
        )}

        {filtros.rango === 'semana' && (
          <div className="flex items-center space-x-1.5 text-xs bg-gray-50 dark:bg-gray-800 p-1 rounded-lg border border-gray-200 dark:border-gray-700">
            <Calendar className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
            <span className="text-gray-500 dark:text-gray-400 font-medium">Semana al:</span>
            <input
              type="date"
              suppressHydrationWarning
              value={filtros.fechaFin || ''}
              onChange={(e) => e.target.value && handleCambiarSemanaEspecifica(e.target.value)}
              className="rounded-md border border-gray-300 bg-white px-2 py-0.5 text-xs dark:border-gray-700 dark:bg-gray-900 dark:text-white cursor-pointer"
            />
          </div>
        )}

        {filtros.rango === 'mes' && (
          <div className="flex items-center space-x-1.5 text-xs bg-gray-50 dark:bg-gray-800 p-1 rounded-lg border border-gray-200 dark:border-gray-700">
            <Calendar className="h-3.5 w-3.5 text-purple-500 shrink-0" />
            <span className="text-gray-500 dark:text-gray-400 font-medium">Elegir mes:</span>
            <input
              type="month"
              suppressHydrationWarning
              value={filtros.fechaFin ? filtros.fechaFin.substring(0, 7) : ''}
              onChange={(e) => e.target.value && handleCambiarMesEspecifico(e.target.value)}
              className="rounded-md border border-gray-300 bg-white px-2 py-0.5 text-xs dark:border-gray-700 dark:bg-gray-900 dark:text-white cursor-pointer"
            />
          </div>
        )}

        {filtros.rango === 'personalizado' && (
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="flex items-center space-x-1">
              <Calendar className="h-3.5 w-3.5 text-gray-400" />
              <span className="text-gray-500 dark:text-gray-400 font-medium">Desde:</span>
              <input
                type="date"
                suppressHydrationWarning
                value={filtros.fechaInicio || ''}
                onChange={(e) => e.target.value && onCambiarFiltros({ ...filtros, fechaInicio: e.target.value })}
                className="rounded-lg border border-gray-300 bg-gray-50 px-2 py-1 text-xs dark:border-gray-700 dark:bg-gray-800 dark:text-white cursor-pointer"
              />
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-gray-500 dark:text-gray-400 font-medium">Hasta:</span>
              <input
                type="date"
                suppressHydrationWarning
                value={filtros.fechaFin || ''}
                onChange={(e) => e.target.value && onCambiarFiltros({ ...filtros, fechaFin: e.target.value })}
                className="rounded-lg border border-gray-300 bg-gray-50 px-2 py-1 text-xs dark:border-gray-700 dark:bg-gray-800 dark:text-white cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
