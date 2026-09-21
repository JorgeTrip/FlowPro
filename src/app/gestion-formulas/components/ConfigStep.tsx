// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import { useGestionFormulasStore } from '@/app/stores/gestionFormulasStore';
import { useProcesarImportacion } from '../hooks/useProcesarImportacion';
import { useMapeoColumnas } from '../hooks/useMapeoColumnas';
import SelectorMapeo from './SelectorMapeo';
import DataPreviewTable from './DataPreviewTable';

export default function ConfigStep() {
  const store = useGestionFormulasStore();
  const { procesarConfirmacion } = useProcesarImportacion();
  const { mapeoLocal, setMapeoLocal } = useMapeoColumnas(store);

  const handleConfirmar = async () => {
    store.setConfiguracionMapeo({
      formulas: mapeoLocal.formulas,
      stock: mapeoLocal.stock,
      productos: null,
      consumo: mapeoLocal.consumo,
      stockPT: store.datosCrudosStockPT.length > 0 ? mapeoLocal.stockPT : null,
      consumoSemi: store.datosCrudosRotacionSemiElab.length > 0 ? mapeoLocal.consumoSemi : null,
    });
    procesarConfirmacion();
  };

  const formulasReady = mapeoLocal.formulas.codigoProducto && mapeoLocal.formulas.codigoComponente && mapeoLocal.formulas.cantidad;
  const stockReady = mapeoLocal.stock.codigoProducto && mapeoLocal.stock.deposito && mapeoLocal.stock.stockFisico;
  const consumoReady = mapeoLocal.consumo.codigoProducto && mapeoLocal.consumo.cantidadConsumida;
  const stockPTReady = store.datosCrudosStockPT.length > 0 ? (mapeoLocal.stockPT.codigo && mapeoLocal.stockPT.descripcion) : true;
  const consumoSemiReady = store.datosCrudosRotacionSemiElab.length > 0 ? (mapeoLocal.consumoSemi.codigoProducto && mapeoLocal.consumoSemi.cantidadConsumida) : true;
  const listoParaImportar = formulasReady && stockReady && consumoReady && stockPTReady && consumoSemiReady;

  return (
    <div className="space-y-8 max-w-6xl mx-auto text-xs">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* BLOQUE 1: Fórmulas */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-gray-800 dark:text-white flex items-center">
            <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs mr-2 font-bold font-mono">1</span>
            Fórmulas / Recetas (BOM)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 rounded-lg bg-gray-50/50 dark:bg-[#2C2C2E]/20 border border-gray-100 dark:border-gray-850">
            <SelectorMapeo label="Cód. Producto Principal" columnas={store.columnasFormulas} value={mapeoLocal.formulas.codigoProducto} onChange={(v) => setMapeoLocal((prev) => ({ ...prev, formulas: { ...prev.formulas, codigoProducto: v } }))} requerido />
            <SelectorMapeo label="Desc. Producto Principal" columnas={store.columnasFormulas} value={mapeoLocal.formulas.descripcionProducto} onChange={(v) => setMapeoLocal((prev) => ({ ...prev, formulas: { ...prev.formulas, descripcionProducto: v } }))} />
            <SelectorMapeo label="Contenido / Presentación" columnas={store.columnasFormulas} value={mapeoLocal.formulas.contenido} onChange={(v) => setMapeoLocal((prev) => ({ ...prev, formulas: { ...prev.formulas, contenido: v } }))} />
            <SelectorMapeo label="Cód. Componente" columnas={store.columnasFormulas} value={mapeoLocal.formulas.codigoComponente} onChange={(v) => setMapeoLocal((prev) => ({ ...prev, formulas: { ...prev.formulas, codigoComponente: v } }))} requerido />
            <SelectorMapeo label="Desc. Componente" columnas={store.columnasFormulas} value={mapeoLocal.formulas.descripcionComponente} onChange={(v) => setMapeoLocal((prev) => ({ ...prev, formulas: { ...prev.formulas, descripcionComponente: v } }))} />
            <SelectorMapeo label="Cantidad Requerida" columnas={store.columnasFormulas} value={mapeoLocal.formulas.cantidad} onChange={(v) => setMapeoLocal((prev) => ({ ...prev, formulas: { ...prev.formulas, cantidad: v } }))} requerido />
            <SelectorMapeo label="U.M. Componente" columnas={store.columnasFormulas} value={mapeoLocal.formulas.unidadMedidaComponente} onChange={(v) => setMapeoLocal((prev) => ({ ...prev, formulas: { ...prev.formulas, unidadMedidaComponente: v } }))} />
          </div>
          <DataPreviewTable previewData={store.previewFormulas} columns={store.columnasFormulas} title="Datos de Fórmulas" columnasMapeadas={Object.values(mapeoLocal.formulas)} />
        </div>

        {/* BLOQUE 2: Stock, Consumo y PT */}
        <div className="space-y-6">
          {/* Existencias */}
          <div className="p-4 rounded-xl bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-gray-800 dark:text-white flex items-center">
              <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs mr-2 font-bold font-mono">2</span>
              Existencias de Stock (MP / PT)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <SelectorMapeo label="Código Producto" columnas={store.columnasStock} value={mapeoLocal.stock.codigoProducto} onChange={(v) => setMapeoLocal((prev) => ({ ...prev, stock: { ...prev.stock, codigoProducto: v } }))} requerido />
              <SelectorMapeo label="Depósito / Ubicación" columnas={store.columnasStock} value={mapeoLocal.stock.deposito} onChange={(v) => setMapeoLocal((prev) => ({ ...prev, stock: { ...prev.stock, deposito: v } }))} requerido />
              <SelectorMapeo label="Stock Físico" columnas={store.columnasStock} value={mapeoLocal.stock.stockFisico} onChange={(v) => setMapeoLocal((prev) => ({ ...prev, stock: { ...prev.stock, stockFisico: v } }))} requerido />
              <SelectorMapeo label="Stock Reservado" columnas={store.columnasStock} value={mapeoLocal.stock.stockReservado} onChange={(v) => setMapeoLocal((prev) => ({ ...prev, stock: { ...prev.stock, stockReservado: v } }))} />
            </div>
            <DataPreviewTable previewData={store.previewStock} columns={store.columnasStock} title="Datos de Stock" columnasMapeadas={Object.values(mapeoLocal.stock)} />
          </div>

          {/* Consumos */}
          <div className="p-4 rounded-xl bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-gray-800 dark:text-white flex items-center">
              <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs mr-2 font-bold font-mono">3</span>
              Consumo Mensual (Rotación)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <SelectorMapeo label="Código Producto" columnas={store.columnasConsumo} value={mapeoLocal.consumo.codigoProducto} onChange={(v) => setMapeoLocal((prev) => ({ ...prev, consumo: { ...prev.consumo, codigoProducto: v } }))} requerido />
              <SelectorMapeo label="Rotación Mensual" columnas={store.columnasConsumo} value={mapeoLocal.consumo.cantidadConsumida} onChange={(v) => setMapeoLocal((prev) => ({ ...prev, consumo: { ...prev.consumo, cantidadConsumida: v } }))} requerido />
            </div>
            <DataPreviewTable previewData={store.previewConsumo} columns={store.columnasConsumo} title="Datos de Consumo" columnasMapeadas={Object.values(mapeoLocal.consumo)} />
          </div>
          {/* Consumos Semielaborados */}
          {store.datosCrudosRotacionSemiElab.length > 0 && (
            <div className="p-4 rounded-xl bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-gray-800 dark:text-white flex items-center">
                <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs mr-2 font-bold font-mono">3B</span>
                Consumo Semielaborados (Rotación)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <SelectorMapeo label="Código Producto" columnas={store.columnasRotacionSemiElab} value={mapeoLocal.consumoSemi.codigoProducto} onChange={(v) => setMapeoLocal((prev) => ({ ...prev, consumoSemi: { ...prev.consumoSemi, codigoProducto: v } }))} requerido />
                <SelectorMapeo label="Rotación Mensual" columnas={store.columnasRotacionSemiElab} value={mapeoLocal.consumoSemi.cantidadConsumida} onChange={(v) => setMapeoLocal((prev) => ({ ...prev, consumoSemi: { ...prev.consumoSemi, cantidadConsumida: v } }))} requerido />
              </div>
              <DataPreviewTable previewData={store.previewRotacionSemiElab} columns={store.columnasRotacionSemiElab} title="Datos de Consumo Semielaborados" columnasMapeadas={Object.values(mapeoLocal.consumoSemi)} />
            </div>
          )}

          {/* Maestro PT (STOCK PT) */}
          {store.datosCrudosStockPT.length > 0 && (
            <div className="p-4 rounded-xl bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-gray-800 dark:text-white flex items-center">
                <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs mr-2 font-bold font-mono">4</span>
                Maestro PT (STOCK PT)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <SelectorMapeo label="Código PT" columnas={store.columnasStockPT} value={mapeoLocal.stockPT.codigo} onChange={(v) => setMapeoLocal((prev) => ({ ...prev, stockPT: { ...prev.stockPT, codigo: v } }))} requerido />
                <SelectorMapeo label="Descripción PT" columnas={store.columnasStockPT} value={mapeoLocal.stockPT.descripcion} onChange={(v) => setMapeoLocal((prev) => ({ ...prev, stockPT: { ...prev.stockPT, descripcion: v } }))} requerido />
                <SelectorMapeo label="Descripción Adicional" columnas={store.columnasStockPT} value={mapeoLocal.stockPT.descripcionAdicional} onChange={(v) => setMapeoLocal((prev) => ({ ...prev, stockPT: { ...prev.stockPT, descripcionAdicional: v } }))} />
              </div>
              <DataPreviewTable previewData={store.previewStockPT} columns={store.columnasStockPT} title="Datos Maestro PT" columnasMapeadas={Object.values(mapeoLocal.stockPT)} />
            </div>
          )}
        </div>
      </div>

      {store.error && <div className="p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg text-sm">{store.error}</div>}

      <div className="flex justify-between items-center pt-4">
        <button onClick={() => store.setStep(1)} className="px-5 py-2 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 transition-all font-semibold cursor-pointer">
          ← Volver a Carga
        </button>
        <button
          onClick={handleConfirmar}
          disabled={!listoParaImportar || store.isLoading}
          className="px-6 py-2.5 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold transition-all shadow-md disabled:bg-gray-300 dark:disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed cursor-pointer"
        >
          {store.isLoading ? 'Procesando Excel...' : 'Confirmar Mapeo e Importar ✔'}
        </button>
      </div>
    </div>
  );
}
