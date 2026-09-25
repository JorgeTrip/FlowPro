'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from 'recharts';
import { formatCurrency, formatQuantity } from '../shared/GraficosUtils';
import { DatoGraficoCategoria } from './types';

interface CustomizedLabelProps {
  x?: string | number;
  y?: string | number;
  width?: string | number;
  height?: string | number;
  value?: string | number;
  mostrarCantidad?: boolean;
}

const CustomizedLabelBar = (props: CustomizedLabelProps) => {
  const { x = 0, y = 0, width = 0, height = 0, value, mostrarCantidad } = props;
  if (value === undefined || value === null || Number(value) === 0) return null;

  const numX = typeof x === 'string' ? parseFloat(x) : x;
  const numY = typeof y === 'string' ? parseFloat(y) : y;
  const numWidth = typeof width === 'string' ? parseFloat(width) : width;
  const numHeight = typeof height === 'string' ? parseFloat(height) : height;
  const numValue = typeof value === 'string' ? parseFloat(value) : value;

  const formattedValue = mostrarCantidad ? formatQuantity(numValue) : formatCurrency(numValue);

  return (
    <text
      x={numX + numWidth + 5}
      y={numY + numHeight / 2}
      textAnchor="start"
      dominantBaseline="middle"
      className="fill-gray-600 dark:fill-gray-400 text-xs font-medium"
    >
      {formattedValue}
    </text>
  );
};

interface GraficoTopProductosCategoriaProps {
  chartData: DatoGraficoCategoria[];
  mostrarCantidad: boolean;
  topPorCategoria: number;
}

export const GraficoTopProductosCategoria: React.FC<GraficoTopProductosCategoriaProps> = ({
  chartData,
  mostrarCantidad,
  topPorCategoria,
}) => {
  const calcularAltura = () => {
    const baseHeight = 400;
    const itemHeight = 35;
    return Math.max(baseHeight, chartData.length * itemHeight + 150);
  };

  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: Array<{ payload: DatoGraficoCategoria }>;
  }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="p-2 bg-gray-700 text-white rounded-md border border-gray-600 shadow-lg">
          <p className="font-bold">{item.isCategory ? item.categoria : item.descripcion}</p>
          <p>{`Categoría: ${item.categoria}`}</p>
          <p>{`${mostrarCantidad ? 'Cantidad' : 'Importe'}: ${
            mostrarCantidad ? formatQuantity(item.value) : formatCurrency(item.value)
          }`}</p>
          {item.porcentaje !== undefined && (
            <p>{`Porcentaje: ${item.porcentaje}% ${item.isCategory ? 'del total' : 'de la categoría'}`}</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      <div style={{ height: calcularAltura() }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 120, left: 20, bottom: 5 }}
          >
            <defs>
              <linearGradient id="colorBarCategoriaTotal" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#8884d8" stopOpacity={1} />
                <stop offset="75%" stopColor="#7570c0" stopOpacity={1} />
                <stop offset="100%" stopColor="#6762a8" stopOpacity={1} />
              </linearGradient>
              <linearGradient id="colorBarProducto" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#98e3b5" stopOpacity={1} />
                <stop offset="75%" stopColor="#82ca9d" stopOpacity={1} />
                <stop offset="100%" stopColor="#6eb58a" stopOpacity={1} />
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
              tickFormatter={(value) => {
                if (!mostrarCantidad) {
                  return formatCurrency(value, true);
                }
                return formatQuantity(value, true);
              }}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={200}
              tick={({ y, payload }) => {
                const isCategory = chartData[payload.index]?.isCategory;
                const isDarkMode = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
                return (
                  <text
                    x={0}
                    y={y}
                    dy={4}
                    textAnchor="start"
                    fill={isCategory ? (isDarkMode ? '#f9fafb' : '#333') : isDarkMode ? '#d1d5db' : '#666'}
                    fontWeight={isCategory ? 'bold' : 'normal'}
                    fontSize={isCategory ? 13 : 11}
                  >
                    {payload.value}
                  </text>
                );
              }}
              interval={0}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="value"
              name={mostrarCantidad ? 'Cantidad' : 'Importe'}
              fill="url(#colorBarProducto)"
              stroke="#6eb58a"
              strokeWidth={1}
              radius={[0, 4, 4, 0]}
              barSize={16}
              filter="url(#shadowProductos)"
            >
              {chartData.map((entry, index: number) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.isCategory ? 'url(#colorBarCategoriaTotal)' : 'url(#colorBarProducto)'}
                  stroke={entry.isCategory ? '#6762a8' : '#6eb58a'}
                />
              ))}
              <LabelList
                dataKey="value"
                content={(props) => (
                  <CustomizedLabelBar {...props} mostrarCantidad={mostrarCantidad} />
                )}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="text-center mt-3">
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {topPorCategoria === -1
            ? `Todos los productos por categoría (por ${mostrarCantidad ? 'cantidad' : 'importe'})`
            : `Top ${topPorCategoria} productos más vendidos por categoría (por ${mostrarCantidad ? 'cantidad' : 'importe'})`}
        </span>
      </div>
    </div>
  );
};
