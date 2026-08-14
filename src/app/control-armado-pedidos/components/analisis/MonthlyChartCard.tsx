// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import React from 'react';
import { InfoMes } from '../../utils/monthlyMetricsCalculator';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  LabelList,
} from 'recharts';

interface MonthlyChartCardProps {
  titulo: string;
  subtitulo: string;
  icono: React.ReactNode;
  datos: Array<{ empleado: string; [claveMes: string]: any }>;
  meses: InfoMes[];
  sufijo: string;
  onBarClick: (empleado: string, mesClave?: string) => void;
}

interface CustomBarLabelProps {
  x?: number;
  y?: number;
  width?: number;
  value?: any;
  etiquetaMes?: string;
  sufijo?: string;
}

function CustomBarLabel({ x = 0, y = 0, width = 0, value, etiquetaMes, sufijo }: CustomBarLabelProps) {
  if (value === undefined || value === null || value === 0) return null;
  const posX = x + width / 2;
  return (
    <text x={posX} y={y - 20} textAnchor="middle" fontSize={10} className="select-none pointer-events-none">
      <tspan x={posX} dy="0" fontSize={9} fontWeight="600" fill="#9CA3AF" className="fill-gray-500 dark:fill-gray-400">
        {etiquetaMes}
      </tspan>
      <tspan x={posX} dy="12" fontSize={10} fontWeight="bold" fill="#111827" className="fill-gray-900 dark:fill-gray-100">
        {value} {sufijo}
      </tspan>
    </text>
  );
}

export function MonthlyChartCard({
  titulo,
  subtitulo,
  icono,
  datos,
  meses,
  sufijo,
  onBarClick,
}: MonthlyChartCardProps) {

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-800 dark:bg-[#1C1C1E]">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h4 className="flex items-center space-x-2 text-sm font-bold text-gray-900 dark:text-gray-100">
            {icono}
            <span>{titulo}</span>
          </h4>
          <p className="text-xs text-gray-500 dark:text-gray-400">{subtitulo}</p>
        </div>
      </div>

      <div className="h-84 w-full min-h-[330px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={datos} margin={{ top: 35, right: 20, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
            <XAxis dataKey="empleado" stroke="#888888" fontSize={11} />
            <YAxis stroke="#888888" fontSize={11} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1C1C1E',
                borderColor: '#374151',
                borderRadius: '0.75rem',
                color: '#fff',
                fontSize: '11px',
              }}
              formatter={() => ['Haz clic en la barra para obtener más información', '']}
            />
            <Legend
              wrapperStyle={{ fontSize: '11px' }}
              formatter={(val: any) => {
                const mesInfo = meses.find((m) => m.clave === val);
                return mesInfo ? mesInfo.etiqueta : val;
              }}
            />
            {meses.map((m) => (
              <Bar
                key={m.clave}
                dataKey={m.clave}
                name={m.clave}
                fill={m.color}
                radius={[6, 6, 0, 0]}
                className="cursor-pointer hover:opacity-80 transition-opacity"
                onClick={(entry: any) => onBarClick(entry.empleado, m.clave)}
              >
                <LabelList dataKey={m.clave} content={<CustomBarLabel etiquetaMes={m.etiquetaCorta} sufijo={sufijo} />} />
              </Bar>
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
