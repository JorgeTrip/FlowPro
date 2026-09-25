// 2025 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import React, { useState, useMemo, useRef } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from 'recharts';
import { exportChartAsPNG } from '../lib/exportUtils';
import { ReporteResultados } from '@/app/lib/reportGenerator';
import {
  formatCurrency,
  formatQuantity,
  formatName,
  CustomizedBarLabel,
} from './shared/GraficosUtils';
import { ControlesTopProductos } from './tops/ControlesTopProductos';

interface TopProductosComponentProps {
  topProductosMasVendidos: ReporteResultados['topProductosMasVendidos'];
  topProductosMasVendidosPorImporte: ReporteResultados['topProductosMasVendidosPorImporte'];
  topProductosMenosVendidos: ReporteResultados['topProductosMenosVendidos'];
}

export const TopProductos = ({
  topProductosMasVendidos,
  topProductosMasVendidosPorImporte,
  topProductosMenosVendidos,
}: TopProductosComponentProps) => {
  const [tipo, setTipo] = useState<'mas' | 'menos'>('mas');
  const [metric, setMetric] = useState<'importe' | 'cantidad'>('cantidad');
  const [numProductos, setNumProductos] = useState<number>(10);
  const [excluirAjustes, setExcluirAjustes] = useState<boolean>(false);
  const chartRef = useRef<HTMLDivElement>(null);

  const debeExcluirProducto = (articulo: string): boolean => {
    const cod = articulo.trim().toUpperCase();
    if (cod === '50AJU003') return true;
    if (cod.endsWith('G') || cod.endsWith('C') || cod.endsWith('M')) return true;
    return false;
  };

  const data = useMemo(() => {
    let sourceData;
    if (tipo === 'mas') {
      sourceData = metric === 'importe' ? topProductosMasVendidosPorImporte : topProductosMasVendidos;
    } else {
      sourceData = topProductosMenosVendidos;
    }

    const filteredData = excluirAjustes
      ? sourceData.filter((item: { articulo: string }) => !debeExcluirProducto(item.articulo))
      : sourceData;

    return filteredData
      .slice(0, numProductos)
      .map((item: { articulo: string; descripcion: string; total?: number; cantidad?: number }) => {
        const displayName =
          item.descripcion && item.descripcion.trim() ? formatName(item.descripcion) : item.articulo;

        return {
          name: displayName,
          value: metric === 'importe' ? item.total || 0 : item.cantidad || 0,
        };
      });
  }, [
    tipo,
    metric,
    numProductos,
    excluirAjustes,
    topProductosMasVendidos,
    topProductosMasVendidosPorImporte,
    topProductosMenosVendidos,
  ]);

  const maxValue = useMemo(() => {
    if (data.length === 0) return 0;
    return Math.max(...data.map((item: { value: number }) => item.value)) * 1.2;
  }, [data]);

  const chartHeight = useMemo(() => {
    const minHeight = 400;
    const itemHeight = 35;
    const calculatedHeight = data.length * itemHeight + 100;
    return Math.max(minHeight, calculatedHeight);
  }, [data.length]);

  const handleExport = () => {
    exportChartAsPNG(chartRef, 'top-productos');
  };

  return (
    <div
      ref={chartRef}
      className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800"
    >
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Top Productos</h4>
      </div>

      <ControlesTopProductos
        tipo={tipo}
        setTipo={setTipo}
        metric={metric}
        setMetric={setMetric}
        numProductos={numProductos}
        setNumProductos={setNumProductos}
        excluirAjustes={excluirAjustes}
        setExcluirAjustes={setExcluirAjustes}
        handleExport={handleExport}
      />

      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 100, left: 20, bottom: 5 }}>
          <defs>
            <linearGradient id="colorBarProducto" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#8884d8" stopOpacity={0.8} />
              <stop offset="100%" stopColor="#82ca9d" stopOpacity={0.9} />
            </linearGradient>
            <filter id="shadowProductos" x="-10%" y="-10%" width="120%" height="130%">
              <feOffset result="offOut" in="SourceGraphic" dx="3" dy="3" />
              <feColorMatrix
                result="matrixOut"
                in="offOut"
                type="matrix"
                values="0.2 0 0 0 0 0 0.2 0 0 0 0 0 0.2 0 0 0 0 0 1 0"
              />
              <feGaussianBlur result="blurOut" in="matrixOut" stdDeviation="3" />
              <feBlend in="SourceGraphic" in2="blurOut" mode="normal" />
            </filter>
          </defs>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            type="number"
            domain={[0, maxValue]}
            tickFormatter={(value) =>
              metric === 'importe' ? formatCurrency(value as number, true) : formatQuantity(value as number, true)
            }
          />
          <YAxis type="category" dataKey="name" width={150} tick={{ fontSize: 12 }} />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="p-2 bg-gray-700 text-white rounded-md border border-gray-600 shadow-lg">
                    <p className="font-bold">{label}</p>
                    <p>{`${metric === 'importe' ? 'Importe' : 'Cantidad'}: ${
                      metric === 'importe' ? formatCurrency(payload[0].value as number) : formatQuantity(payload[0].value as number)
                    }`}</p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar
            dataKey="value"
            name={metric === 'importe' ? 'Ventas' : 'Cantidad'}
            fill="url(#colorBarProducto)"
            radius={[0, 4, 4, 0]}
            stroke="#6b64c8"
            strokeWidth={1}
            filter="url(#shadowProductos)"
          >
            <LabelList
              dataKey="value"
              content={(props) => <CustomizedBarLabel {...props} metric={metric} />}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
