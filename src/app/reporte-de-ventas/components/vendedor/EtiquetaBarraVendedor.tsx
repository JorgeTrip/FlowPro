'use client';

import React from 'react';
import { VendedorData } from './types';

interface EtiquetaBarraVendedorProps {
  x?: string | number;
  y?: string | number;
  width?: string | number;
  height?: string | number;
  index?: number;
  data: VendedorData[];
  dataKey?: string;
  metric?: 'importe' | 'cantidad';
  monthsOrder?: string[];
  showDelta?: boolean;
}

export const EtiquetaBarraVendedor: React.FC<EtiquetaBarraVendedorProps> = (props) => {
  const {
    x = 0,
    y = 0,
    width = 0,
    height = 0,
    index,
    data,
    dataKey,
    metric,
    monthsOrder,
    showDelta,
  } = props;

  if (index === undefined || !data || !data[index] || !dataKey) {
    return null;
  }

  const numX = typeof x === 'string' ? parseFloat(x) : x;
  const numY = typeof y === 'string' ? parseFloat(y) : y;
  const numWidth = typeof width === 'string' ? parseFloat(width) : width;
  const numHeight = typeof height === 'string' ? parseFloat(height) : height;
  const item = data[index];

  const value = item[dataKey] as number | undefined;
  if (!value) return null;

  const formattedValue =
    metric === 'importe'
      ? new Intl.NumberFormat('es-AR', {
          style: 'currency',
          currency: 'ARS',
          maximumFractionDigits: 0,
        }).format(value)
      : new Intl.NumberFormat('es-AR').format(value);

  let percentageElement = null;

  if (showDelta && monthsOrder && dataKey && index !== undefined && index > -1) {
    const itemData = data[index];
    const monthIndex = monthsOrder.indexOf(String(dataKey));
    if (monthIndex > 0) {
      const prevMonthKey = monthsOrder[monthIndex - 1];
      const prevVal = (itemData[prevMonthKey] as number) || 0;
      if (prevVal > 0) {
        const delta = ((value - prevVal) / prevVal) * 100;
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
