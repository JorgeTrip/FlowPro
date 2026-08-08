// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import React from 'react';
import { RendimientoEmpleado, RegistroArmadoDocumento } from '../../types/armado';
import { exportarAXLSX } from '../../utils/metricsCalculator';
import { User, FileSpreadsheet } from 'lucide-react';

interface AnalyticsTableProps {
  rendimiento: RendimientoEmpleado[];
  registros: RegistroArmadoDocumento[];
}

export function AnalyticsTable({ rendimiento, registros }: AnalyticsTableProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-800 dark:bg-[#1C1C1E]">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
            Detalle de Rendimiento por Armador
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Resumen consolidado de efectividad, tiempos y volumen de artículos
          </p>
        </div>

        <button
          onClick={() => exportarAXLSX(registros)}
          className="flex items-center space-x-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-emerald-700 transition-all"
        >
          <FileSpreadsheet className="h-4 w-4" />
          <span>Exportar a Excel (.xlsx)</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-gray-700 dark:text-gray-300">
          <thead className="border-b bg-gray-50 text-[11px] uppercase tracking-wider text-gray-500 dark:bg-gray-800 dark:text-gray-400">
            <tr>
              <th className="px-4 py-3">Armador</th>
              <th className="px-4 py-3 text-center">Pedidos</th>
              <th className="px-4 py-3 text-center">Artículos</th>
              <th className="px-4 py-3 text-center">Horas Trab.</th>
              <th className="px-4 py-3 text-center">Velocidad (Art/hs)</th>
              <th className="px-4 py-3 text-center">Min / Pedido</th>
              <th className="px-4 py-3 text-center">Irregularidades</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            {rendimiento.map((r, idx) => (
              <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                <td className="flex items-center space-x-2 px-4 py-3 font-semibold text-gray-900 dark:text-gray-100">
                  <User className="h-4 w-4 text-blue-500" />
                  <span>{r.empleado}</span>
                </td>
                <td className="px-4 py-3 text-center">{r.totalPedidos}</td>
                <td className="px-4 py-3 text-center font-medium">{r.totalArticulos}</td>
                <td className="px-4 py-3 text-center">{r.horasTrabajadas} hs</td>
                <td className="px-4 py-3 text-center font-bold text-blue-600 dark:text-blue-400">
                  {r.velocidadArtHs} Art/hs
                </td>
                <td className="px-4 py-3 text-center">{r.tiempoMedioMin} min</td>
                <td className="px-4 py-3 text-center">
                  {r.totalIrregularidades > 0 ? (
                    <span className="rounded bg-amber-100 px-2 py-0.5 font-bold text-amber-800 dark:bg-amber-900/50 dark:text-amber-300">
                      {r.totalIrregularidades}
                    </span>
                  ) : (
                    <span className="text-gray-400">0</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
