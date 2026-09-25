// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import React from 'react';
import { RegistroArmadoDocumento, FilaArmado } from '../../types/armado';
import { IrregularityResolver } from './IrregularityResolver';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { normalizarFechaYYYYMMDD } from '../../services/firestoreService';
import { formatearEtiquetaTarea } from '../../utils/detectorTareasAlternativas';

interface FilaTablaVerificacionProps {
  fila: FilaArmado;
  index: number;
  actual: RegistroArmadoDocumento;
  actualizarFilaActual: (filaId: string, updates: Partial<FilaArmado>) => void;
  removerFilaActual: (filaId: string) => void;
  handleEnterBlur: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export function FilaTablaVerificacion({
  fila,
  index,
  actual,
  actualizarFilaActual,
  removerFilaActual,
  handleEnterBlur,
}: FilaTablaVerificacionProps) {
  const numLinea = index + 1;
  const esIgnorada = fila.accionIrregularidad === 'ignorar';
  const esIrregular = fila.esIrregular;
  const faltaInicio = !fila.horaInicio || fila.horaInicio.trim() === '';
  const faltaFin = !fila.horaFin || fila.horaFin.trim() === '';
  const armador = fila.nuevoEmpleado || fila.empleadoAsignado || actual.empleadoHeader;
  const fechaValor = normalizarFechaYYYYMMDD(fila.fecha || actual.fechaPrimeraFila || actual.fechaPlanilla);

  return (
    <React.Fragment>
      <tr
        className={`transition-colors ${
          esIgnorada
            ? 'opacity-40 line-through bg-gray-100 dark:bg-gray-900'
            : esIrregular
            ? 'border-l-4 border-l-amber-500 bg-amber-500/10 dark:bg-amber-950/20'
            : 'hover:bg-gray-50 dark:hover:bg-gray-800/40'
        }`}
      >
        <td className="px-1 py-2 text-center font-mono">
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
            {numLinea}
          </span>
        </td>
        <td className="px-1.5 py-2">
          <input
            type="date"
            value={fechaValor}
            onChange={(e) => {
              if (e.target.value) {
                actualizarFilaActual(fila.id, { fecha: e.target.value });
              }
            }}
            onKeyDown={handleEnterBlur}
            className="w-[115px] rounded border border-gray-300 bg-gray-50 px-1 py-1 text-[11px] dark:border-gray-700 dark:bg-gray-800"
          />
        </td>
        <td className="px-1.5 py-2">
          <input
            type="time"
            value={fila.horaInicio}
            onChange={(e) => actualizarFilaActual(fila.id, { horaInicio: e.target.value })}
            onKeyDown={handleEnterBlur}
            className={`w-[74px] rounded border px-1 py-1 text-[11px] transition-colors ${
              faltaInicio
                ? 'border-2 border-amber-500 bg-amber-100 text-amber-900 font-bold dark:bg-amber-950/60 dark:text-amber-200'
                : 'border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-800'
            }`}
          />
        </td>
        <td className="px-1.5 py-2">
          <input
            type="time"
            value={fila.horaFin}
            onChange={(e) => actualizarFilaActual(fila.id, { horaFin: e.target.value })}
            onKeyDown={handleEnterBlur}
            className={`w-[74px] rounded border px-1 py-1 text-[11px] transition-colors ${
              faltaFin
                ? 'border-2 border-amber-500 bg-amber-100 text-amber-900 font-bold dark:bg-amber-950/60 dark:text-amber-200'
                : 'border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-800'
            }`}
          />
        </td>
        <td className="px-1.5 py-2">
          <input
            type="number"
            value={fila.cantArticulos}
            onChange={(e) => actualizarFilaActual(fila.id, { cantArticulos: Number(e.target.value) })}
            onKeyDown={handleEnterBlur}
            className="w-14 rounded border border-gray-300 bg-gray-50 px-1 py-1 text-[11px] dark:border-gray-700 dark:bg-gray-800"
          />
        </td>
        <td className="px-1.5 py-2 font-medium">
          <div className="flex items-center space-x-1" title={armador}>
            <span className="truncate max-w-[120px] block">{armador}</span>
            {esIrregular && (
              <span className="flex items-center space-x-0.5 rounded bg-amber-200 px-1 py-0.5 text-[9px] font-bold text-amber-900 dark:bg-amber-900/80 dark:text-amber-200 shrink-0">
                <AlertTriangle className="h-3 w-3" />
                <span>Nota</span>
              </span>
            )}
            {fila.tipoTarea && fila.tipoTarea !== 'armado' && (
              <span
                className={`flex items-center space-x-0.5 rounded px-1.5 py-0.5 text-[9px] font-bold shrink-0 ${
                  fila.tipoTarea === 'atencion_cliente'
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200'
                    : fila.tipoTarea === 'produccion'
                    ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-200'
                    : 'bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200'
                }`}
                title={formatearEtiquetaTarea(fila.tipoTarea, fila.detalleOtraTarea)}
              >
                <span>{formatearEtiquetaTarea(fila.tipoTarea, fila.detalleOtraTarea)}</span>
              </span>
            )}
          </div>
        </td>
        <td className="px-1.5 py-2 text-right">
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
                  esIrregular: false,
                  nuevoEmpleado: nuevoEmp,
                  empleadoAsignado: accion === 'asignar_nuevo' ? nuevoEmp : actual.empleadoHeader,
                })
              }
              onNormalizar={() =>
                actualizarFilaActual(fila.id, {
                  esIrregular: false,
                  notaIrregularidad: null,
                  accionIrregularidad: undefined,
                  nuevoEmpleado: undefined,
                  tipoTarea: 'armado',
                  detalleOtraTarea: undefined,
                })
              }
              onDerivarTarea={(tipo, detalle) =>
                actualizarFilaActual(fila.id, {
                  tipoTarea: tipo,
                  detalleOtraTarea: detalle,
                  esIrregular: false,
                  empleadoAsignado: actual.empleadoHeader,
                })
              }
            />
          </td>
        </tr>
      )}
    </React.Fragment>
  );
}
