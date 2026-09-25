'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Legend,
  LabelList,
} from 'recharts';
import { DatoZonaComparativo } from './types';
import { EtiquetaBarraZona } from './EtiquetaBarraZona';

interface GraficoComparativoZonaProps {
  data: DatoZonaComparativo[];
  metric: 'importe' | 'cantidad';
  mesesSeleccionados: string[];
  mostrarVariacion: boolean;
  maxValue: number;
  chartHeight: number;
  formatCurrency: (v: number) => string;
  formatQuantity: (v: number) => string;
}

const monthColors = [
  '#9F9AE3', '#6F6BB8', '#5A57A6', '#4B88A2', '#D34E24', '#C59B76',
  '#78A1BB', '#283D3B', '#197278', '#EDDDD4', '#C44536', '#772E25',
];

export const GraficoComparativoZona: React.FC<GraficoComparativoZonaProps> = ({
  data,
  metric,
  mesesSeleccionados,
  mostrarVariacion,
  maxValue,
  chartHeight,
  formatCurrency,
  formatQuantity,
}) => {
  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: Array<{ name: string; value: number; color: string }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-3 bg-white border border-gray-300 rounded-lg shadow-lg dark:bg-gray-800 dark:border-gray-600">
          <p className="font-bold text-gray-800 dark:text-white mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm flex items-center gap-2 mb-1">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></span>
              <span className="font-medium text-gray-700 dark:text-gray-300">{entry.name}:</span>
              <span className="text-gray-800 dark:text-white">
                {metric === 'importe' ? formatCurrency(entry.value) : formatQuantity(entry.value)}
              </span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={chartHeight}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 5, right: 120, left: 20, bottom: 5 }}
        barGap={2}
        barCategoryGap="10%"
      >
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
        <XAxis
          type="number"
          domain={[0, maxValue]}
          tickFormatter={(value) =>
            metric === 'importe' ? formatCurrency(value as number) : formatQuantity(value as number)
          }
          tickLine={false}
          axisLine={false}
          tick={{ fill: '#6B7280', fontSize: 12 }}
        />
        <YAxis
          type="category"
          dataKey="name"
          width={110}
          tickLine={false}
          axisLine={false}
          tick={{ fill: '#4B5563', fontSize: 12, fontWeight: 500 }}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(156, 163, 175, 0.1)' }} />
        <Legend wrapperStyle={{ paddingTop: '20px' }} />

        {mesesSeleccionados.map((mes, index) => (
          <Bar
            key={mes}
            dataKey={mes}
            name={mes}
            fill={monthColors[index % monthColors.length]}
            radius={[0, 4, 4, 0]}
          >
            <LabelList
              dataKey={mes}
              content={(props) => (
                <EtiquetaBarraZona
                  {...props}
                  metric={metric}
                  data={data}
                  dataKey={mes}
                  monthsOrder={mesesSeleccionados}
                  showDelta={mostrarVariacion}
                />
              )}
            />
          </Bar>
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
};
