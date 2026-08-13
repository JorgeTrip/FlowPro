// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import React from 'react';
import { FiltrosAnalisis, RegistroArmadoDocumento } from '../../types/armado';
import { normalizarFechaYYYYMMDD } from '../../services/firestoreService';
import { Filter, User, Calendar, Info } from 'lucide-react';

interface DashboardFiltersProps {
  filtros: FiltrosAnalisis;
  empleadosDisponibles: string[];
  registrosCompletos?: RegistroArmadoDocumento[];
  onCambiarFiltros: (nuevos: FiltrosAnalisis) => void;
}

export function getFechaLocalYYYYMMDD(d: Date = new Date()): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function obtenerRangoFechasInteligente(
  rango: 'todos' | 'dia' | 'semana' | 'mes' | 'personalizado',
  registros: RegistroArmadoDocumento[] = [],
  inicioActual?: string,
  finActual?: string
) {
  const todasLasFechas: string[] = [];
  registros.forEach((r) => {
    if (r.fechaPrimeraFila) todasLasFechas.push(normalizarFechaYYYYMMDD(r.fechaPrimeraFila));
    if (r.verificadoEn) todasLasFechas.push(normalizarFechaYYYYMMDD(r.verificadoEn));
    r.filas?.forEach((f) => {
      if (f.fecha) todasLasFechas.push(normalizarFechaYYYYMMDD(f.fecha));
    });
  });

  const fechasValidas = Array.from(new Set(todasLasFechas.filter((f) => /^\d{4}-\d{2}-\d{2}$/.test(f)))).sort();

  if (rango === 'todos') {
    if (fechasValidas.length > 0) {
      return {
        fechaInicio: fechasValidas[0],
        fechaFin: fechasValidas[fechasValidas.length - 1],
      };
    }
    return { fechaInicio: undefined, fechaFin: undefined };
  }

  // Tomar el último día registrado con datos en la BD como punto final de referencia
  let fechaRefStr = getFechaLocalYYYYMMDD(new Date());

  if (fechasValidas.length > 0) {
    fechaRefStr = fechasValidas[fechasValidas.length - 1];
  }

  const [y, m, d] = fechaRefStr.split('-').map(Number);
  const fechaRefObj = new Date(y, m - 1, d);
  const format = (dt: Date) => getFechaLocalYYYYMMDD(dt);

  if (rango === 'dia') {
    return { fechaInicio: fechaRefStr, fechaFin: fechaRefStr };
  }

  if (rango === 'semana') {
    const hace7 = new Date(fechaRefObj);
    hace7.setDate(fechaRefObj.getDate() - 6);
    return { fechaInicio: format(hace7), fechaFin: fechaRefStr };
  }

  if (rango === 'mes') {
    const hace30 = new Date(fechaRefObj);
    hace30.setDate(fechaRefObj.getDate() - 29);
    return { fechaInicio: format(hace30), fechaFin: fechaRefStr };
  }

  return { fechaInicio: inicioActual || format(fechaRefObj), fechaFin: finActual || format(fechaRefObj) };
}

export function DashboardFilters({
  filtros,
  empleadosDisponibles,
  registrosCompletos = [],
  onCambiarFiltros,
}: DashboardFiltersProps) {
  const handleSeleccionarRango = (r: 'todos' | 'dia' | 'semana' | 'mes' | 'personalizado') => {
    const { fechaInicio, fechaFin } = obtenerRangoFechasInteligente(r, registrosCompletos, filtros.fechaInicio, filtros.fechaFin);
    onCambiarFiltros({
      ...filtros,
      rango: r,
      fechaInicio: r === 'personalizado' ? (filtros.fechaInicio || fechaInicio) : fechaInicio,
      fechaFin: r === 'personalizado' ? (filtros.fechaFin || fechaFin) : fechaFin,
    });
  };

  const getTextoBadge = () => {
    const hoyStr = getFechaLocalYYYYMMDD(new Date());
    const fInicio = filtros.fechaInicio;
    const fFin = filtros.fechaFin;

    if (filtros.rango === 'todos') {
      if (fInicio && fFin) {
        return fInicio === fFin ? `Todos los registros (${fInicio})` : `Todos los registros: del ${fInicio} al ${fFin}`;
      }
      return 'Todos los registros históricos';
    }

    if (filtros.rango === 'dia') {
      if (!fFin) return 'Día sin datos';
      return fFin === hoyStr ? `Día de hoy: ${fFin}` : `Último día registrado: ${fFin}`;
    }

    if (filtros.rango === 'semana') {
      if (!fFin) return 'Semana sin datos';
      return `Última semana registrada: del ${fInicio || '...'} al ${fFin}`;
    }

    if (filtros.rango === 'mes') {
      if (!fFin) return 'Mes sin datos';
      return `Último mes registrado: del ${fInicio || '...'} al ${fFin}`;
    }

    if (filtros.rango === 'personalizado') {
      return `Rango personalizado: del ${fInicio || '...'} al ${fFin || '...'}`;
    }

    return 'Filtro activo';
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-[#1C1C1E]">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center space-x-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
          <Filter className="h-4 w-4" />
          <span>Filtros:</span>
        </div>

        <div className="flex rounded-lg border border-gray-200 bg-gray-50 p-1 dark:border-gray-700 dark:bg-gray-800">
          {(['todos', 'dia', 'semana', 'mes', 'personalizado'] as const).map((r) => (
            <button
              key={r}
              onClick={() => handleSeleccionarRango(r)}
              className={`rounded-md px-3 py-1 text-xs font-medium capitalize transition-all ${
                filtros.rango === r
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
              }`}
            >
              {r === 'todos' ? 'Todos' : r}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-1.5 rounded-lg bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
          <Info className="h-3.5 w-3.5 shrink-0" />
          <span>{getTextoBadge()}</span>
        </div>

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
                className="rounded-lg border border-gray-300 bg-gray-50 px-2 py-1 text-xs dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-gray-500 dark:text-gray-400 font-medium">Hasta:</span>
              <input
                type="date"
                suppressHydrationWarning
                value={filtros.fechaFin || ''}
                onChange={(e) => e.target.value && onCambiarFiltros({ ...filtros, fechaFin: e.target.value })}
                className="rounded-lg border border-gray-300 bg-gray-50 px-2 py-1 text-xs dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <User className="h-4 w-4 text-gray-400" />
        <select
          value={filtros.empleado || ''}
          onChange={(e) => onCambiarFiltros({ ...filtros, empleado: e.target.value || undefined })}
          className="rounded-lg border border-gray-300 bg-gray-50 px-3 py-1.5 text-xs text-gray-900 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white cursor-pointer"
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
  );
}
