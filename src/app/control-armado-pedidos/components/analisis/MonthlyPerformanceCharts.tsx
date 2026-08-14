// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import React, { useMemo, useState } from 'react';
import { RegistroArmadoDocumento } from '../../types/armado';
import { calcularRendimientoMensualPorEmpleado } from '../../utils/monthlyMetricsCalculator';
import { MonthlyChartCard } from './MonthlyChartCard';
import { ModalDetallePlanillasBarra } from './ModalDetallePlanillasBarra';
import { CalendarRange, TrendingUp, PackageCheck } from 'lucide-react';

interface MonthlyPerformanceChartsProps {
  registros: RegistroArmadoDocumento[];
  onActualizado?: () => void;
}

export function MonthlyPerformanceCharts({ registros, onActualizado }: MonthlyPerformanceChartsProps) {
  const [modalDetalle, setModalDetalle] = useState<{
    abierta: boolean;
    titulo: string;
    subtitulo: string;
    planillas: RegistroArmadoDocumento[];
  } | null>(null);

  const { meses, datosVelocidad, datosPedidos } = useMemo(
    () => calcularRendimientoMensualPorEmpleado(registros),
    [registros]
  );

  if (meses.length === 0 || datosVelocidad.length === 0) {
    return null;
  }

  const handleBarClick = (empleado: string, mesClave?: string) => {
    if (!empleado) return;
    const planillasFiltradas = registros.filter((p) => {
      const coincideEmp = p.empleadoHeader === empleado || p.filas?.some((f) => (f.empleadoAsignado || f.nuevoEmpleado) === empleado);
      if (!coincideEmp) return false;
      if (!mesClave) return true;
      return p.filas?.some((f) => {
        const empFila = f.empleadoAsignado || f.nuevoEmpleado || p.empleadoHeader;
        const fechaFila = f.fecha || p.fechaPrimeraFila || '';
        return empFila === empleado && fechaFila.startsWith(mesClave);
      });
    });

    const mesInfo = meses.find((m) => m.clave === mesClave);
    const etiquetaMes = mesInfo ? mesInfo.etiqueta : (mesClave || '');

    setModalDetalle({
      abierta: true,
      titulo: `Planillas de ${empleado}${etiquetaMes ? ` - ${etiquetaMes}` : ''}`,
      subtitulo: `Detalle de planillas y pedidos armados que alimentan esta barra`,
      planillas: planillasFiltradas,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 pt-2">
        <CalendarRange className="h-5 w-5 text-blue-500" />
        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
          Comparativa de Evolución Mensual por Empleado ({meses.length} {meses.length === 1 ? 'mes' : 'meses'})
        </h3>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <MonthlyChartCard
          titulo="Velocidad de Armado por Mes (Art / hs)"
          subtitulo="Ritmo mensual por armador (clic en una barra para ver sus planillas)"
          icono={<TrendingUp className="h-4 w-4 text-blue-500" />}
          datos={datosVelocidad}
          meses={meses}
          sufijo="Art/h"
          onBarClick={handleBarClick}
        />

        <MonthlyChartCard
          titulo="Pedidos Armados Totales por Mes"
          subtitulo="Volumen total por armador (clic en una barra para ver sus planillas)"
          icono={<PackageCheck className="h-4 w-4 text-emerald-500" />}
          datos={datosPedidos}
          meses={meses}
          sufijo="ped"
          onBarClick={handleBarClick}
        />
      </div>

      {modalDetalle?.abierta && (
        <ModalDetallePlanillasBarra
          titulo={modalDetalle.titulo}
          subtitulo={modalDetalle.subtitulo}
          planillas={modalDetalle.planillas}
          onCerrar={() => setModalDetalle(null)}
          onActualizado={onActualizado}
        />
      )}
    </div>
  );
}
