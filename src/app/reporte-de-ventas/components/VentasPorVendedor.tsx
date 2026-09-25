// 2025 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { exportChartAsPNG } from '../lib/exportUtils';
import { ReporteResultados } from '@/app/lib/reportGenerator';
import { ControlesVentasVendedor } from './vendedor/ControlesVentasVendedor';
import { GraficoVentasVendedor } from './vendedor/GraficoVentasVendedor';
import { VendedorData } from './vendedor/types';

const formatName = (name: string) => {
  const cleaned = name.replace(/[_\-]+/g, ' ').trim();
  return cleaned
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

export const VentasPorVendedor = ({
  ventasPorVendedor,
  cantidadesPorVendedor,
}: {
  ventasPorVendedor: ReporteResultados['ventasPorVendedor'];
  cantidadesPorVendedor: ReporteResultados['cantidadesPorVendedor'];
}) => {
  const [metric, setMetric] = useState<'importe' | 'cantidad'>('importe');
  const [mesesSeleccionados, setMesesSeleccionados] = useState<string[]>([]);
  const [modoVista, setModoVista] = useState<'acumulado' | 'comparativo'>('acumulado');
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
    const months = new Set<string>();
    Object.entries(ventasPorVendedor.resultado).forEach(([mes, vendedores]) => {
      if (Object.values(vendedores).some((v) => v.AX !== 0)) months.add(mes);
    });
    Object.entries(cantidadesPorVendedor.resultado).forEach(([mes, vendedores]) => {
      if (Object.values(vendedores).some((v) => v.AX !== 0)) months.add(mes);
    });
    return Array.from(months);
  }, [ventasPorVendedor, cantidadesPorVendedor]);

  const mesesInicializados = useRef(false);
  useEffect(() => {
    if (!mesesInicializados.current && mesesConDatos.length > 0) {
      setMesesSeleccionados(mesesConDatos);
      mesesInicializados.current = true;
    }
  }, [mesesConDatos]);

  const data: VendedorData[] = useMemo(() => {
    if (mesesSeleccionados.length === 0) return [];

    const vendorsSet = new Set<string>();
    mesesSeleccionados.forEach((mes) => {
      Object.keys(ventasPorVendedor.resultado[mes] || {}).forEach((v) => vendorsSet.add(v));
      Object.keys(cantidadesPorVendedor.resultado[mes] || {}).forEach((v) => vendorsSet.add(v));
    });

    const allVendors = Array.from(vendorsSet);

    if (modoVista === 'acumulado') {
      const totalsByVendor: Record<string, { importe: number; cantidad: number }> = {};

      allVendors.forEach((vendor) => {
        totalsByVendor[vendor] = { importe: 0, cantidad: 0 };
        mesesSeleccionados.forEach((mes) => {
          totalsByVendor[vendor].importe += ventasPorVendedor.resultado[mes]?.[vendor]?.AX || 0;
          totalsByVendor[vendor].cantidad += cantidadesPorVendedor.resultado[mes]?.[vendor]?.AX || 0;
        });
      });

      const totalGeneral = Object.values(totalsByVendor).reduce(
        (sum, item) => sum + (metric === 'importe' ? item.importe : item.cantidad),
        0
      );

      return Object.entries(totalsByVendor)
        .map(([name, itemData]) => {
          const value = metric === 'importe' ? itemData.importe : itemData.cantidad;
          const item: VendedorData = {
            name: formatName(name),
            value,
            importe: itemData.importe,
            cantidad: itemData.cantidad,
            porcentaje: totalGeneral > 0 ? `${((value / totalGeneral) * 100).toFixed(1)}%` : '0%',
          };
          return item;
        })
        .filter((item) => (item.value || 0) > 0)
        .sort((a, b) => (b.value || 0) - (a.value || 0))
        .slice(0, 10);
    } else {
      return allVendors
        .map((vendor) => {
          const vendorData: VendedorData = { name: formatName(vendor), total: 0 };
          let totalVal = 0;

          mesesSeleccionados.forEach((mes) => {
            const importe = ventasPorVendedor.resultado[mes]?.[vendor]?.AX || 0;
            const cantidad = cantidadesPorVendedor.resultado[mes]?.[vendor]?.AX || 0;
            const val = metric === 'importe' ? importe : cantidad;
            vendorData[mes] = val;
            totalVal += val;
          });

          vendorData.total = totalVal;
          return vendorData;
        })
        .filter((item) => (item.total || 0) > 0)
        .sort((a, b) => (b.total || 0) - (a.total || 0))
        .slice(0, 10);
    }
  }, [metric, mesesSeleccionados, modoVista, ventasPorVendedor, cantidadesPorVendedor]);

  const maxValue = useMemo(() => {
    if (data.length === 0) return 0;
    if (modoVista === 'acumulado') {
      return Math.max(...data.map((item) => item.value || 0)) * 1.3;
    } else {
      let max = 0;
      data.forEach((item) => {
        mesesSeleccionados.forEach((mes) => {
          const val = item[mes] as number | undefined;
          if (val && val > max) max = val;
        });
      });
      return max * 1.3;
    }
  }, [data, modoVista, mesesSeleccionados]);

  const chartHeight = useMemo(() => {
    const minHeight = 400;
    const itemHeight = modoVista === 'comparativo' ? 45 : 35;
    return Math.max(minHeight, data.length * itemHeight + 150);
  }, [data.length, modoVista]);

  const handleExport = () => {
    exportChartAsPNG(chartRef, 'ventas-por-vendedor');
  };

  return (
    <div
      ref={chartRef}
      className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800"
    >
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          Top 10 Vendedores
        </h4>
      </div>

      <ControlesVentasVendedor
        onExport={handleExport}
        meses={meses}
        mesesSeleccionados={mesesSeleccionados}
        setMesesSeleccionados={setMesesSeleccionados}
        mesesConDatos={mesesConDatos}
        metric={metric}
        setMetric={setMetric}
        modoVista={modoVista}
        setModoVista={setModoVista}
        mostrarVariacion={mostrarVariacion}
        setMostrarVariacion={setMostrarVariacion}
      />

      <div className="w-full">
        <GraficoVentasVendedor
          data={data}
          metric={metric}
          modoVista={modoVista}
          mesesSeleccionados={mesesSeleccionados}
          mostrarVariacion={mostrarVariacion}
          maxValue={maxValue}
          chartHeight={chartHeight}
        />
      </div>
    </div>
  );
};
