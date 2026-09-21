// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import React from 'react';

interface SelectAsignacionProps {
  label: string;
  columnas: string[];
  value: string;
  onChange: (v: string) => void;
}

export const SelectAsignacion: React.FC<SelectAsignacionProps> = ({ label, columnas, value, onChange }) => (
  <div>
    <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="mt-1 block w-full max-w-xs rounded-md border-gray-300 bg-white py-2 pl-3 pr-10 text-base shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
    >
      <option value="">Seleccionar columna...</option>
      {columnas.map((col) => (
        <option key={col} value={col}>
          {col}
        </option>
      ))}
    </select>
  </div>
);
