// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import { useState } from 'react';
import { useGestionFormulasStore } from '@/app/stores/gestionFormulasStore';
import { useGoogleDriveSync } from '../hooks/useGoogleDriveSync';
import { VinculadorFuente } from './VinculadorFuente';
import { usePrefijosStore } from '@/app/stores/prefijosStore';

/**
 * Sección de sincronización unificada con Google Drive.
 * Permite gestionar los enlaces de las 3 planillas obligatorias y sincronizarlas de forma conjunta.
 */
export function GoogleDriveSection() {
  const store = useGestionFormulasStore();
  const [errorLocal, setErrorLocal] = useState<string | null>(null);

  const {
    isSincronizando,
    errorSincronizacion,
    sincronizarTodo,
    limpiarEstado,
  } = useGoogleDriveSync();

  const reglasPrefijos = usePrefijosStore((state) => state.reglas) || [];
  const tienePrefijos = reglasPrefijos.length > 0 && !(reglasPrefijos.length === 1 && reglasPrefijos[0].id === 'semilla-1');
  const prefijosCargados = tienePrefijos ? reglasPrefijos.length : 0;

  const todoSincronizado =
    store.datosCrudosFormulas.length > 0 &&
    store.datosCrudosStock.length > 0 &&
    store.datosCrudosConsumo.length > 0 &&
    store.datosCrudosStockPT.length > 0 &&
    store.datosCrudosPedidosCompra.length > 0 &&
    tienePrefijos;

  const handleSincronizarConjunto = async () => {
    const faltantes: string[] = [];
    if (!store.urlGoogleDriveFormulas) faltantes.push('Fórmulas');
    if (!store.urlGoogleDriveStock) faltantes.push('Stock y Rotación');
    if (!store.urlGoogleDrivePedidosCompra) faltantes.push('Pedidos de Compra');

    if (faltantes.length > 0) {
      setErrorLocal(`Para sincronizar es obligatorio vincular las 3 planillas. Faltan: ${faltantes.join(', ')}.`);
      return;
    }

    setErrorLocal(null);
    await sincronizarTodo();
  };

  // Indicadores de carga en tiempo real
  const formulasCargadas = store.datosCrudosFormulas.length;
  const statusFormulas = formulasCargadas > 0 ? (
    <div className="flex items-center space-x-2 text-xs font-semibold text-green-700 dark:text-green-400 bg-green-500/10 border border-green-500/20 px-2.5 py-1.5 rounded-lg shadow-2xs">
      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
      <span>✓ {formulasCargadas.toLocaleString()} recetas cargadas correctamente</span>
    </div>
  ) : null;

  const pedidosCargados = store.datosCrudosPedidosCompra.length;
  const statusPedidosCompra = pedidosCargados > 0 ? (
    <div className="flex items-center space-x-2 text-xs font-semibold text-green-700 dark:text-green-400 bg-green-500/10 border border-green-500/20 px-2.5 py-1.5 rounded-lg shadow-2xs">
      <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
      <span>✓ {pedidosCargados.toLocaleString()} solicitudes de compra cargadas</span>
    </div>
  ) : null;

  const stockCargado = store.datosCrudosStock.length;
  const consumoCargado = store.datosCrudosConsumo.length;
  const rotacionSemiElabCargada = store.datosCrudosRotacionSemiElab.length;
  const stockPTCargado = store.datosCrudosStockPT.length;
  
  const statusStock = (stockCargado > 0 || consumoCargado > 0 || rotacionSemiElabCargada > 0 || stockPTCargado > 0) ? (
    <div className="space-y-1.5 p-2.5 rounded-lg bg-green-500/10 border border-green-500/20 shadow-2xs text-xs font-semibold">
      {stockCargado > 0 && <div className="text-green-700 dark:text-green-400">● Existencias de Stock: {stockCargado.toLocaleString()} filas</div>}
      {consumoCargado > 0 && <div className="text-green-700 dark:text-green-400">● Consumo Mensual: {consumoCargado.toLocaleString()} filas</div>}
      {rotacionSemiElabCargada > 0 && <div className="text-green-700 dark:text-green-400">● Rotación Semielaborados: {rotacionSemiElabCargada.toLocaleString()} filas</div>}
      {stockPTCargado > 0 && <div className="text-green-700 dark:text-green-400">● Maestro PT: {stockPTCargado.toLocaleString()} filas</div>}
      {prefijosCargados > 0 && <div className="text-green-700 dark:text-green-400">● Prefijos PT: {prefijosCargados.toLocaleString()} reglas</div>}
    </div>
  ) : null;

  const errorVisible = errorLocal || errorSincronizacion;

  return (
    <div className="p-5 rounded-xl bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
      <div>
        <h3 className="text-lg font-bold text-gray-800 dark:text-white">Sincronización con Google Drive</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Vincula los enlaces de las 3 planillas de Google Drive para sincronizar en un solo paso.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <VinculadorFuente
          titulo="Fórmulas"
          descripcion="Hoja: BASE DE DATOS FORMULAS"
          urlGuardada={store.urlGoogleDriveFormulas}
          onGuardarUrl={store.setUrlGoogleDriveFormulas}
          onCambiarEnlace={limpiarEstado}
          onBorrarUrl={() => { store.setUrlGoogleDriveFormulas(null); store.setDatosCrudosFormulas([], [], []); }}
          statusComponent={statusFormulas}
        />

        <VinculadorFuente
          titulo="Stock y Rotación"
          descripcion="Hojas: BASE DE DATOS ROTACIÓN MENSUAL, BASE DE DATOS STOCK y ROTACION SEMI ELAB"
          urlGuardada={store.urlGoogleDriveStock}
          onGuardarUrl={store.setUrlGoogleDriveStock}
          onCambiarEnlace={limpiarEstado}
          onBorrarUrl={() => {
            store.setUrlGoogleDriveStock(null);
            store.setDatosCrudosStock([], [], []);
            store.setDatosCrudosConsumo([], [], []);
            store.setDatosCrudosStockPT([], [], []);
          }}
          statusComponent={statusStock}
        />

        <VinculadorFuente
          titulo="Pedidos de Compra"
          descripcion="Hojas: Solicitud de compras y Solicitud Hierbas"
          urlGuardada={store.urlGoogleDrivePedidosCompra}
          onGuardarUrl={store.setUrlGoogleDrivePedidosCompra}
          onCambiarEnlace={limpiarEstado}
          onBorrarUrl={() => {
            store.setUrlGoogleDrivePedidosCompra(null);
            store.setDatosCrudosPedidosCompra([]);
          }}
          statusComponent={statusPedidosCompra}
        />

        <div className="space-y-3 pt-2">
          <button
            onClick={handleSincronizarConjunto}
            disabled={isSincronizando}
            className="w-full px-4 py-2.5 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold transition-all shadow-md disabled:bg-gray-300 dark:disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSincronizando ? 'Sincronizando las 3 planillas...' : todoSincronizado ? '✓ Sincronizar nuevamente' : 'Sincronizar planillas'}
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
      </div>

      {errorVisible && (
        <div className="mt-3 p-3 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg text-sm">
          {errorVisible}
        </div>
      )}
    </div>
  );
}
