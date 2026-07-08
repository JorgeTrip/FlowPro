// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import { useState, useRef, useEffect } from 'react';

interface SplitButtonProps {
  /** Texto del botón principal */
  textoPrincipal: string;
  /** Acción al hacer click en el botón principal */
  onPrincipalClick: () => void | Promise<void>;
  /** Opciones del menú desplegable */
  opciones: { label: string; icon?: string; onClick: () => void }[];
  /** Estado de deshabilitado */
  disabled?: boolean;
  /** Estado de carga */
  isLoading?: boolean;
}

/**
 * Botón de acción dual (Split Button).
 * - Parte izquierda: Ejecuta la acción principal.
 * - Parte derecha (chevron ▼): Despliega menú de opciones adicionales.
 */
export function SplitButton({
  textoPrincipal,
  onPrincipalClick,
  opciones,
  disabled = false,
  isLoading = false,
}: SplitButtonProps) {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Cerrar menú al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuAbierto(false);
      }
    };

    if (menuAbierto) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuAbierto]);

  const handlePrincipalClick = async () => {
    if (disabled || isLoading) return;
    await onPrincipalClick();
  };

  return (
    <div className="relative inline-flex" ref={menuRef}>
      {/* Botón Principal */}
      <button
        onClick={handlePrincipalClick}
        disabled={disabled || isLoading}
        className="px-4 py-2.5 rounded-l-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all shadow-md disabled:bg-gray-300 dark:disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed cursor-pointer border-r-0"
      >
        {isLoading ? (
          <span className="flex items-center space-x-2">
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>Sincronizando...</span>
          </span>
        ) : (
          textoPrincipal
        )}
      </button>

      {/* Botón Chevron */}
      <button
        onClick={() => setMenuAbierto(!menuAbierto)}
        disabled={disabled || isLoading}
        className="px-3 py-2.5 rounded-r-lg bg-blue-700 hover:bg-blue-800 text-white font-semibold transition-all shadow-md disabled:bg-gray-400 dark:disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed cursor-pointer border-l border-blue-500"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {menuAbierto ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          )}
        </svg>
      </button>

      {/* Menú Desplegable */}
      {menuAbierto && (
        <div className="absolute right-0 mt-2 w-56 rounded-lg bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-gray-800 shadow-xl z-50">
          <div className="py-1">
            {opciones.map((opcion, index) => (
              <button
                key={index}
                onClick={() => {
                  opcion.onClick();
                  setMenuAbierto(false);
                }}
                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2C2C2E] transition-colors flex items-center space-x-2"
              >
                {opcion.icon && <span>{opcion.icon}</span>}
                <span>{opcion.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
