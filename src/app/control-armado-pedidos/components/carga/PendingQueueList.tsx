// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import React from 'react';
import { useArmadoStore } from '../../stores/armadoStore';
import { Trash2, FileText, ExternalLink } from 'lucide-react';

export function PendingQueueList() {
  const { itemsPendientes, itemActualIndex, abrirModalVerificacion, eliminarItemPendiente } =
    useArmadoStore();

  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || !itemsPendientes.length) return null;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-[#1C1C1E]">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          Planillas en Cola de Verificación ({itemsPendientes.length})
        </h3>
        <span className="text-[11px] text-blue-600 dark:text-blue-400">
          Selecciona una planilla para verificarla
        </span>
      </div>

      <div className="space-y-2">
        {itemsPendientes.map((item, idx) => {
          const esSeleccionado = idx === itemActualIndex;
          const tieneIrregulares = item.filas.some((f) => f.esIrregular);

          return (
            <div
              key={item.id || idx}
              onClick={() => abrirModalVerificacion(idx)}
              className={`group flex cursor-pointer items-center justify-between rounded-lg p-3 text-xs transition-all border ${
                esSeleccionado
                  ? 'border-blue-500 bg-blue-50/70 dark:border-blue-500 dark:bg-blue-950/30 font-semibold shadow-sm'
                  : 'border-gray-150 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    esSeleccionado
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                  }`}
                >
                  #{idx + 1}
                </span>
                <FileText
                  className={`h-4 w-4 ${esSeleccionado ? 'text-blue-600' : 'text-gray-400'}`}
                />
                <div>
                  <p className="text-gray-900 dark:text-gray-100 font-medium">
                    {item.empleadoHeader || 'Empleado Desconocido'}
                  </p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">
                    {item.fechaPrimeraFila || item.fechaPlanilla || 'Sin fecha'} • {item.filas.length} filas
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {tieneIrregulares && (
                  <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-900/50 dark:text-amber-300">
                    Irregular
                  </span>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    abrirModalVerificacion(idx);
                  }}
                  className="flex items-center space-x-1 rounded bg-blue-600/10 px-2 py-1 text-[11px] font-medium text-blue-700 hover:bg-blue-600/20 dark:bg-blue-500/20 dark:text-blue-300"
                >
                  <span>Verificar</span>
                  <ExternalLink className="h-3 w-3" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (item.id) eliminarItemPendiente(item.id);
                  }}
                  className="p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Eliminar de la cola"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
