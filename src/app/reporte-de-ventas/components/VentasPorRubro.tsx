// 2025 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { exportChartAsPNG } from '../lib/exportUtils';
import { ReporteResultados } from '@/app/lib/reportGenerator';
import { ControlesVentasRubro } from './rubro/ControlesVentasRubro';
import { GraficoAcumuladoRubro } from './rubro/GraficoAcumuladoRubro';
import { GraficoComparativoRubro } from './rubro/GraficoComparativoRubro';
import { DatoRubroAcumulado, DatoRubroComparativo } from './rubro/types';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(value);
const formatQuantity = (value: number) =>
  new Intl.NumberFormat('es-AR').format(value);

export const VentasPorRubro = ({
  ventasPorRubro,
  cantidadesPorRubro,
}: {
  ventasPorRubro: ReporteResultados['ventasPorRubro'];
  cantidadesPorRubro: ReporteResultados['cantidadesPorRubro'];
}) => {
  const [activeMetric, setMetric] = useState<'importe' | 'cantidad'>('importe');
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
    Object.entries(ventasPorRubro).forEach(([mes, rubros]) => {
      if (Object.values(rubros).some((r) => r.AX !== 0)) mesesSet.add(mes);
    });
    Object.entries(cantidadesPorRubro).forEach(([mes, rubros]) => {
      if (Object.values(rubros).some((r) => r.AX !== 0)) mesesSet.add(mes);
    });
    return Array.from(mesesSet);
  }, [ventasPorRubro, cantidadesPorRubro]);

  const mesesInicializados = useRef(false);
  useEffect(() => {
    if (!mesesInicializados.current && mesesConDatos.length > 0) {
      setMesesSeleccionados(mesesConDatos);
      mesesInicializados.current = true;
    }
  }, [mesesConDatos]);

  const sourceData = activeMetric === 'importe' ? ventasPorRubro : cantidadesPorRubro;

  const dataAcumulado: DatoRubroAcumulado[] = useMemo(() => {
    if (modoVista !== 'acumulado') return [];
    const result: DatoRubroAcumulado[] = [];

    mesesSeleccionados.forEach((mes) => {
      const mesData = sourceData[mes];
      if (mesData) {
        Object.entries(mesData).forEach(([subRubro, values]) => {
          const existingIndex = result.findIndex((item) => item.name === subRubro);
          const totalValue = (values.A || 0) + (values.X || 0);

          if (existingIndex >= 0) {
            result[existingIndex].value += totalValue;
          } else {
            result.push({
              name: subRubro || 'Sin rubro',
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

  const dataComparativo: DatoRubroComparativo[] = useMemo(() => {
    if (modoVista !== 'comparativo') return [];
    const rubrosSet = new Set<string>();

    mesesSeleccionados.forEach((mes) => {
      const mesData = sourceData[mes];
      if (mesData) {
        Object.keys(mesData).forEach((rubro) => rubrosSet.add(rubro));
      }
    });

    const comparativeData: DatoRubroComparativo[] = Array.from(rubrosSet).map((rubro) => {
      const rubroData: DatoRubroComparativo = { name: rubro || 'Sin rubro', total: 0 };

      mesesSeleccionados.forEach((mes) => {
        const mesData = sourceData[mes];
        const values = mesData?.[rubro];
        const val = values ? (values.A || 0) + (values.X || 0) : 0;
        rubroData[mes] = val;
        rubroData.total += val;
      });

      return rubroData;
    });

    return comparativeData
      .filter((item) => item.total > 0)
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);
  }, [sourceData, modoVista, mesesSeleccionados]);

  const handleExport = () => {
    exportChartAsPNG(chartRef, 'ventas-por-rubro');
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
        <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Ventas por Rubro</h4>
      </div>

      <ControlesVentasRubro
        onExport={handleExport}
        meses={meses}
        mesesSeleccionados={mesesSeleccionados}
        setMesesSeleccionados={setMesesSeleccionados}
        mesesConDatos={mesesConDatos}
        activeMetric={activeMetric}
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
          <GraficoAcumuladoRubro
            data={dataAcumulado}
            activeMetric={activeMetric}
            distanciaEtiquetas={distanciaEtiquetas}
            formatCurrency={formatCurrency}
            formatQuantity={formatQuantity}
          />
        ) : (
          <GraficoComparativoRubro
            data={dataComparativo}
            activeMetric={activeMetric}
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
