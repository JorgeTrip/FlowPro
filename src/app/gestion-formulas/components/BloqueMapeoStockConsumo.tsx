// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import SelectorMapeo from './SelectorMapeo';
import DataPreviewTable from './DataPreviewTable';

interface BloqueMapeoStockConsumoProps {
  store: any;
  mapeoLocal: any;
  setMapeoLocal: React.Dispatch<React.SetStateAction<any>>;
}

export default function BloqueMapeoStockConsumo({
  store,
  mapeoLocal,
  setMapeoLocal,
}: BloqueMapeoStockConsumoProps) {
  return (
    <div className="space-y-6">
      {/* Existencias */}
      <div className="p-4 rounded-xl bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-gray-800 dark:text-white flex items-center">
          <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs mr-2 font-bold font-mono">
            2
          </span>
          Existencias de Stock (MP / PT)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <SelectorMapeo label="Código Producto" columnas={store.columnasStock} value={mapeoLocal.stock.codigoProducto} onChange={(v) => setMapeoLocal((prev: any) => ({ ...prev, stock: { ...prev.stock, codigoProducto: v } }))} requerido />
          <SelectorMapeo label="Depósito / Ubicación" columnas={store.columnasStock} value={mapeoLocal.stock.deposito} onChange={(v) => setMapeoLocal((prev: any) => ({ ...prev, stock: { ...prev.stock, deposito: v } }))} requerido />
          <SelectorMapeo label="Stock Físico" columnas={store.columnasStock} value={mapeoLocal.stock.stockFisico} onChange={(v) => setMapeoLocal((prev: any) => ({ ...prev, stock: { ...prev.stock, stockFisico: v } }))} requerido />
          <SelectorMapeo label="Stock Reservado / Comprometido" columnas={store.columnasStock} value={mapeoLocal.stock.stockReservado} onChange={(v) => setMapeoLocal((prev: any) => ({ ...prev, stock: { ...prev.stock, stockReservado: v } }))} />
        </div>
        <DataPreviewTable previewData={store.previewStock} columns={store.columnasStock} title="Datos de Stock" columnasMapeadas={Object.values(mapeoLocal.stock)} />
      </div>

      {/* Consumos */}
      <div className="p-4 rounded-xl bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-gray-800 dark:text-white flex items-center">
          <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs mr-2 font-bold font-mono">
            3
          </span>
          Consumo Mensual (Rotación)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <SelectorMapeo label="Código Producto" columnas={store.columnasConsumo} value={mapeoLocal.consumo.codigoProducto} onChange={(v) => setMapeoLocal((prev: any) => ({ ...prev, consumo: { ...prev.consumo, codigoProducto: v } }))} requerido />
          <SelectorMapeo label="Rotación Mensual" columnas={store.columnasConsumo} value={mapeoLocal.consumo.cantidadConsumida} onChange={(v) => setMapeoLocal((prev: any) => ({ ...prev, consumo: { ...prev.consumo, cantidadConsumida: v } }))} requerido />
        </div>
        <DataPreviewTable previewData={store.previewConsumo} columns={store.columnasConsumo} title="Datos de Consumo" columnasMapeadas={Object.values(mapeoLocal.consumo)} />
      </div>

      {/* Consumos Semielaborados */}
      {store.datosCrudosRotacionSemiElab.length > 0 && (
        <div className="p-4 rounded-xl bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-gray-800 dark:text-white flex items-center">
            <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs mr-2 font-bold font-mono">
              3B
            </span>
            Consumo Semielaborados (Rotación)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <SelectorMapeo label="Código Producto" columnas={store.columnasRotacionSemiElab} value={mapeoLocal.consumoSemi.codigoProducto} onChange={(v) => setMapeoLocal((prev: any) => ({ ...prev, consumoSemi: { ...prev.consumoSemi, codigoProducto: v } }))} requerido />
            <SelectorMapeo label="Rotación Mensual" columnas={store.columnasRotacionSemiElab} value={mapeoLocal.consumoSemi.cantidadConsumida} onChange={(v) => setMapeoLocal((prev: any) => ({ ...prev, consumoSemi: { ...prev.consumoSemi, cantidadConsumida: v } }))} requerido />
          </div>
          <DataPreviewTable previewData={store.previewRotacionSemiElab} columns={store.columnasRotacionSemiElab} title="Datos de Consumo Semielaborados" columnasMapeadas={Object.values(mapeoLocal.consumoSemi)} />
        </div>
      )}

      {/* Maestro PT (STOCK PT) */}
      {store.datosCrudosStockPT.length > 0 && (
        <div className="p-4 rounded-xl bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-gray-800 dark:text-white flex items-center">
            <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs mr-2 font-bold font-mono">
              4
            </span>
            Maestro PT (STOCK PT)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <SelectorMapeo label="Código PT" columnas={store.columnasStockPT} value={mapeoLocal.stockPT.codigo} onChange={(v) => setMapeoLocal((prev: any) => ({ ...prev, stockPT: { ...prev.stockPT, codigo: v } }))} requerido />
            <SelectorMapeo label="Descripción PT" columnas={store.columnasStockPT} value={mapeoLocal.stockPT.descripcion} onChange={(v) => setMapeoLocal((prev: any) => ({ ...prev, stockPT: { ...prev.stockPT, descripcion: v } }))} requerido />
            <SelectorMapeo label="Descripción Adicional" columnas={store.columnasStockPT} value={mapeoLocal.stockPT.descripcionAdicional} onChange={(v) => setMapeoLocal((prev: any) => ({ ...prev, stockPT: { ...prev.stockPT, descripcionAdicional: v } }))} />
          </div>
          <DataPreviewTable previewData={store.previewStockPT} columns={store.columnasStockPT} title="Datos Maestro PT" columnasMapeadas={Object.values(mapeoLocal.stockPT)} />
        </div>
      )}
    </div>
  );
}
