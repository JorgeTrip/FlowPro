// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import React from 'react';
import type { RegistroArmadoDocumento, RendimientoEmpleado, MetricasKpi, FiltrosAnalisis } from '../../types/armado';
import { DashboardFilters } from './DashboardFilters';
import { AnalisisSkeleton } from './AnalisisSkeleton';
import { BarraResumenDatos } from '../datos/BarraResumenDatos';
import { KPICards } from './KPICards';
import { PerformanceCharts } from './PerformanceCharts';
import { MonthlyPerformanceCharts } from './MonthlyPerformanceCharts';
import { GraficoDistribucionTareas } from './GraficoDistribucionTareas';
import { AnalyticsTable } from './AnalyticsTable';

interface VistaAnalisisArmadoProps {
  filtros: FiltrosAnalisis;
  empleadosList: string[];
  registrosVerificados: RegistroArmadoDocumento[];
  cargandoAnalisis: boolean;
  metricas: MetricasKpi;
  rendimiento: RendimientoEmpleado[];
  onCambiarFiltros: (f: FiltrosAnalisis) => void;
  onAbrirIrregularidades: (emp?: string) => void;
  onRecargarDatos: () => void;
}

export function VistaAnalisisArmado({
  filtros,
  empleadosList,
  registrosVerificados,
  cargandoAnalisis,
  metricas,
  rendimiento,
  onCambiarFiltros,
  onAbrirIrregularidades,
  onRecargarDatos,
}: VistaAnalisisArmadoProps) {
  return (
    <div className="space-y-6">
      <DashboardFilters
        filtros={filtros}
        empleadosDisponibles={empleadosList}
        registrosCompletos={registrosVerificados}
        onCambiarFiltros={onCambiarFiltros}
      />

      {cargandoAnalisis ? (
        <AnalisisSkeleton />
      ) : (
        <>
          <BarraResumenDatos
            planillasFiltradas={registrosVerificados}
            hayFiltro={filtros.rango !== 'todos' || !!filtros.empleado}
          />

          <KPICards metricas={metricas} />

          <GraficoDistribucionTareas registros={registrosVerificados} />

          <PerformanceCharts
            rendimiento={rendimiento}
            promedioEquipo={metricas.velocidadPromedioEq}
            registros={registrosVerificados}
            onVerIrregularidades={onAbrirIrregularidades}
            onActualizado={onRecargarDatos}
          />

          <MonthlyPerformanceCharts
            registros={registrosVerificados}
            onActualizado={onRecargarDatos}
          />

          <AnalyticsTable rendimiento={rendimiento} registros={registrosVerificados} />
        </>
      )}
    </div>
  );
}
