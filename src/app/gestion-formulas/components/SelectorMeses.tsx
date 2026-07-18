// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import React from 'react';
import * as Select from '@radix-ui/react-select';

interface SelectorMesesProps {
  titulo: string;
  valor: number;
  setValor: (v: number) => void;
}

/**
 * Componente modular SelectorMeses
 *
 * Su responsabilidad es permitir al usuario seleccionar un rango de proyección en meses
 * para los cálculos de compra y transferencia, utilizando el selector estilizado de Radix UI.
 * Se extrae del componente principal para cumplir con la regla imperativa de modularización extrema (< 200 líneas).
 */
export default function SelectorMeses({ titulo, valor, setValor }: SelectorMesesProps) {
  return (
    <div className="flex flex-col">
      <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">
        {titulo}
      </span>
      <Select.Root value={String(valor)} onValueChange={(val) => setValor(Number(val))}>
        <Select.Trigger className="flex items-center justify-between h-9 w-36 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#2C2C2E] text-xs text-gray-700 dark:text-gray-300 px-3 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer shadow-sm hover:border-gray-400 transition-all">
          <Select.Value />
          <Select.Icon className="text-gray-400 text-[10px]">▼</Select.Icon>
        </Select.Trigger>
        <Select.Portal>
          <Select.Content className="overflow-hidden bg-white dark:bg-[#2C2C2E] rounded-lg shadow-lg border border-gray-200 dark:border-gray-800 z-50">
            <Select.Viewport className="p-1">
              {[1, 2, 3, 4, 5, 6].map((mes) => (
                <Select.Item
                  key={mes}
                  value={String(mes)}
                  className="relative flex items-center h-8 pl-8 pr-4 text-xs text-gray-700 dark:text-gray-300 rounded-md select-none focus:bg-blue-600 focus:text-white dark:focus:bg-blue-500 cursor-pointer outline-none transition-colors"
                >
                  <span className="absolute left-2.5 flex items-center justify-center">
                    <Select.ItemIndicator>✓</Select.ItemIndicator>
                  </span>
                  <Select.ItemText>
                    {mes} {mes === 1 ? 'Mes' : 'Meses'}
                  </Select.ItemText>
                </Select.Item>
              ))}
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    </div>
  );
}
