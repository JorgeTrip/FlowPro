// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import { useGestionFormulasStore } from '@/app/stores/gestionFormulasStore';
import { useGoogleDriveSync } from '../hooks/useGoogleDriveSync';
import { VinculadorFuente } from './VinculadorFuente';

/**
 * Sección de sincronización con Google Drive.
 * Permite vincular 2 fuentes distintas: Fórmulas y Stock/Rotación.
 */
export function GoogleDriveSection() {
  const store = useGestionFormulasStore();
  const {
    isSincronizando,
    fuenteSincronizando,
    errorSincronizacion,
    sincronizarFormulas,
    sincronizarStock,
    sincronizarTodo,
    limpiarEstado,
  } = useGoogleDriveSync();

  const todoSincronizado =
    store.datosCrudosFormulas.length > 0 &&
    store.datosCrudosStock.length > 0 &&
    store.datosCrudosConsumo.length > 0;

  // Indicadores de carga en tiempo real para Fórmulas
  const formulasCargadas = store.datosCrudosFormulas.length;
  const statusFormulas = formulasCargadas > 0 ? (
    <div className="flex items-center space-x-2 text-xs font-semibold text-green-700 dark:text-green-400 bg-green-500/10 border border-green-500/20 px-2.5 py-1.5 rounded-lg shadow-sm">
      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
      <span>✓ {formulasCargadas.toLocaleString()} recetas cargadas correctamente</span>
    </div>
  ) : null;

  // Indicadores de carga en tiempo real para Stock y Rotación
  const stockCargado = store.datosCrudosStock.length;
  const consumoCargado = store.datosCrudosConsumo.length;
  const stockPTCargado = store.datosCrudosStockPT.length;
  
  const statusStock = (stockCargado > 0 || consumoCargado > 0 || stockPTCargado > 0) ? (
    <div className="space-y-1.5 p-2.5 rounded-lg bg-green-500/10 border border-green-500/20 shadow-sm text-xs font-semibold">
      {stockCargado > 0 && (
        <div className="flex items-center space-x-2 text-green-700 dark:text-green-400">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
          <span>Existencias de Stock: {stockCargado.toLocaleString()} filas</span>
        </div>
      )}
      {consumoCargado > 0 && (
        <div className="flex items-center space-x-2 text-green-700 dark:text-green-400">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
          <span>Consumo Mensual: {consumoCargado.toLocaleString()} filas</span>
        </div>
      )}
      {stockPTCargado > 0 && (
        <div className="flex items-center space-x-2 text-green-700 dark:text-green-400">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
          <span>Maestro PT (STOCK PT): {stockPTCargado.toLocaleString()} filas</span>
        </div>
      )}
    </div>
  ) : null;

  return (
    <div className="p-5 rounded-xl bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
      <div>
        <h3 className="text-lg font-bold text-gray-800 dark:text-white">Sincronización con Google Drive</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Vincula las planillas de Google Drive para sincronizar fórmulas, stock y rotación mensual.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <VinculadorFuente
          titulo="Fórmulas"
          descripcion="Hoja: BASE DE DATOS FORMULAS"
          urlGuardada={store.urlGoogleDriveFormulas}
          onGuardarUrl={store.setUrlGoogleDriveFormulas}
          onCambiarEnlace={limpiarEstado}
          onSincronizar={sincronizarFormulas}
          isSincronizando={isSincronizando && fuenteSincronizando === 'formulas'}
          error={fuenteSincronizando === 'formulas' ? errorSincronizacion : null}
          statusComponent={statusFormulas}
        />

        <VinculadorFuente
          titulo="Stock y Rotación"
          descripcion="Hojas: BASE DE DATOS ROTACIÓN MENSUAL y BASE DE DATOS STOCK"
          urlGuardada={store.urlGoogleDriveStock}
          onGuardarUrl={store.setUrlGoogleDriveStock}
          onCambiarEnlace={limpiarEstado}
          onSincronizar={sincronizarStock}
          isSincronizando={isSincronizando && fuenteSincronizando === 'stock'}
          error={fuenteSincronizando === 'stock' ? errorSincronizacion : null}
          statusComponent={statusStock}
        />

        {store.urlGoogleDriveFormulas && store.urlGoogleDriveStock && (
          <div className="space-y-3 pt-2">
            <button
              onClick={sincronizarTodo}
              disabled={isSincronizando || todoSincronizado}
              className="w-full px-4 py-2.5 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold transition-all shadow-md disabled:bg-gray-300 dark:disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSincronizando ? 'Sincronizando todo...' : todoSincronizado ? '✓ Todo sincronizado' : 'Sincronizar todo'}
            </button>

            {todoSincronizado && (
              <button
                onClick={() => store.setStep(2)}
                disabled={store.isLoading}
                className="w-full px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all shadow-md disabled:bg-gray-300 dark:disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed cursor-pointer"
              >
                Siguiente: Configurar Mapeo →
              </button>
            )}
          </div>
        )}
      </div>

      {errorSincronizacion && !fuenteSincronizando && (
        <div className="mt-3 p-3 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg text-sm">
          {errorSincronizacion}
        </div>
      )}
    </div>
  );
}
