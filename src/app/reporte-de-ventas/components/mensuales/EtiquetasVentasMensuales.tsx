'use client';

import React from 'react';
import { formatCurrency, formatQuantity } from '../shared/GraficosUtils';
import { DatoGraficoMensual } from './types';

interface SegmentLabelProps {
  x?: number | string;
  y?: number | string;
  width?: number | string;
  height?: number | string;
  value?: number | string;
  index?: number;
  serie?: string;
  data: DatoGraficoMensual[];
  metrica: 'importe' | 'cantidad';
  modoVista: 'acumulado' | 'comparativo';
  mostrarVariacion: boolean;
}

export const SegmentLabel: React.FC<SegmentLabelProps> = ({
  x,
  y,
  width,
  height = 0,
  value = 0,
  index,
  serie,
  data,
  metrica,
  modoVista,
  mostrarVariacion,
}) => {
  const numX = Number(x) || 0;
  const numY = Number(y) || 0;
  const numWidth = Number(width) || 0;
  const numHeight = Number(height) || 0;
  const numValue = Number(value) || 0;

  if (numValue <= 0 || numHeight < 20) return null;
  const labelX = numX + numWidth / 2;
  const labelY = numY + numHeight / 2;
  const formattedValue =
    metrica === 'importe' ? formatCurrency(numValue, true) : formatQuantity(numValue, true);

  let variationText = null;
  let variationVal = 0;
  if (modoVista === 'comparativo' && mostrarVariacion && typeof index === 'number' && index > 0) {
    const item = data[index];
    if (serie === 'A' || serie === 'cantidadA') {
      variationVal = metrica === 'importe' ? item.varA : item.varCantA;
    } else if (serie === 'X' || serie === 'cantidadX') {
      variationVal = metrica === 'importe' ? item.varX : item.varCantX;
    }

    if (item.tieneVariacion) {
      const sign = variationVal > 0 ? '+' : '';
      const colorClass =
        variationVal > 0
          ? 'fill-green-600 dark:fill-green-500'
          : variationVal < 0
            ? 'fill-red-600 dark:fill-red-500'
            : 'fill-gray-500';
      variationText = (
        <tspan x={labelX} dy="1.2em" className={`text-[13px] font-bold ${colorClass}`}>
          {`(${sign}${variationVal.toFixed(1)}%)`}
        </tspan>
      );
    }
  }

  const mainLen = formattedValue.length;
  const varLen = variationText ? (`(${variationVal.toFixed(1)}%)`).length + 2 : 0;
  const rectWidth = Math.max(mainLen * 7.5, varLen * 8.0) + 16;
  const rectHeight = variationText ? 34 : 20;
  const rectX = labelX - rectWidth / 2;
  const rectY = labelY - (variationText ? 18 : 10);

  return (
    <g>
      <rect
        x={rectX}
        y={rectY}
        rx={3}
        ry={3}
        width={rectWidth}
        height={rectHeight}
        style={{ fill: 'rgba(17, 24, 39, 0.72)' }}
      />
      <text x={labelX} y={labelY} textAnchor="middle" className="fill-white text-[12px] font-semibold">
        <tspan x={labelX} dy={variationText ? '-0.3em' : '0.35em'}>
          {formattedValue}
        </tspan>
        {variationText}
      </text>
    </g>
  );
};

interface TotalLabelProps {
  x?: number | string;
  y?: number | string;
  width?: number | string;
  index?: number;
  payload?: any;
  data: DatoGraficoMensual[];
  metrica: 'importe' | 'cantidad';
  modoVista: 'acumulado' | 'comparativo';
  mostrarVariacion: boolean;
}

export const TotalLabel: React.FC<TotalLabelProps> = ({
  x,
  y,
  width,
  index,
  payload,
  data,
  metrica,
  modoVista,
  mostrarVariacion,
}) => {
  const numX = Number(x) || 0;
  const numY = Number(y) || 0;
  const numWidth = Number(width) || 0;
  const dataItem = typeof index === 'number' && data[index] ? data[index] : payload;
  const total = metrica === 'importe' ? dataItem?.AX || 0 : dataItem?.cantidadAX || 0;

  if (!total || total <= 0) return null;
  const formattedValue =
    metrica === 'importe' ? formatCurrency(total, true) : formatQuantity(total, true);

  let delta = 0;
  let variationText: React.ReactNode | null = null;
  if (modoVista === 'comparativo' && mostrarVariacion && typeof index === 'number' && index > 0) {
    const prev = data[index - 1];
    const prevTotal = metrica === 'importe' ? prev.AX : prev.cantidadAX;
    if (prevTotal > 0) {
      delta = ((total - prevTotal) / prevTotal) * 100;
      const sign = delta > 0 ? '+' : '';
      const colorClass =
        delta > 0
          ? 'fill-green-600 dark:fill-green-500'
          : delta < 0
            ? 'fill-red-600 dark:fill-red-500'
            : 'fill-gray-500';
      variationText = (
        <tspan x={numX + numWidth / 2} dy="1.2em" className={`text-[13px] font-bold ${colorClass}`}>
          {`${sign}${delta.toFixed(1)}%`}
        </tspan>
      );
    }
  }

  const labelX = numX + numWidth / 2;
  const labelY = numY - 30;
  const mainLen = formattedValue.length;
  const varLen = variationText ? `${delta.toFixed(1)}%`.length + 1 : 0;
  const rectWidth = Math.max(mainLen * 8.0, varLen * 8.0) + 18;
  const rectHeight = variationText ? 36 : 24;
  const rectX = labelX - rectWidth / 2;
  const rectY = labelY - (variationText ? 22 : 14);

  return (
    <g>
      <rect
        x={rectX}
        y={rectY}
        rx={4}
        ry={4}
        width={rectWidth}
        height={rectHeight}
        style={{ fill: 'rgba(17, 24, 39, 0.72)' }}
      />
      <text x={labelX} y={labelY} textAnchor="middle" className="fill-white text-[13px] font-semibold">
        <tspan x={labelX} dy={variationText ? '-0.5em' : '0.3em'}>
          {formattedValue}
        </tspan>
        {variationText}
      </text>
    </g>
  );
};
