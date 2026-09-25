// 2025 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { exportChartAsPNG } from '../lib/exportUtils';
import { ReporteResultados } from '@/app/lib/reportGenerator';
import { ControlesVentasZona } from './zona/ControlesVentasZona';
import { GraficoAcumuladoZona } from './zona/GraficoAcumuladoZona';
import { GraficoComparativoZona } from './zona/GraficoComparativoZona';
import { DatoZonaAcumulado, DatoZonaComparativo } from './zona/types';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(value);
const formatQuantity = (value: number) =>
  new Intl.NumberFormat('es-AR').format(value);

export const VentasPorZona = ({
  ventasPorZona,
  cantidadesPorZona,
}: {
  ventasPorZona: ReporteResultados['ventasPorZona'];
  cantidadesPorZona: ReporteResultados['cantidadesPorZona'];
}) => {
  const [metric, setMetric] = useState<'importe' | 'cantidad'>('importe');
  const [distanciaEtiquetas, setDistanciaEtiquetas] = useState<number>(1.8);
  const [modoVista, setModoVista] = useState<'acumulado' | 'comparativo'>('acumulado');
  const [mesesSeleccionados, setMesesSeleccionados] = useState<string[]>([]);
  const [mostrarVariacion, setMostrarVariacion] = useState<boolean>(true);
  const chartRef = useRef<HTMLDivElement>(null);

  const meses = useMemo(
    () => [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
    ],
    []
  );

  const mesesConDatos = useMemo(() => {
    const mesesSet = new Set<string>();
    Object.entries(ventasPorZona).forEach(([mes, zonas]) => {
      if (Object.values(zonas).some((z) => z.AX !== 0)) mesesSet.add(mes);
    });
    Object.entries(cantidadesPorZona).forEach(([mes, zonas]) => {
      if (Object.values(zonas).some((z) => z.AX !== 0)) mesesSet.add(mes);
    });
    return Array.from(mesesSet);
  }, [ventasPorZona, cantidadesPorZona]);

  const mesesInicializados = useRef(false);
  useEffect(() => {
    if (!mesesInicializados.current && mesesConDatos.length > 0) {
      setMesesSeleccionados(mesesConDatos);
      mesesInicializados.current = true;
    }
  }, [mesesConDatos]);

  const sourceData = metric === 'importe' ? ventasPorZona : cantidadesPorZona;

  const dataAcumulado: DatoZonaAcumulado[] = useMemo(() => {
    if (modoVista !== 'acumulado') return [];
    const result: DatoZonaAcumulado[] = [];

    mesesSeleccionados.forEach((mes) => {
      const mesData = sourceData[mes];
      if (mesData) {
        Object.entries(mesData).forEach(([zona, values]) => {
          const existingIndex = result.findIndex((item) => item.name === zona);
          const totalValue = (values.A || 0) + (values.X || 0);

          if (existingIndex >= 0) {
            result[existingIndex].value += totalValue;
          } else {
            result.push({
              name: zona || 'Sin zona',
              value: totalValue,
            });
          }
        });
      }
    });

    return result
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [sourceData, modoVista, mesesSeleccionados]);

  const dataComparativo: DatoZonaComparativo[] = useMemo(() => {
    if (modoVista !== 'comparativo') return [];
    const zonasSet = new Set<string>();

    mesesSeleccionados.forEach((mes) => {
      const mesData = sourceData[mes];
      if (mesData) {
        Object.keys(mesData).forEach((zona) => zonasSet.add(zona));
      }
    });

    const comparativeData: DatoZonaComparativo[] = Array.from(zonasSet).map((zona) => {
      const zonaData: DatoZonaComparativo = { name: zona || 'Sin zona', total: 0 };

      mesesSeleccionados.forEach((mes) => {
        const mesData = sourceData[mes];
        const values = mesData?.[zona];
        const val = values ? (values.A || 0) + (values.X || 0) : 0;
        zonaData[mes] = val;
        zonaData.total += val;
      });

      return zonaData;
    });

    return comparativeData
      .filter((item) => item.total > 0)
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);
  }, [sourceData, modoVista, mesesSeleccionados]);

  const handleExport = () => {
    exportChartAsPNG(chartRef, 'ventas-por-zona');
  };

  const chartHeight = useMemo(() => {
    if (modoVista === 'comparativo') {
      const minHeight = 400;
      const itemHeight = 45;
      return Math.max(minHeight, dataComparativo.length * itemHeight + 150);
    }
    return 400;
  }, [dataComparativo.length, modoVista]);

  const maxValue = useMemo(() => {
    if (modoVista === 'acumulado' || dataComparativo.length === 0) return 0;
    let max = 0;
    dataComparativo.forEach((item) => {
      mesesSeleccionados.forEach((mes) => {
        const val = item[mes] as number | undefined;
        if (val && val > max) max = val;
      });
    });
    return max * 1.3;
  }, [dataComparativo, modoVista, mesesSeleccionados]);

  return (
    <div
      ref={chartRef}
      className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800"
    >
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Ventas por Zona</h4>
      </div>

      <ControlesVentasZona
        onExport={handleExport}
        meses={meses}
        mesesSeleccionados={mesesSeleccionados}
        setMesesSeleccionados={setMesesSeleccionados}
        mesesConDatos={mesesConDatos}
        metric={metric}
        setMetric={setMetric}
        modoVista={modoVista}
        setModoVista={setModoVista}
        distanciaEtiquetas={distanciaEtiquetas}
        setDistanciaEtiquetas={setDistanciaEtiquetas}
        mostrarVariacion={mostrarVariacion}
        setMostrarVariacion={setMostrarVariacion}
      />

      <div className="w-full">
        {modoVista === 'acumulado' ? (
          <GraficoAcumuladoZona
            data={dataAcumulado}
            metric={metric}
            distanciaEtiquetas={distanciaEtiquetas}
            formatCurrency={formatCurrency}
            formatQuantity={formatQuantity}
          />
        ) : (
          <GraficoComparativoZona
            data={dataComparativo}
            metric={metric}
            mesesSeleccionados={mesesSeleccionados}
            mostrarVariacion={mostrarVariacion}
            maxValue={maxValue}
            chartHeight={chartHeight}
            formatCurrency={formatCurrency}
            formatQuantity={formatQuantity}
          />
        )}
      </div>
    </div>
  );
};
