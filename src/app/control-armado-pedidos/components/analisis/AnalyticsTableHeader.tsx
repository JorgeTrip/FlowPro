// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import React from 'react';
import type { InfoMes } from '../../utils/monthlyMetricsCalculator';

interface AnalyticsTableHeaderProps {
  meses: InfoMes[];
}

export function AnalyticsTableHeader({ meses }: AnalyticsTableHeaderProps) {
  const tieneMultiplesMeses = meses.length > 1;

  if (!tieneMultiplesMeses) {
    return (
      <thead className="border-b bg-gray-50 text-[11px] uppercase tracking-wider text-gray-500 dark:bg-gray-800 dark:text-gray-400">
        <tr>
          <th className="px-3 py-3">Armador</th>
          <th className="px-3 py-3 text-center">Pedidos</th>
          <th className="px-3 py-3 text-center">Artículos</th>
          <th className="px-3 py-3 text-center">Hs. Armado</th>
          <th className="px-3 py-3 text-center">Hs. Otras Tareas</th>
          <th className="px-3 py-3 text-center">Hs. Totales</th>
          <th className="px-3 py-3 text-center">Velocidad (Art/hs)</th>
          <th className="px-3 py-3 text-center">Min / Pedido</th>
          <th className="px-3 py-3 text-center">Irregularidades</th>
        </tr>
      </thead>
    );
  }

  return (
    <thead className="border-b bg-gray-50 text-[11px] uppercase tracking-wider text-gray-500 dark:bg-gray-800 dark:text-gray-400">
      {/* Fila 1: Grupos de Columnas (Consolidado + Meses) */}
      <tr className="border-b border-gray-200 dark:border-gray-700/60">
        <th rowSpan={2} className="px-3 py-3 font-bold text-gray-900 dark:text-gray-100 bg-gray-100/70 dark:bg-gray-800/90 border-r border-gray-200 dark:border-gray-700">
          Armador
        </th>
        <th
          colSpan={8}
          className="px-3 py-2 text-center font-bold text-blue-700 dark:text-blue-300 bg-blue-50/60 dark:bg-blue-950/20 border-r-2 border-blue-200 dark:border-blue-900/60"
        >
          Consolidado Período
        </th>
        {meses.map((mes, idx) => (
          <th
            key={mes.clave}
            colSpan={idx === 0 ? 5 : 10}
            className="px-3 py-2 text-center font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50/50 dark:bg-emerald-950/20 border-r border-gray-200 dark:border-gray-700 last:border-r-0"
          >
            {idx === 0 ? mes.etiqueta : `${mes.etiqueta} (vs ${meses[idx - 1].etiquetaCorta})`}
          </th>
        ))}
      </tr>

      {/* Fila 2: Sub-columnas individuales */}
      <tr className="text-[10px]">
        {/* Consolidado */}
        <th className="px-2.5 py-2 text-center bg-blue-50/30 dark:bg-blue-950/10">Pedidos</th>
        <th className="px-2.5 py-2 text-center bg-blue-50/30 dark:bg-blue-950/10">Artículos</th>
        <th className="px-2.5 py-2 text-center bg-blue-50/30 dark:bg-blue-950/10">Hs. Armado</th>
        <th className="px-2.5 py-2 text-center bg-blue-50/30 dark:bg-blue-950/10">Hs. Otras Tareas</th>
        <th className="px-2.5 py-2 text-center bg-blue-50/30 dark:bg-blue-950/10">Hs. Totales</th>
        <th className="px-2.5 py-2 text-center bg-blue-50/30 dark:bg-blue-950/10 text-blue-600 dark:text-blue-400">Vel. (Art/h)</th>
        <th className="px-2.5 py-2 text-center bg-blue-50/30 dark:bg-blue-950/10">Min/Ped</th>
        <th className="px-2.5 py-2 text-center bg-blue-50/30 dark:bg-blue-950/10 border-r-2 border-blue-200 dark:border-blue-900/60">Irreg.</th>

        {/* Cada Mes */}
        {meses.map((mes, idx) =>
          idx === 0 ? (
            <React.Fragment key={`sub-${mes.clave}`}>
              <th className="px-2 py-2 text-center bg-emerald-50/20 dark:bg-emerald-950/10">Ped.</th>
              <th className="px-2 py-2 text-center bg-emerald-50/20 dark:bg-emerald-950/10">Art.</th>
              <th className="px-2 py-2 text-center bg-emerald-50/20 dark:bg-emerald-950/10">Hs. Arm.</th>
              <th className="px-2 py-2 text-center bg-emerald-50/20 dark:bg-emerald-950/10">Hs. Otr.</th>
              <th className="px-2 py-2 text-center bg-emerald-50/20 dark:bg-emerald-950/10 font-bold text-emerald-600 dark:text-emerald-400 border-r border-gray-200 dark:border-gray-700">
                Vel. (Art/h)
              </th>
            </React.Fragment>
          ) : (
            <React.Fragment key={`sub-${mes.clave}`}>
              <th className="px-1.5 py-2 text-center bg-emerald-50/20 dark:bg-emerald-950/10">Ped.</th>
              <th className="px-1.5 py-2 text-center bg-emerald-100/40 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 font-bold">% Ped.</th>
              <th className="px-1.5 py-2 text-center bg-emerald-50/20 dark:bg-emerald-950/10">Art.</th>
              <th className="px-1.5 py-2 text-center bg-emerald-100/40 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 font-bold">% Art.</th>
              <th className="px-1.5 py-2 text-center bg-emerald-50/20 dark:bg-emerald-950/10">Hs. Arm.</th>
              <th className="px-1.5 py-2 text-center bg-emerald-100/40 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 font-bold">% Arm.</th>
              <th className="px-1.5 py-2 text-center bg-emerald-50/20 dark:bg-emerald-950/10">Hs. Otr.</th>
              <th className="px-1.5 py-2 text-center bg-emerald-100/40 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 font-bold">% Otr.</th>
              <th className="px-1.5 py-2 text-center bg-emerald-50/20 dark:bg-emerald-950/10">Velocidad</th>
              <th className="px-1.5 py-2 text-center bg-emerald-100/40 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 font-bold border-r border-gray-200 dark:border-gray-700 last:border-r-0">
                % Vel.
              </th>
            </React.Fragment>
          )
        )}
      </tr>
    </thead>
  );
}
