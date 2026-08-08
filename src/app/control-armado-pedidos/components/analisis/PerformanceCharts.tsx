// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import React from 'react';
import { RendimientoEmpleado } from '../../types/armado';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ReferenceLine,
} from 'recharts';

interface PerformanceChartsProps {
  rendimiento: RendimientoEmpleado[];
  promedioEquipo: number;
}

export function PerformanceCharts({ rendimiento, promedioEquipo }: PerformanceChartsProps) {
  const dataChart = rendimiento.map((r) => ({
    empleado: r.empleado.split(' ')[0], // Nombre corto
    velocidad: r.velocidadArtHs,
    pedidos: r.totalPedidos,
    irregularidades: r.totalIrregularidades,
  }));

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Gráfico 1: Efectividad Individual vs Promedio del Equipo */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-800 dark:bg-[#1C1C1E]">
        <h3 className="mb-4 text-sm font-bold text-gray-900 dark:text-gray-100">
          Efectividad Individual vs Promedio del Equipo (Art / hs)
        </h3>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dataChart} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="empleado" stroke="#888888" fontSize={11} />
              <YAxis stroke="#888888" fontSize={11} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1C1C1E',
                  borderColor: '#374151',
                  borderRadius: '0.75rem',
                  color: '#fff',
                }}
              />
              <ReferenceLine
                y={promedioEquipo}
                label={{ value: `Prom: ${promedioEquipo} Art/hs`, fill: '#3B82F6', fontSize: 11 }}
                stroke="#3B82F6"
                strokeDasharray="4 4"
              />
              <Bar dataKey="velocidad" name="Artículos / hora" fill="#3B82F6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gráfico 2: Tasa de Irregularidades y Traspasos por Empleado */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-800 dark:bg-[#1C1C1E]">
        <h3 className="mb-4 text-sm font-bold text-gray-900 dark:text-gray-100">
          Pedidos Armados e Irregularidades Registradas
        </h3>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dataChart} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="empleado" stroke="#888888" fontSize={11} />
              <YAxis stroke="#888888" fontSize={11} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1C1C1E',
                  borderColor: '#374151',
                  borderRadius: '0.75rem',
                  color: '#fff',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Bar dataKey="pedidos" name="Total Pedidos" fill="#10B981" radius={[6, 6, 0, 0]} />
              <Bar dataKey="irregularidades" name="Irregularidades" fill="#F59E0B" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
