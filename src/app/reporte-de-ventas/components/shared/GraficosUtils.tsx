import React from 'react';

export const formatCurrency = (value: number, compacto: boolean = false): string => {
  if (compacto) {
    if (value >= 1000000) {
      const valorFormateado = (value / 1000000).toLocaleString('es-AR', {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      });
      return `$${valorFormateado} mill.`;
    } else if (value >= 1000) {
      return `$${value.toLocaleString('es-AR', { maximumFractionDigits: 0 })}`;
    } else {
      return `$${value.toLocaleString('es-AR', { maximumFractionDigits: 0 })}`;
    }
  }
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatQuantity = (value: number, compacto: boolean = false): string => {
  if (compacto) {
    if (value >= 1000000) {
      const valorFormateado = (value / 1000000).toLocaleString('es-AR', {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      });
      return `${valorFormateado} mill.`;
    }
    return value.toLocaleString('es-AR', { maximumFractionDigits: 0 });
  }
  return new Intl.NumberFormat('es-AR').format(value);
};

export const formatName = (name: string): string =>
  name
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');

export const formatearNumeroCompacto = (num: number, esMoneda: boolean): string => {
  if (num >= 1000000) {
    const valorFormateado = (num / 1000000).toLocaleString('es-AR', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    });
    return esMoneda ? `$${valorFormateado} mill.` : `${valorFormateado} mill.`;
  } else if (num >= 1000) {
    const valorFormateado = num.toLocaleString('es-AR', { maximumFractionDigits: 0 });
    return esMoneda ? `$${valorFormateado}` : `${valorFormateado}`;
  }
  const valorFormateado = num.toLocaleString('es-AR', { maximumFractionDigits: 0 });
  return esMoneda ? `$${valorFormateado}` : `${valorFormateado}`;
};

export interface CustomizedBarLabelProps {
  x?: string | number;
  y?: string | number;
  width?: string | number;
  height?: string | number;
  value?: string | number;
  metric: 'importe' | 'cantidad';
}

export const CustomizedBarLabel: React.FC<CustomizedBarLabelProps> = ({
  x = 0,
  y = 0,
  width = 0,
  height = 0,
  value,
  metric,
}) => {
  if (value === undefined || value === null || value === 0) return null;

  const numX = typeof x === 'string' ? parseFloat(x) : x;
  const numY = typeof y === 'string' ? parseFloat(y) : y;
  const numWidth = typeof width === 'string' ? parseFloat(width) : width;
  const numHeight = typeof height === 'string' ? parseFloat(height) : height;
  const numValue = typeof value === 'string' ? parseFloat(value) : value;

  const yPos = numHeight > 0 ? numY + numHeight / 2 : numY + 12;
  const formattedValue =
    metric === 'importe' ? formatCurrency(numValue, true) : formatQuantity(numValue, true);

  return (
    <text
      x={numX + numWidth + 5}
      y={yPos}
      textAnchor="start"
      dominantBaseline="middle"
      className="fill-gray-600 dark:fill-gray-400 text-xs font-medium"
    >
      {formattedValue}
    </text>
  );
};
