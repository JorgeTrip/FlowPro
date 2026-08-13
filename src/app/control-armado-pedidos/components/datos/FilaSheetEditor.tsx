// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import React from 'react';
import { FilaArmado } from '../../types/armado';
import { Trash2 } from 'lucide-react';

interface FilaSheetEditorProps {
  f: FilaArmado;
  index: number;
  empleadoHeader: string;
  handleActualizarFila: (id: string, updates: Partial<FilaArmado>) => void;
  handleEliminarFila: (id: string) => void;
  handleEnterBlur: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export function FilaSheetEditor({
  f,
  index,
  empleadoHeader,
  handleActualizarFila,
  handleEliminarFila,
  handleEnterBlur,
}: FilaSheetEditorProps) {
  const numLinea = index + 1;
  const faltaInicio = !f.horaInicio || f.horaInicio.trim() === '';
  const faltaFin = !f.horaFin || f.horaFin.trim() === '';

  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
      <td className="px-1.5 py-1.5 text-center font-mono">
        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
          {numLinea}
        </span>
      </td>
      <td className="px-2 py-1.5">
        <input
          type="date"
          value={f.fecha || ''}
          onChange={(e) => {
            if (e.target.value) {
              handleActualizarFila(f.id, { fecha: e.target.value });
            }
          }}
          onKeyDown={handleEnterBlur}
          className="w-[115px] rounded border border-gray-300 bg-gray-50 px-1.5 py-1 text-xs dark:border-gray-700 dark:bg-gray-800"
        />
      </td>
      <td className="px-2 py-1.5">
        <input
          type="time"
          value={f.horaInicio}
          onChange={(e) => handleActualizarFila(f.id, { horaInicio: e.target.value })}
          onKeyDown={handleEnterBlur}
          className={`w-[76px] rounded border px-1.5 py-1 text-xs transition-colors ${
            faltaInicio
              ? 'border-2 border-amber-500 bg-amber-100 font-bold text-amber-900 dark:bg-amber-950/60 dark:text-amber-200'
              : 'border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-800'
          }`}
        />
      </td>
      <td className="px-2 py-1.5">
        <input
          type="time"
          value={f.horaFin}
          onChange={(e) => handleActualizarFila(f.id, { horaFin: e.target.value })}
          onKeyDown={handleEnterBlur}
          className={`w-[76px] rounded border px-1.5 py-1 text-xs transition-colors ${
            faltaFin
              ? 'border-2 border-amber-500 bg-amber-100 font-bold text-amber-900 dark:bg-amber-950/60 dark:text-amber-200'
              : 'border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-800'
          }`}
        />
      </td>
      <td className="px-2 py-1.5">
        <input
          type="number"
          value={f.cantArticulos}
          onChange={(e) => handleActualizarFila(f.id, { cantArticulos: Number(e.target.value) })}
          onKeyDown={handleEnterBlur}
          className="w-16 rounded border border-gray-300 bg-gray-50 px-1.5 py-1 text-xs dark:border-gray-700 dark:bg-gray-800"
        />
      </td>
      <td className="px-2 py-1.5">
        <input
          type="text"
          list="lista-empleados-sugeridos-datos"
          value={f.empleadoAsignado || f.nuevoEmpleado || empleadoHeader}
          onChange={(e) => handleActualizarFila(f.id, { empleadoAsignado: e.target.value.toUpperCase() })}
          onKeyDown={handleEnterBlur}
          className="w-full rounded border border-gray-300 bg-gray-50 px-1.5 py-1 text-xs uppercase dark:border-gray-700 dark:bg-gray-800"
        />
      </td>
      <td className="px-2 py-1.5 text-right">
        <button
          onClick={() => handleEliminarFila(f.id)}
          className="rounded p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40"
          title="Eliminar fila"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </td>
    </tr>
  );
}
