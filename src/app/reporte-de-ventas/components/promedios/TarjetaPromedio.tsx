'use client';

import React from 'react';
import { formatCurrency, formatQuantity } from '../shared/GraficosUtils';

interface TarjetaPromedioProps {
  label: string;
  value: number;
  color: string;
  metrica: 'importe' | 'cantidad';
  esOscuro: boolean;
}

export const TarjetaPromedio: React.FC<TarjetaPromedioProps> = ({
  label,
  value,
  color,
  metrica,
  esOscuro,
}) => {
  return (
    <div
      className={`rounded-lg p-8 border shadow-sm min-h-[120px] ${
        esOscuro ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700' : 'bg-white border-gray-200'
      }`}
    >
      <div className="flex items-center justify-between h-full">
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium mb-2 ${esOscuro ? 'text-gray-400' : 'text-gray-600'}`}>
            {label}
          </p>
          <p className={`text-3xl font-bold break-words ${esOscuro ? 'text-white' : 'text-gray-900'}`}>
            {metrica === 'importe' ? formatCurrency(value) : formatQuantity(value)}
          </p>
        </div>
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center ml-4 flex-shrink-0"
          style={{ backgroundColor: color + '20' }}
        >
          <div className="w-8 h-8 rounded-full" style={{ backgroundColor: color }}></div>
        </div>
      </div>
    </div>
  );
};
