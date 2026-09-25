// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import React from 'react';

const CheckIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="ml-2 h-5 w-5 flex-shrink-0 text-green-500"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
      clipRule="evenodd"
    />
  </svg>
);

interface SelectAsignacionProps {
  label: string;
  columnas: string[];
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  disabled?: boolean;
}

export const SelectAsignacion = ({
  label,
  columnas,
  value,
  onChange,
  disabled = false,
}: SelectAsignacionProps) => (
  <div>
    <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
      {label}
      {value && <CheckIcon />}
    </label>
    <select
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base shadow-sm transition-shadow duration-200 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm dark:border-gray-600 ${
        disabled
          ? 'cursor-not-allowed bg-gray-50 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
          : 'bg-white text-gray-900 hover:shadow-lg dark:bg-gray-700 dark:text-white dark:hover:shadow-lg dark:hover:shadow-gray-600/[.5]'
      }`}
    >
      <option value="">{disabled ? 'No aplicable' : 'Seleccionar columna...'}</option>
      {columnas.map((col) => (
        <option key={col} value={col}>
          {col}
        </option>
      ))}
    </select>
  </div>
);
