// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import React from 'react';
import { RegistroArmadoDocumento, FilaArmado } from '../../types/armado';
import { IrregularityResolver } from './IrregularityResolver';
import { useEmpleadosSugeridos } from '../../hooks/useEmpleadosSugeridos';
import { AlertCircle, AlertTriangle, Trash2 } from 'lucide-react';

interface TablaVerificacionFilasProps {
  actual: RegistroArmadoDocumento;
  faltaEmpleado: boolean;
  actualizarCabeceraActual: (empleado: string, fecha: string) => void;
  actualizarFilaActual: (filaId: string, updates: Partial<FilaArmado>) => void;
  removerFilaActual: (filaId: string) => void;
}

export function TablaVerificacionFilas({
  actual,
  faltaEmpleado,
  actualizarCabeceraActual,
  actualizarFilaActual,
  removerFilaActual,
}: TablaVerificacionFilasProps) {
  const sugerenciasEmpleados = useEmpleadosSugeridos();

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

      <div className="flex-1 overflow-y-auto max-h-[420px] rounded-lg border border-gray-200 dark:border-gray-800">
        <table className="w-full text-left text-xs text-gray-700 dark:text-gray-300">
          <thead className="sticky top-0 z-10 border-b bg-gray-100 text-[11px] uppercase tracking-wider text-gray-600 dark:bg-gray-800 dark:text-gray-400">
            <tr>
              <th className="px-2 py-2 w-9 text-center">N°</th>
              <th className="px-2 py-2">Fecha</th>
              <th className="px-2 py-2">Inicio</th>
              <th className="px-2 py-2">Fin</th>
              <th className="px-2 py-2">Artículos</th>
              <th className="px-2 py-2">Asignado</th>
              <th className="px-2 py-2 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-[#1C1C1E]">
            {actual.filas.map((fila, index) => {
              const numLinea = index + 1;
              const esIgnorada = fila.accionIrregularidad === 'ignorar';
              const esIrregular = fila.esIrregular;
              const faltaHoraInicio = !fila.horaInicio || fila.horaInicio.trim() === '';
              const faltaHoraFin = !fila.horaFin || fila.horaFin.trim() === '';

              return (
                <React.Fragment key={fila.id}>
                  <tr
                    className={`transition-colors ${
                      esIgnorada
                        ? 'opacity-40 line-through bg-gray-100 dark:bg-gray-900'
                        : esIrregular
                        ? 'border-l-4 border-l-amber-500 bg-amber-500/10 dark:bg-amber-950/20'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800/40'
                    }`}
                  >
                    <td className="px-1.5 py-2 text-center font-mono">
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                        {numLinea}
                      </span>
                    </td>
                    <td className="px-2 py-2">
                      <input
                        type="date"
                        value={fila.fecha || new Date().toISOString().split('T')[0]}
                        onChange={(e) => actualizarFilaActual(fila.id, { fecha: e.target.value })}
                        className="w-28 rounded border border-gray-300 bg-gray-50 px-1.5 py-1 text-[11px] dark:border-gray-700 dark:bg-gray-800"
                      />
                    </td>
                    <td className="px-2 py-2">
                      <input
                        type="time"
                        value={fila.horaInicio}
                        onChange={(e) =>
                          actualizarFilaActual(fila.id, { horaInicio: e.target.value })
                        }
                        className={`rounded border px-1.5 py-1 text-[11px] transition-colors ${
                          faltaHoraInicio
                            ? 'border-2 border-amber-500 bg-amber-100 text-amber-900 font-bold dark:bg-amber-950/60 dark:text-amber-200'
                            : 'border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-800'
                        }`}
                      />
                    </td>
                    <td className="px-2 py-2">
                      <input
                        type="time"
                        value={fila.horaFin}
                        onChange={(e) => actualizarFilaActual(fila.id, { horaFin: e.target.value })}
                        className={`rounded border px-1.5 py-1 text-[11px] transition-colors ${
                          faltaHoraFin
                            ? 'border-2 border-amber-500 bg-amber-100 text-amber-900 font-bold dark:bg-amber-950/60 dark:text-amber-200'
                            : 'border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-800'
                        }`}
                      />
                    </td>
                    <td className="px-2 py-2">
                      <input
                        type="number"
                        value={fila.cantArticulos}
                        onChange={(e) =>
                          actualizarFilaActual(fila.id, { cantArticulos: Number(e.target.value) })
                        }
                        className="w-16 rounded border border-gray-300 bg-gray-50 px-1.5 py-1 text-[11px] dark:border-gray-700 dark:bg-gray-800"
                      />
                    </td>
                    <td className="px-2 py-2 font-medium">
                      <div className="flex items-center space-x-1">
                        <span>
                          {fila.nuevoEmpleado || fila.empleadoAsignado || actual.empleadoHeader}
                        </span>
                        {esIrregular && (
                          <span className="flex items-center space-x-0.5 rounded bg-amber-200 px-1 py-0.5 text-[9px] font-bold text-amber-900 dark:bg-amber-900/80 dark:text-amber-200">
                            <AlertTriangle className="h-3 w-3" />
                            <span>Nota</span>
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-2 py-2 text-right">
                      <button
                        onClick={() => removerFilaActual(fila.id)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded dark:hover:bg-red-950/40"
                        title="Eliminar fila"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>

                  {esIrregular && (
                    <tr className="border-l-4 border-l-amber-500 bg-amber-500/10 dark:bg-amber-950/20">
                      <td colSpan={7} className="px-3 pb-3 pt-0">
                        <IrregularityResolver
                          fila={fila}
                          empleadoHeader={actual.empleadoHeader}
                          onResolver={(accion, nuevoEmp) =>
                            actualizarFilaActual(fila.id, {
                              accionIrregularidad: accion,
                              nuevoEmpleado: nuevoEmp,
                              empleadoAsignado:
                                accion === 'asignar_nuevo' ? nuevoEmp : actual.empleadoHeader,
                            })
                          }
                        />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
