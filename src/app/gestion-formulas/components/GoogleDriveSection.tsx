// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import { useState } from 'react';
import { useGestionFormulasStore } from '@/app/stores/gestionFormulasStore';
import { SplitButton } from '@/app/components/shared/SplitButton';
import { useGoogleDriveSync } from '../hooks/useGoogleDriveSync';

/**
 * Sección de sincronización con Google Drive.
 * Permite vincular un enlace y sincronizar archivos mediante un botón de acción dual.
 */
export function GoogleDriveSection() {
  const store = useGestionFormulasStore();
  const [mostrarInputUrl, setMostrarInputUrl] = useState(false);
  const [inputUrl, setInputUrl] = useState('');

  const {
    isSincronizando,
    errorSincronizacion,
    sincronizarDesdeDrive,
    limpiarEstado,
  } = useGoogleDriveSync();

  const handleGuardarUrl = () => {
    if (inputUrl.trim()) {
      store.setUrlGoogleDrive(inputUrl.trim());
      setMostrarInputUrl(false);
      setInputUrl('');
    }
  };

  const handleCambiarEnlace = () => {
    setMostrarInputUrl(true);
    setInputUrl(store.urlGoogleDrive || '');
    limpiarEstado();
  };

  return (
    <div className="p-5 rounded-xl bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-gray-800 shadow-sm">
      <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">Sincronización con Google Drive</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Vincula una planilla de Google Drive para sincronizar automáticamente las solapas de recetas, stock y consumos.
      </p>

      {mostrarInputUrl ? (
        <div className="space-y-3">
          <input
            type="url"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder="https://docs.google.com/spreadsheets/d/..."
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#2C2C2E] text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
          <div className="flex space-x-3">
            <button
              onClick={handleGuardarUrl}
              disabled={!inputUrl.trim()}
              className="px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all shadow-md disabled:bg-gray-300 dark:disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed cursor-pointer"
            >
              Guardar enlace
            </button>
            <button
              onClick={() => setMostrarInputUrl(false)}
              className="px-4 py-2.5 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold transition-all cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : store.urlGoogleDrive ? (
        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <span className="font-semibold">Enlace vinculado:</span>
            <span className="truncate max-w-md">{store.urlGoogleDrive}</span>
          </div>
          <SplitButton
            textoPrincipal="Sincronizar desde Drive"
            onPrincipalClick={sincronizarDesdeDrive}
            isLoading={isSincronizando}
            opciones={[
              {
                label: 'Cambiar enlace de Google Drive 🔗',
                onClick: handleCambiarEnlace,
              },
            ]}
          />
        </div>
      ) : (
        <button
          onClick={() => setMostrarInputUrl(true)}
          className="px-4 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold transition-all cursor-pointer border border-gray-300 dark:border-gray-700"
        >
          + Vincular enlace de Google Drive
        </button>
      )}

      {errorSincronizacion && (
        <div className="mt-3 p-3 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg text-sm">
          {errorSincronizacion}
        </div>
      )}
    </div>
  );
}
