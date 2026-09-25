// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import React from 'react';
import { User } from 'lucide-react';
import type { RendimientoEmpleado } from '../../types/armado';
import type { InfoMes, MetricasMesEmpleado } from '../../utils/monthlyMetricsCalculator';

interface AnalyticsTableRowProps {
  rendimiento: RendimientoEmpleado;
  meses: InfoMes[];
  detallePorMes?: Map<string, MetricasMesEmpleado>;
}

export function AnalyticsTableRow({
  rendimiento: r,
  meses,
  detallePorMes,
}: AnalyticsTableRowProps) {
  const tieneMultiplesMeses = meses.length > 1;

  const desgloseTooltip = `Desglose: Atención Cliente: ${r.desgloseOtrasTareas?.atencionClienteHs || 0} hs | Producción: ${r.desgloseOtrasTareas?.produccionHs || 0} hs | Otras Tareas: ${r.desgloseOtrasTareas?.otrosHs || 0} hs`;

  return (
    <tr className="hover:bg-gray-50/80 dark:hover:bg-gray-800/40 transition-colors">
      {/* Armador */}
      <td className="flex items-center space-x-2 px-3 py-3 font-semibold text-gray-900 dark:text-gray-100 bg-white/50 dark:bg-[#1C1C1E]/50 border-r border-gray-200 dark:border-gray-800">
        <User className="h-4 w-4 text-blue-500 shrink-0" />
        <span className="truncate max-w-[130px]" title={r.empleado}>
          {r.empleado}
        </span>
      </td>

      {/* Bloque Consolidado */}
      <td className="px-2.5 py-3 text-center">{r.totalPedidos}</td>
      <td className="px-2.5 py-3 text-center font-medium">{r.totalArticulos}</td>
      <td className="px-2.5 py-3 text-center font-semibold text-gray-800 dark:text-gray-200">
        {r.horasArmado ?? r.horasTrabajadas} hs
      </td>
      <td className="px-2.5 py-3 text-center">
        {(r.horasOtrasTareas || 0) > 0 ? (
          <span
            className="rounded bg-blue-100 px-1.5 py-0.5 font-bold text-blue-800 dark:bg-blue-900/50 dark:text-blue-200 cursor-help"
            title={desgloseTooltip}
          >
            {r.horasOtrasTareas} hs
          </span>
        ) : (
          <span className="text-gray-400">0 hs</span>
        )}
      </td>
      <td className="px-2.5 py-3 text-center font-bold text-gray-900 dark:text-gray-100">
        {r.horasTotales ?? r.horasTrabajadas} hs
      </td>
      <td
        className="px-2.5 py-3 text-center font-bold text-blue-600 dark:text-blue-400"
        title="Calculada exclusivamente sobre horas de armado"
      >
        {r.velocidadArtHs} Art/h
      </td>
      <td className="px-2.5 py-3 text-center">{r.tiempoMedioMin} min</td>
      <td className={`px-2.5 py-3 text-center ${tieneMultiplesMeses ? 'border-r-2 border-blue-200 dark:border-blue-900/60' : ''}`}>
        {r.totalIrregularidades > 0 ? (
          <span className="rounded bg-amber-100 px-2 py-0.5 font-bold text-amber-800 dark:bg-amber-900/50 dark:text-amber-300">
            {r.totalIrregularidades}
          </span>
        ) : (
          <span className="text-gray-400">0</span>
        )}
      </td>

      {/* Bloques por cada mes (si hay múltiples meses) */}
      {tieneMultiplesMeses &&
        meses.map((mes) => {
          const stats = detallePorMes?.get(mes.clave);
          if (!stats || (stats.pedidos === 0 && stats.horasTotales === 0)) {
            return (
              <React.Fragment key={`td-${r.empleado}-${mes.clave}`}>
                <td className="px-2 py-3 text-center text-gray-400 text-[11px]">-</td>
                <td className="px-2 py-3 text-center text-gray-400 text-[11px]">-</td>
                <td className="px-2 py-3 text-center text-gray-400 text-[11px]">-</td>
                <td className="px-2 py-3 text-center text-gray-400 text-[11px]">-</td>
                <td className="px-2 py-3 text-center text-gray-400 text-[11px] border-r border-gray-200 dark:border-gray-800 last:border-r-0">
                  -
                </td>
              </React.Fragment>
            );
          }

          const desgloseMesTooltip = `Desglose ${mes.etiqueta}: Atención Cliente: ${stats.desgloseOtrasTareas.atencionClienteHs} hs | Producción: ${stats.desgloseOtrasTareas.produccionHs} hs | Otras Tareas: ${stats.desgloseOtrasTareas.otrosHs} hs`;

          return (
            <React.Fragment key={`td-${r.empleado}-${mes.clave}`}>
              <td className="px-2 py-3 text-center text-[11px] font-medium">{stats.pedidos}</td>
              <td className="px-2 py-3 text-center text-[11px]">{stats.articulos}</td>
              <td className="px-2 py-3 text-center text-[11px] font-semibold text-gray-800 dark:text-gray-200">
                {stats.horasArmado}h
              </td>
              <td className="px-2 py-3 text-center text-[11px]">
                {stats.horasOtrasTareas > 0 ? (
                  <span
                    className="rounded bg-blue-50 px-1 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 cursor-help"
                    title={desgloseMesTooltip}
                  >
                    {stats.horasOtrasTareas}h
                  </span>
                ) : (
                  <span className="text-gray-400">0h</span>
                )}
              </td>
              <td className="px-2 py-3 text-center text-[11px] font-bold text-emerald-600 dark:text-emerald-400 border-r border-gray-200 dark:border-gray-800 last:border-r-0">
                {stats.velocidadArtHs} Art/h
              </td>
            </React.Fragment>
          );
        })}
    </tr>
  );
}
