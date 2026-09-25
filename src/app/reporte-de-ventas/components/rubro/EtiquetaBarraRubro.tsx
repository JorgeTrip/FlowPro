'use client';

import React from 'react';
import { DatoRubroComparativo } from './types';

interface EtiquetaBarraRubroProps {
  x?: string | number;
  y?: string | number;
  width?: string | number;
  height?: string | number;
  index?: number;
  value?: string | number;
  metric?: 'importe' | 'cantidad';
  data?: DatoRubroComparativo[];
  dataKey?: string;
  monthsOrder?: string[];
  showDelta?: boolean;
}

export const EtiquetaBarraRubro: React.FC<EtiquetaBarraRubroProps> = (props) => {
  const {
    x = 0,
    y = 0,
    width = 0,
    height = 0,
    value,
    metric,
    data,
    dataKey,
    index,
    monthsOrder,
    showDelta,
  } = props;
  if (!value) return null;

  const numX = typeof x === 'string' ? parseFloat(x) : x;
  const numY = typeof y === 'string' ? parseFloat(y) : y;
  const numWidth = typeof width === 'string' ? parseFloat(width) : width;
  const numHeight = typeof height === 'string' ? parseFloat(height) : height;

  if (numWidth < 20) return null;

  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  const formattedValue =
    metric === 'importe'
      ? new Intl.NumberFormat('es-AR', {
          style: 'currency',
          currency: 'ARS',
          maximumFractionDigits: 0,
        }).format(numValue)
      : new Intl.NumberFormat('es-AR').format(numValue);

  let percentageElement = null;

  if (showDelta && monthsOrder && dataKey && data && index !== undefined && index > -1) {
    const item = data[index];
    const monthIndex = monthsOrder.indexOf(String(dataKey));
    if (monthIndex > 0) {
      const prevMonthKey = monthsOrder[monthIndex - 1];
      const prevVal = (item[prevMonthKey] as number) || 0;
      if (prevVal > 0) {
        const delta = ((numValue - prevVal) / prevVal) * 100;
        const sign = delta > 0 ? '+' : '';
        const colorClass =
          delta > 0
            ? 'fill-green-600 dark:fill-green-400'
            : delta < 0
              ? 'fill-red-600 dark:fill-red-400'
              : 'fill-gray-500';

        percentageElement = (
          <tspan className={colorClass} dx="5" fontWeight="bold">
            ({sign}
            {delta.toFixed(1)}%)
          </tspan>
        );
      }
    }
  }

  return (
    <text
      x={numX + numWidth + 5}
      y={numY + numHeight / 2}
      textAnchor="start"
      dominantBaseline="middle"
      className="fill-gray-600 dark:fill-gray-400 text-xs font-medium"
    >
      {formattedValue}
      {percentageElement}
    </text>
  );
};
