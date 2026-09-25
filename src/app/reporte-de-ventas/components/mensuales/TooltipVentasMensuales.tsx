'use client';

import React from 'react';
import { formatCurrency, formatQuantity } from '../shared/GraficosUtils';
import { DatoGraficoMensual } from './types';

interface TooltipVentasMensualesProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string; dataKey?: string }>;
  label?: string;
  data: DatoGraficoMensual[];
  mostrarVariacion: boolean;
}

export const TooltipVentasMensuales: React.FC<TooltipVentasMensualesProps> = ({
  active,
  payload,
  label,
  data,
  mostrarVariacion,
}) => {
  if (!active || !payload || !payload.length) return null;

  const dataPoint = data.find((d) => d.mes === label);

  return (
    <div className="p-3 bg-white border border-gray-300 rounded-md shadow-lg dark:bg-gray-800 dark:border-gray-600">
      <p className="font-bold text-sm mb-2">{label}</p>
      {payload.map((entry, index) => {
        const isQuantity = entry.dataKey?.includes('cantidad');
        const value = entry.value;
        let variacion = 0;

        if (mostrarVariacion && dataPoint?.tieneVariacion) {
          if (entry.dataKey === 'A') variacion = dataPoint.varA;
          else if (entry.dataKey === 'X') variacion = dataPoint.varX;
          else if (entry.dataKey === 'AX') variacion = dataPoint.varAX;
          else if (entry.dataKey === 'cantidadA') variacion = dataPoint.varCantA;
          else if (entry.dataKey === 'cantidadX') variacion = dataPoint.varCantX;
          else if (entry.dataKey === 'cantidadAX') variacion = dataPoint.varCantAX;
        }

        return (
          <div key={index} className="text-sm mb-1">
            <p style={{ color: entry.color }}>
              <span>{entry.name}: </span>
              <span className="font-bold">
                {isQuantity ? formatQuantity(value) : formatCurrency(value)}
              </span>
            </p>
            {mostrarVariacion && dataPoint?.tieneVariacion && (
              <p className="text-xs ml-4">
                <span
                  className={
                    variacion > 0
                      ? 'text-green-600'
                      : variacion < 0
                        ? 'text-red-600'
                        : 'text-gray-500'
                  }
                >
                  Var: {variacion > 0 ? '+' : ''}
                  {variacion.toFixed(1)}%
                </span>
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
};
