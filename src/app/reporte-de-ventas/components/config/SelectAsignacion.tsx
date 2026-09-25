import React from 'react';

export const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 h-5 w-5 flex-shrink-0 text-green-500" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
  </svg>
);

interface SelectAsignacionProps {
  label: string;
  columnas: string[];
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export const SelectAsignacion: React.FC<SelectAsignacionProps> = ({
  label,
  columnas,
  value,
  onChange,
}) => (
  <div>
    <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
      {label}
      {value && <CheckIcon />}
    </label>
    <select
      value={value}
      onChange={onChange}
      className="mt-1 block w-full rounded-md border-gray-300 bg-white py-2 pl-3 pr-10 text-base shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
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
