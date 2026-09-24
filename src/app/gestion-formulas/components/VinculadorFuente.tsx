// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import { useState } from 'react';

interface VinculadorFuenteProps {
  titulo: string;
  descripcion: string;
  urlGuardada: string | null;
  onGuardarUrl: (url: string) => void;
  onCambiarEnlace: () => void;
  onBorrarUrl?: () => void;
  statusComponent?: React.ReactNode;
}

/**
 * Componente modular que representa la UI de vinculación para una planilla de Google Drive.
 * Permite agregar, modificar y borrar el enlace a la hoja de cálculo.
 */
export function VinculadorFuente({
  titulo,
  descripcion,
  urlGuardada,
  onGuardarUrl,
  onCambiarEnlace,
  onBorrarUrl,
  statusComponent,
}: VinculadorFuenteProps) {
  const [mostrarInput, setMostrarInput] = useState(false);
  const [inputUrl, setInputUrl] = useState('');

  const handleGuardar = () => {
    if (inputUrl.trim()) {
      onGuardarUrl(inputUrl.trim());
      setMostrarInput(false);
      setInputUrl('');
    }
  };

  const handleCambiar = () => {
    setMostrarInput(true);
    setInputUrl(urlGuardada || '');
    onCambiarEnlace();
  };

  const handleBorrar = () => {
    if (onBorrarUrl) {
      onBorrarUrl();
    } else {
      onGuardarUrl('');
    }
    setMostrarInput(false);
    setInputUrl('');
  };

  return (
    <div className="p-4 rounded-lg bg-gray-50 dark:bg-[#2C2C2E]/40 border border-gray-200 dark:border-gray-700/60 shadow-xs">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="text-sm font-bold text-gray-800 dark:text-white mb-0.5">{titulo}</h4>
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-2.5">{descripcion}</p>
        </div>
      </div>

      {mostrarInput ? (
        <div className="space-y-2">
          <input
            type="url"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder="https://docs.google.com/spreadsheets/d/..."
            className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1C1C1E] text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
          <div className="flex space-x-2">
            <button
              onClick={handleGuardar}
              disabled={!inputUrl.trim()}
              className="px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-all disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed cursor-pointer"
            >
              Guardar
            </button>
            <button
              onClick={() => setMostrarInput(false)}
              className="px-3 py-1.5 rounded-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm font-semibold transition-all cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : urlGuardada ? (
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400">
            <span className="font-semibold">Enlace:</span>
            <span className="truncate max-w-xs sm:max-w-md font-mono text-[11px] text-gray-500 dark:text-gray-400">
              {urlGuardada}
            </span>
          </div>
          <div className="flex items-center gap-2 pt-0.5">
            <button
              onClick={handleCambiar}
              className="px-3 py-1.5 rounded-md bg-white dark:bg-[#1C1C1E] hover:bg-gray-100 dark:hover:bg-[#2C2C2E] text-gray-700 dark:text-gray-300 text-xs font-semibold transition-all cursor-pointer border border-gray-300 dark:border-gray-700 shadow-2xs"
            >
              Modificar enlace 🔗
            </button>
            <button
              onClick={handleBorrar}
              title="Eliminar enlace"
              className="px-2.5 py-1.5 rounded-md text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 text-xs font-semibold transition-all cursor-pointer"
            >
              Borrar 🗑️
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setMostrarInput(true)}
          className="px-3 py-1.5 rounded-md bg-white dark:bg-[#1C1C1E] hover:bg-gray-100 dark:hover:bg-[#2C2C2E] border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-semibold transition-all cursor-pointer shadow-2xs"
        >
          + Vincular enlace
        </button>
      )}

      {statusComponent && (
        <div className="mt-3">
          {statusComponent}
        </div>
      )}
    </div>
  );
}
