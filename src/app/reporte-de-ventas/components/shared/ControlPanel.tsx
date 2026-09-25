// 2025 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import React, { ReactNode } from 'react';
import { MultiSelectDropdown, MultiSelectDropdownProps } from './MultiSelectDropdown';

export { MultiSelectDropdown };
export type { MultiSelectDropdownProps };

interface ControlPanelProps {
  title: string;
  children: ReactNode;
  className?: string;
}

export const ControlPanel = ({ title, children, className = '' }: ControlPanelProps) => {
  return (
    <div className={`bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 p-4 mb-4 ${className}`}>
      <div className="flex flex-col gap-4">
        <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
          {title}
        </h5>
        <div className="flex flex-wrap items-center gap-3">
          {children}
        </div>
      </div>
    </div>
  );
};

interface ControlGroupProps {
  label?: string;
  children: ReactNode;
  className?: string;
}

export const ControlGroup = ({ label, children, className = '' }: ControlGroupProps) => {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && (
        <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
          {label}
        </label>
      )}
      <div className="flex items-center gap-2">
        {children}
      </div>
    </div>
  );
};

interface SwitchControlProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
}

export const SwitchControl = ({ checked, onChange, label, disabled = false }: SwitchControlProps) => {
  return (
    <label className={`flex items-center ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="sr-only peer"
      />
      <div className="border border-gray-300 dark:border-gray-500 relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[1px] after:left-[1px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 peer-disabled:cursor-not-allowed"></div>
      <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
        {label}
      </span>
    </label>
  );
};

interface SelectControlProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string; disabled?: boolean }[];
  className?: string;
}

export const SelectControl = ({ value, onChange, options, className = '' }: SelectControlProps) => {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 ${className}`}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value} disabled={option.disabled}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

interface ButtonControlProps {
  onClick: () => void;
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'icon';
  title?: string;
  className?: string;
}

export const ButtonControl = ({ onClick, children, variant = 'secondary', title, className = '' }: ButtonControlProps) => {
  const baseClasses = "inline-flex items-center text-sm font-medium rounded-lg transition-colors";
  
  const variantClasses = {
    primary: "px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white",
    secondary: "px-3 py-2 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600",
    icon: "p-2 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
  };

  return (
    <button
      onClick={onClick}
      title={title}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

interface RangeControlProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  label: string;
}

export const RangeControl = ({ value, onChange, min, max, step, label }: RangeControlProps) => {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-gray-600 dark:text-gray-400">{label}</label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-24 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
      />
      <span className="text-xs text-gray-500 text-center">{value}</span>
    </div>
  );
};
