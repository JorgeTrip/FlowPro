// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import React, { useState, useMemo } from 'react';
import type { RendimientoEmpleado, RegistroArmadoDocumento } from '../../types/armado';
import { exportarAXLSX } from '../../utils/metricsCalculator';
import { calcularRendimientoMensualPorEmpleado } from '../../utils/monthlyMetricsCalculator';
import { FileSpreadsheet } from 'lucide-react';
import { AnalyticsTableToolbar, CriterioOrdenTabla } from './AnalyticsTableToolbar';
import { AnalyticsTableHeader } from './AnalyticsTableHeader';
import { AnalyticsTableRow } from './AnalyticsTableRow';

interface AnalyticsTableProps {
  rendimiento: RendimientoEmpleado[];
  registros: RegistroArmadoDocumento[];
}

export function AnalyticsTable({ rendimiento, registros }: AnalyticsTableProps) {
  const [busqueda, setBusqueda] = useState('');
  const [filtroArmador, setFiltroArmador] = useState('');
  const [criterioOrden, setCriterioOrden] = useState<CriterioOrdenTabla>('velocidad');

  const armadoresDisponibles = useMemo(() => {
    return Array.from(new Set(rendimiento.map((r) => r.empleado))).sort();
  }, [rendimiento]);

  const { meses, mapaDetalleEmpleado } = useMemo(() => {
    return calcularRendimientoMensualPorEmpleado(registros);
  }, [registros]);

  const rendimientoFiltrado = useMemo(() => {
    return rendimiento
      .filter((r) => {
        const coincideBusqueda = !busqueda.trim() || r.empleado.toUpperCase().includes(busqueda.trim().toUpperCase());
        const coincideArmador = !filtroArmador || r.empleado === filtroArmador;
        return coincideBusqueda && coincideArmador;
      })
      .sort((a, b) => {
        if (criterioOrden === 'velocidad') return b.velocidadArtHs - a.velocidadArtHs;
        if (criterioOrden === 'pedidos') return b.totalPedidos - a.totalPedidos;
        if (criterioOrden === 'articulos') return b.totalArticulos - a.totalArticulos;
        if (criterioOrden === 'irregularidades') return b.totalIrregularidades - a.totalIrregularidades;
        return 0;
      });
  }, [rendimiento, busqueda, filtroArmador, criterioOrden]);

  const totalColumnas = meses.length > 1 ? 9 + 5 + (meses.length - 1) * 10 : 9;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-800 dark:bg-[#1C1C1E] space-y-4">
      {/* Cabecera y Exportación */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 pb-4 dark:border-gray-800">
        <div>
          <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
            Detalle de Rendimiento por Armador
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {meses.length > 1
              ? `Datos consolidados y desglosados en ${meses.length} meses (${rendimientoFiltrado.length} armadores)`
              : `Resumen consolidado de efectividad, tiempos y volumen de artículos (${rendimientoFiltrado.length} armadores)`}
          </p>
        </div>

        <button
          onClick={() => exportarAXLSX(registros)}
          className="flex items-center space-x-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-emerald-700 transition-all cursor-pointer"
        >
          <FileSpreadsheet className="h-4 w-4" />
          <span>Exportar a Excel (.xlsx)</span>
        </button>
      </div>

      {/* Toolbar con filtros y ordenamiento */}
      <AnalyticsTableToolbar
        busqueda={busqueda}
        onCambiarBusqueda={setBusqueda}
        filtroArmador={filtroArmador}
        onCambiarFiltroArmador={setFiltroArmador}
        armadoresDisponibles={armadoresDisponibles}
        criterioOrden={criterioOrden}
        onCambiarCriterioOrden={setCriterioOrden}
      />

      {/* Tabla con scroll horizontal suave */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800 shadow-2xs">
        <table className="w-full text-left text-xs text-gray-700 dark:text-gray-300 border-collapse">
          <AnalyticsTableHeader meses={meses} />
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-[#1C1C1E]">
            {rendimientoFiltrado.length > 0 ? (
              rendimientoFiltrado.map((r) => (
                <AnalyticsTableRow
                  key={r.empleado}
                  rendimiento={r}
                  meses={meses}
                  detallePorMes={mapaDetalleEmpleado.get(r.empleado)}
                />
              ))
            ) : (
              <tr>
                <td colSpan={totalColumnas} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                  No se encontraron armadores con los filtros seleccionados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
