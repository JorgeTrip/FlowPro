// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import React from 'react';
import { useAppStore } from '@/app/stores/appStore';
import { Moon, Sun } from 'lucide-react';

interface ThemeSwitcherProps {
  estaColapsado?: boolean;
}

export function ThemeSwitcher({ estaColapsado = false }: ThemeSwitcherProps) {
  const configuracionGlobal = useAppStore((state) => state.configuracionGlobal);
  const toggleTheme = useAppStore((state) => state.toggleTheme);

  const esOscuro = configuracionGlobal.tema === 'dark';

  if (estaColapsado) {
    return (
      <button
        onClick={toggleTheme}
        title={esOscuro ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
        className="group relative flex h-10 w-10 items-center justify-center mx-auto rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
      >
        {esOscuro ? (
          <Moon className="h-5 w-5 text-indigo-400" />
        ) : (
          <Sun className="h-5 w-5 text-amber-500" />
        )}
      </button>
    );
  }

  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40 whitespace-nowrap overflow-x-hidden">
      <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap">Modo Oscuro</span>
      <button
        onClick={toggleTheme}
        className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-gray-200 transition-colors duration-200 ease-in-out focus:outline-none dark:bg-gray-700"
      >
        <span className="sr-only">Cambiar tema</span>
        <span
          className={`${esOscuro ? 'translate-x-5' : 'translate-x-0'}
            pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
        >
          <span
            className={`${esOscuro ? 'opacity-0 duration-100 ease-out' : 'opacity-100 duration-200 ease-in'}
              absolute inset-0 flex h-full w-full items-center justify-center transition-opacity`}
            aria-hidden="true"
          >
            <Sun className="h-3.5 w-3.5 text-amber-500" />
          </span>
          <span
            className={`${esOscuro ? 'opacity-100 duration-200 ease-in' : 'opacity-0 duration-100 ease-out'}
              absolute inset-0 flex h-full w-full items-center justify-center transition-opacity`}
            aria-hidden="true"
          >
            <Moon className="h-3.5 w-3.5 text-indigo-500" />
          </span>
        </span>
      </button>
    </div>
  );
}
