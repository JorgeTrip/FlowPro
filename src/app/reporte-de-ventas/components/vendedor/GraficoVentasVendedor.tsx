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
  Legend,
  LabelList,
} from 'recharts';
import { VendedorData } from './types';
import { EtiquetaBarraVendedor } from './EtiquetaBarraVendedor';

interface GraficoVentasVendedorProps {
  data: VendedorData[];
  metric: 'importe' | 'cantidad';
  modoVista: 'acumulado' | 'comparativo';
  mesesSeleccionados: string[];
  mostrarVariacion: boolean;
  maxValue: number;
  chartHeight: number;
}

const monthColors = [
  '#9F9AE3', '#6F6BB8', '#5A57A6', '#4B88A2', '#D34E24', '#C59B76',
  '#78A1BB', '#283D3B', '#197278', '#EDDDD4', '#C44536', '#772E25',
];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(value);
const formatQuantity = (value: number) =>
  new Intl.NumberFormat('es-AR').format(value);

export const GraficoVentasVendedor: React.FC<GraficoVentasVendedorProps> = ({
  data,
  metric,
  modoVista,
  mesesSeleccionados,
  mostrarVariacion,
  maxValue,
  chartHeight,
}) => {
  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: Array<{
      color: string;
      name: string;
      value: number;
      payload: VendedorData;
    }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      if (modoVista === 'acumulado') {
        const item = payload[0].payload;
        return (
          <div className="p-3 bg-gray-800 text-white rounded-lg shadow-xl border border-gray-700">
            <p className="font-bold mb-1 text-blue-300">{label}</p>
            <p className="text-sm">{`Porcentaje: ${item.porcentaje}`}</p>
            <p className="text-sm">{`Importe: ${formatCurrency(item.importe ?? 0)}`}</p>
            <p className="text-sm">{`Cantidad: ${formatQuantity(item.cantidad ?? 0)} u.`}</p>
          </div>
        );
      } else {
        return (
          <div className="p-3 bg-gray-800 text-white rounded-lg shadow-xl border border-gray-700">
            <p className="font-bold mb-2 text-blue-300">{label}</p>
            {payload.map((entry, index) => {
              let extra = '';
              if (mostrarVariacion && mesesSeleccionados.length > 1) {
                const monthIndex = mesesSeleccionados.indexOf(entry.name);
                if (monthIndex > 0) {
                  const prevMonth = mesesSeleccionados[monthIndex - 1];
                  const item = entry.payload;
                  const prevVal = (item[prevMonth] as number) || 0;
                  if (prevVal > 0) {
                    const delta = ((entry.value - prevVal) / prevVal) * 100;
                    const sign = delta > 0 ? '+' : '';
                    extra = ` (${sign}${delta.toFixed(1)}%)`;
                  }
                }
              }
              return (
                <p key={index} className="text-sm flex items-center gap-2 mb-1">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></span>
                  <span className="font-medium">{entry.name}:</span>
                  {metric === 'importe' ? formatCurrency(entry.value) : formatQuantity(entry.value)}
                  {extra}
                </p>
              );
            })}
          </div>
        );
      }
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
        barCategoryGap={modoVista === 'comparativo' ? '10%' : '20%'}
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

        {modoVista === 'acumulado' ? (
          <Bar
            dataKey="value"
            name={metric === 'importe' ? 'Ventas' : 'Cantidad'}
            fill="#6F6BB8"
            radius={[0, 4, 4, 0]}
          >
            <LabelList
              dataKey="value"
              content={(props) => (
                <EtiquetaBarraVendedor
                  {...props}
                  data={data}
                  dataKey="value"
                  metric={metric}
                />
              )}
            />
          </Bar>
        ) : (
          mesesSeleccionados.map((mes, index) => (
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
                  <EtiquetaBarraVendedor
                    {...props}
                    data={data}
                    dataKey={mes}
                    metric={metric}
                    monthsOrder={mesesSeleccionados}
                    showDelta={mostrarVariacion}
                  />
                )}
              />
            </Bar>
          ))
        )}
      </BarChart>
    </ResponsiveContainer>
  );
};
