// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import React from 'react';
import { Clock } from 'lucide-react';
import type { ItemGraficoTorta } from '../../utils/calcularDistribucionTareas';

interface TarjetasDesgloseTareasProps {
  horasTotales: number;
  items: ItemGraficoTorta[];
}

export function TarjetasDesgloseTareas({ horasTotales, items }: TarjetasDesgloseTareasProps) {
  return (
    <div className="space-y-3 lg:col-span-7">
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pb-1">
        <span className="flex items-center gap-1.5 font-medium">
          <Clock className="h-3.5 w-3.5 text-blue-500" />
          Total de Horas Registradas:
        </span>
        <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
          {horasTotales} hs
        </span>
      </div>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {items.map((item) => (
          <div
            key={item.name}
            className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/70 p-3 dark:border-gray-800/80 dark:bg-gray-900/40"
          >
            <div className="flex items-center space-x-2.5">
              <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
              <div>
                <div className="text-xs font-semibold text-gray-800 dark:text-gray-200">{item.name}</div>
                <div className="text-[11px] text-gray-500 dark:text-gray-400">{item.value} hs</div>
              </div>
            </div>
            <span className="rounded-lg bg-white px-2 py-0.5 text-xs font-bold text-gray-700 shadow-2xs dark:bg-gray-800 dark:text-gray-200">
              {item.porcentaje}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
