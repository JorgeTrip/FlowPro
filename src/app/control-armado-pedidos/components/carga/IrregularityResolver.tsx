// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import React, { useState } from 'react';
import { FilaArmado, AccionIrregularidad } from '../../types/armado';
import { AlertTriangle, UserCheck, UserPlus, EyeOff } from 'lucide-react';

interface IrregularityResolverProps {
  fila: FilaArmado;
  empleadoHeader: string;
  onResolver: (accion: AccionIrregularidad, nuevoEmp?: string) => void;
}

export function IrregularityResolver({ fila, empleadoHeader, onResolver }: IrregularityResolverProps) {
  const [nuevoNombre, setNuevoNombre] = useState(fila.nuevoEmpleado || '');

  const handleAplicarNuevo = (e?: React.SyntheticEvent) => {
    if (e && 'blur' in e.target && typeof (e.target as any).blur === 'function') {
      (e.target as any).blur();
    }
    if (nuevoNombre.trim()) {
      onResolver('asignar_nuevo', nuevoNombre.trim().toUpperCase());
    }
  };

  return (
    <div className="rounded-r-lg border border-amber-300 bg-amber-50/90 p-3 text-xs shadow-sm dark:border-amber-800/60 dark:bg-amber-950/40">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200/80 pb-2 dark:border-amber-900/50">
        <div className="flex items-center space-x-2 text-amber-900 dark:text-amber-200">
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <span className="font-bold">Aclaración Manuscrita:</span>
          <span className="rounded bg-amber-200/80 px-2 py-0.5 font-semibold italic text-amber-900 dark:bg-amber-900/80 dark:text-amber-100">
            &quot;{fila.notaIrregularidad || 'Nota en fila'}&quot;
          </span>
        </div>
        <span className="text-[10px] font-medium text-amber-700 dark:text-amber-400">
          Fila: {fila.fecha} ({fila.horaInicio} - {fila.horaFin})
        </span>
      </div>

      <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
        <button
          type="button"
          onClick={() => onResolver('asignar_cabecera')}
          className={`flex items-center justify-center space-x-1.5 rounded-md px-2.5 py-1.5 font-medium transition-all ${
            !fila.accionIrregularidad || fila.accionIrregularidad === 'asignar_cabecera'
              ? 'bg-amber-600 text-white shadow-sm font-semibold'
              : 'bg-white text-amber-900 border border-amber-300 hover:bg-amber-100 dark:bg-gray-800 dark:text-amber-200 dark:border-amber-800'
          }`}
        >
          <UserCheck className="h-3.5 w-3.5" />
          <span>Asignar a {empleadoHeader || 'Empleado de Cabecera'}</span>
        </button>

        <div className="flex space-x-1">
          <input
            type="text"
            list="lista-empleados-sugeridos"
            placeholder="Nombre nuevo emp..."
            value={nuevoNombre}
            onChange={(e) => setNuevoNombre(e.target.value.toUpperCase())}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAplicarNuevo(e);
              }
            }}
            className="w-full rounded-md border border-amber-300 bg-white px-2 py-1 text-xs text-gray-900 focus:outline-none uppercase dark:border-amber-700 dark:bg-gray-800 dark:text-white"
          />
          <button
            type="button"
            onClick={handleAplicarNuevo}
            className="rounded-md bg-amber-600 px-2.5 py-1 text-white hover:bg-amber-700"
            title="Asignar a nuevo empleado"
          >
            <UserPlus className="h-3.5 w-3.5" />
          </button>
        </div>

        <button
          type="button"
          onClick={() => onResolver('ignorar')}
          className={`flex items-center justify-center space-x-1.5 rounded-md px-2.5 py-1.5 font-medium transition-all ${
            fila.accionIrregularidad === 'ignorar'
              ? 'bg-red-600 text-white shadow-sm'
              : 'bg-white text-red-700 border border-red-200 hover:bg-red-50 dark:bg-gray-800 dark:text-red-300'
          }`}
        >
          <EyeOff className="h-3.5 w-3.5" />
          <span>Ignorar Fila</span>
        </button>
      </div>
    </div>
  );
}
