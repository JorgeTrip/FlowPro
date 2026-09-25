'use client';

import React from 'react';
import {
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { formatCurrency, formatQuantity } from '../shared/GraficosUtils';
import { DatoGraficoMensual } from './types';
import { TooltipVentasMensuales } from './TooltipVentasMensuales';
import { BarrasVentasMensuales } from './BarrasVentasMensuales';

export type { DatoGraficoMensual };

interface GraficoVentasMensualesProps {
  data: DatoGraficoMensual[];
  metrica: 'importe' | 'cantidad';
  modoVista: 'acumulado' | 'comparativo';
  mostrarVariacion: boolean;
  barSize: number;
  chartHeight: number;
}

export const GraficoVentasMensuales: React.FC<GraficoVentasMensualesProps> = ({
  data,
  metrica,
  modoVista,
  mostrarVariacion,
  barSize,
  chartHeight,
}) => {
  return (
    <ResponsiveContainer width="100%" height={chartHeight}>
      <BarChart
        data={data}
        margin={{ top: 80, right: 30, left: 20, bottom: 0 }}
        barCategoryGap={modoVista === 'comparativo' ? 12 : 6}
        barGap={modoVista === 'comparativo' ? 12 : 6}
      >
        <defs>
          <linearGradient id="colorBarA" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8884d8" stopOpacity={0.9} />
            <stop offset="100%" stopColor="#6c5ce7" stopOpacity={0.8} />
          </linearGradient>
          <linearGradient id="colorBarX" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#82ca9d" stopOpacity={0.9} />
            <stop offset="100%" stopColor="#6eb58a" stopOpacity={0.8} />
          </linearGradient>
          <filter id="shadowVentasMensuales" x="-10%" y="-10%" width="120%" height="130%">
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
        <XAxis dataKey="mes" angle={-45} textAnchor="end" height={60} interval={0} />
        <YAxis
          tickFormatter={(value) =>
            metrica === 'importe' ? formatCurrency(value, true) : formatQuantity(value, true)
          }
          domain={[0, (dataMax: number) => Math.round(dataMax * 1.4)]}
          padding={{ top: 70 }}
        />
        <Tooltip
          content={
            <TooltipVentasMensuales
              data={data}
              mostrarVariacion={mostrarVariacion}
            />
          }
        />
        <Legend />

        <BarrasVentasMensuales
          metrica={metrica}
          modoVista={modoVista}
          mostrarVariacion={mostrarVariacion}
          barSize={barSize}
          data={data}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};
