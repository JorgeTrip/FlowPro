'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { DatoZonaAcumulado } from './types';

interface GraficoAcumuladoZonaProps {
  data: DatoZonaAcumulado[];
  metric: 'importe' | 'cantidad';
  distanciaEtiquetas: number;
  formatCurrency: (v: number) => string;
  formatQuantity: (v: number) => string;
}

const COLORS = ['#3b82f6', '#10b981', '#ef4444', '#f97316', '#8b5cf6', '#06b6d4', '#84cc16', '#f59e0b'];

export const GraficoAcumuladoZona: React.FC<GraficoAcumuladoZonaProps> = ({
  data,
  metric,
  distanciaEtiquetas,
  formatCurrency,
  formatQuantity,
}) => {
  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: Array<{ payload?: DatoZonaAcumulado; value: number }>;
  }) => {
    if (active && payload && payload.length) {
      const total = data.reduce((sum, item) => sum + item.value, 0);
      const percentage = total > 0 ? ((payload[0].value / total) * 100).toFixed(2) : '0.00';

      return (
        <div className="p-3 bg-white border border-gray-300 rounded-lg shadow-lg max-w-xs dark:bg-gray-800 dark:border-gray-600">
          <p className="font-bold text-gray-800 dark:text-white mb-2">{payload[0].payload?.name}</p>
          <p className="text-gray-600 dark:text-gray-400">
            {metric === 'importe' ? 'Importe: ' : 'Cantidad: '}
            <strong className="text-gray-800 dark:text-white">
              {metric === 'importe'
                ? formatCurrency(payload[0].value)
                : formatQuantity(payload[0].value)}
            </strong>
          </p>
          <p className="text-gray-600 dark:text-gray-400">
            Porcentaje: <strong className="text-gray-800 dark:text-white">{percentage}%</strong>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={400}>
      <PieChart>
        <defs>
          <filter id="shadow3DZona" x="-10%" y="-10%" width="120%" height="130%">
            <feOffset result="offOut" in="SourceGraphic" dx="0" dy="3" />
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
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          startAngle={90}
          endAngle={-270}
          filter="url(#shadow3DZona)"
          label={(props) => {
            const { cx, cy, midAngle, outerRadius, percent, index, value } = props;
            if (!cx || !cy || midAngle === undefined || !outerRadius || !percent || index === undefined || !value) {
              return null;
            }
            const total = data.reduce((sum, item) => sum + item.value, 0);
            const percentage = total > 0 ? ((value / total) * 100).toFixed(2) : '0.00';
            const RADIAN = Math.PI / 180;
            const radius = outerRadius + 20 * distanciaEtiquetas;
            const x = cx + radius * Math.cos(-midAngle * RADIAN);
            const y = cy + radius * Math.sin(-midAngle * RADIAN);
            const textAnchor = x > cx ? 'start' : 'end';
            const valorFormateado =
              metric === 'importe' ? formatCurrency(value) : formatQuantity(value);

            return (
              <text
                x={x}
                y={y}
                fill="#333"
                textAnchor={textAnchor}
                dominantBaseline="central"
                className="text-xs font-medium"
              >
                <tspan x={x} dy="0" className="font-bold">
                  {data[index]?.name} ({percentage}%)
                </tspan>
                <tspan x={x} dy="12" className="text-xs">
                  {valorFormateado}
                </tspan>
              </text>
            );
          }}
          labelLine={{ stroke: '#666', strokeWidth: 1 }}
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};
