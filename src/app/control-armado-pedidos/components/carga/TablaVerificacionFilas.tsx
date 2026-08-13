// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import React from 'react';
import { RegistroArmadoDocumento, FilaArmado } from '../../types/armado';
import { useEmpleadosSugeridos } from '../../hooks/useEmpleadosSugeridos';
import { AlertCircle, Plus } from 'lucide-react';
import { FilaTablaVerificacion } from './FilaTablaVerificacion';

interface TablaVerificacionFilasProps {
  actual: RegistroArmadoDocumento;
  faltaEmpleado: boolean;
  actualizarCabeceraActual: (empleado: string, fecha: string) => void;
  actualizarFilaActual: (filaId: string, updates: Partial<FilaArmado>) => void;
  removerFilaActual: (filaId: string) => void;
  agregarFilaAItemActual: (nuevaFila?: Partial<FilaArmado>) => void;
}

export function TablaVerificacionFilas({
  actual,
  faltaEmpleado,
  actualizarCabeceraActual,
  actualizarFilaActual,
  removerFilaActual,
  agregarFilaAItemActual,
}: TablaVerificacionFilasProps) {
  const sugerenciasEmpleados = useEmpleadosSugeridos();
  const handleEnterBlur = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') e.currentTarget.blur();
  };

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <datalist id="lista-empleados-sugeridos">
        {sugerenciasEmpleados.map((emp) => (
          <option key={emp} value={emp} />
        ))}
      </datalist>

      <div className="mb-4">
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
          Empleado Cabecera de la Planilla
        </label>
        <input
          type="text"
          list="lista-empleados-sugeridos"
          value={actual.empleadoHeader}
          onFocus={() => {
            if (actual.empleadoHeader === 'Empleado Desconocido') {
              actualizarCabeceraActual('', actual.fechaPlanilla || '');
            }
          }}
          onChange={(e) =>
            actualizarCabeceraActual(e.target.value.toUpperCase(), actual.fechaPlanilla || '')
          }
          onKeyDown={handleEnterBlur}
          placeholder="Ingrese o seleccione empleado en MAYÚSCULAS..."
          className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none transition-all uppercase ${
            faltaEmpleado
              ? 'border-2 border-red-500 bg-red-50/70 text-red-900 ring-2 ring-red-400/50 dark:bg-red-950/40 dark:text-red-200'
              : 'border-gray-300 bg-gray-50 text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white'
          }`}
        />
        {faltaEmpleado && (
          <p className="mt-1 flex items-center space-x-1 text-[11px] font-semibold text-red-600 dark:text-red-400">
            <AlertCircle className="h-3.5 w-3.5" />
            <span>Atención: Ingrese el nombre del empleado de la cabecera</span>
          </p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-auto lg:overflow-x-hidden max-h-[400px] rounded-lg border border-gray-200 dark:border-gray-800">
        <table className="w-full text-left text-xs text-gray-700 dark:text-gray-300">
          <thead className="sticky top-0 z-10 border-b bg-gray-100 text-[11px] uppercase tracking-wider text-gray-600 dark:bg-gray-800 dark:text-gray-400">
            <tr>
              <th className="px-1.5 py-2 w-8 text-center">N°</th>
              <th className="px-1.5 py-2">Fecha</th>
              <th className="px-1.5 py-2">Inicio</th>
              <th className="px-1.5 py-2">Fin</th>
              <th className="px-1.5 py-2">Artículos</th>
              <th className="px-1.5 py-2">Asignado</th>
              <th className="px-1.5 py-2 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-[#1C1C1E]">
            {actual.filas.map((fila, index) => (
              <FilaTablaVerificacion
                key={fila.id}
                fila={fila}
                index={index}
                actual={actual}
                actualizarFilaActual={actualizarFilaActual}
                removerFilaActual={removerFilaActual}
                handleEnterBlur={handleEnterBlur}
              />
            ))}
          </tbody>
        </table>
      </div>

      <button
        type="button"
        onClick={() => agregarFilaAItemActual()}
        className="mt-2.5 flex items-center justify-center space-x-1.5 rounded-lg border border-dashed border-blue-400 bg-blue-50/60 py-2 px-3 text-xs font-semibold text-blue-700 hover:bg-blue-100 dark:border-blue-700 dark:bg-blue-950/30 dark:text-blue-300 dark:hover:bg-blue-900/50 transition-all w-full shadow-sm"
      >
        <Plus className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <span>Agregar Fila Manualmente</span>
      </button>
    </div>
  );
}
