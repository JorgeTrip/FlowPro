'use client';

import React from 'react';

export interface MultiSelectDropdownProps {
  label: string;
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  optionsWithData?: string[];
}

export const MultiSelectDropdown = ({
  label,
  options,
  selected,
  onChange,
  optionsWithData,
}: MultiSelectDropdownProps) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleToggle = (option: string) => {
    const newSelected = selected.includes(option)
      ? selected.filter((item) => item !== option)
      : [...selected, option];
    onChange(newSelected);
  };

  const handleSelectAll = () => {
    onChange(options);
  };

  const handleSelectNone = () => {
    onChange([]);
  };

  const handleSelectWithData = () => {
    if (optionsWithData) {
      onChange(optionsWithData);
    }
  };

  return (
    <div className="relative">
      <button
        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-40 p-2.5 text-left dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        {label} ({selected.length})
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>
          <div className="absolute top-full left-0 mt-1 w-56 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto">
            <div className="p-3">
              <div className="flex gap-2 mb-3 flex-wrap">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSelectAll();
                  }}
                  type="button"
                  className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                >
                  Todos
                </button>
                {optionsWithData && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleSelectWithData();
                    }}
                    type="button"
                    className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                  >
                    Con datos
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSelectNone();
                  }}
                  type="button"
                  className="text-xs bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600"
                >
                  Ninguno
                </button>
              </div>

              {options.map((option) => (
                <label key={option} className="flex items-center mb-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selected.includes(option)}
                    onChange={() => handleToggle(option)}
                    className="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-900 dark:text-white">{option}</span>
                </label>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
