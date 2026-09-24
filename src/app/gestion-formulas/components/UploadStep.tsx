// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import { useState } from 'react';
import { useGestionFormulasStore } from '@/app/stores/gestionFormulasStore';
import { FileUpload } from '@/app/components/shared/FileUpload';
import { GoogleDriveSection } from './GoogleDriveSection';
import { useGoogleDriveSync } from '../hooks/useGoogleDriveSync';
import { usePrefijosStore } from '@/app/stores/prefijosStore';
import { procesarArchivoPrefijos } from '../lib/importarPrefijosLocal';
import { procesarLibroPedidosCompra } from '../lib/lectorPedidosCompra';

export default function UploadStep() {
  const store = useGestionFormulasStore();
  const [archivoConsolidadoLocal, setArchivoConsolidadoLocal] = useState<File | null>(null);
  const [archivoPrefijosLocal, setArchivoPrefijosLocal] = useState<File | null>(null);
  const [archivoPedidosLocal, setArchivoPedidosLocal] = useState<File | null>(null);

  const { hojasDisponibles, solapasSeleccionadas, handleCambioSolapa } = useGoogleDriveSync();
  const reglasPrefijos = usePrefijosStore((state) => state.reglas) || [];
  const tienePrefijos = reglasPrefijos.length > 0 && !(reglasPrefijos.length === 1 && reglasPrefijos[0].id === 'semilla-1');

  const listoParaContinuar =
    store.datosCrudosFormulas.length > 0 &&
    store.datosCrudosStock.length > 0 &&
    store.datosCrudosConsumo.length > 0 &&
    store.datosCrudosStockPT.length > 0 &&
    store.datosCrudosPedidosCompra.length > 0 &&
    tienePrefijos;

  const handleProcesarConsolidado = async (file: File) => {
    setArchivoConsolidadoLocal(file);
    store.setIsLoading(true); store.setError(null);
    try {
      const { leerHojasExcel, procesarHojaEspecifica, importarPrefijosDesdeHoja } = await import('../lib/lectorExcel');
      const hojas = await leerHojasExcel(file);
      const buscar = (keywords: string[]) =>
        hojas.find((h: string) => keywords.some((k) => h.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(k))) || '';

      const sFormulas = buscar(['formula', 'receta', 'bom']);
      const sStock = buscar(['stock', 'saldo', 'inventario', 'existencia']);
      const sConsumo = buscar(['consumo', 'demanda', 'venta']);
      const sStockPT = buscar(['stock pt', 'maestro pt', 'productos terminados', 'pt']);
      const sPrefijos = buscar(['prefijo de codigos - lineas pt', 'prefijo de codigos', 'lineas pt', 'prefijos']);

      if (!sFormulas) throw new Error('No se encontró la solapa de Fórmulas / Recetas.');
      if (!sStock) throw new Error('No se encontró la solapa de Stock / Existencias.');
      if (!sConsumo) throw new Error('No se encontró la solapa de Consumos.');

      const { data: dF, columns: cF, previewData: pF } = await procesarHojaEspecifica(file, sFormulas);
      store.setArchivoFormulas(file); store.setDatosCrudosFormulas(dF, cF, pF);

      const { data: dS, columns: cS, previewData: pS } = await procesarHojaEspecifica(file, sStock);
      store.setArchivoStock(file); store.setDatosCrudosStock(dS, cS, pS);

      const { data: dC, columns: cC, previewData: pC } = await procesarHojaEspecifica(file, sConsumo);
      store.setArchivoConsumo(file); store.setDatosCrudosConsumo(dC, cC, pC);

      if (sStockPT) {
        const { data: dPT, columns: cPT, previewData: pPT } = await procesarHojaEspecifica(file, sStockPT);
        store.setArchivoStockPT(file); store.setDatosCrudosStockPT(dPT, cPT, pPT);
      }
      if (sPrefijos) await importarPrefijosDesdeHoja(file, sPrefijos);

      // Si el consolidado además contiene solapas de pedidos de compras, las procesamos
      try {
        const registrosPedidos = await procesarLibroPedidosCompra(file);
        if (registrosPedidos.length > 0) store.setDatosCrudosPedidosCompra(registrosPedidos);
      } catch { /* pedidos de compra se cargan habitualmente por separado */ }
    } catch (err: any) {
      store.setError(`Error al leer las solapas: ${err.message || err}`);
    } finally {
      store.setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <GoogleDriveSection />

      <div className="p-5 rounded-xl bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-gray-800 shadow-sm">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">Opción A: Cargar Planilla Consolidada</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Arrastra un único libro de Excel que contenga recetas, stock, consumos y maestro PT.
        </p>
        <FileUpload title="Planilla Consolidada de Tango" file={archivoConsolidadoLocal} onFileLoad={handleProcesarConsolidado} setIsLoading={store.setIsLoading} setError={store.setError} />

        {hojasDisponibles.length > 0 && (
          <div className="mt-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-lg bg-gray-50 dark:bg-[#2C2C2E]/40 border border-gray-100 dark:border-gray-800">
              {(['formulas', 'stock', 'consumo', 'stockPT'] as const).map((dest) => (
                <div key={dest}>
                  <label className="block text-xs font-bold text-gray-500 uppercase">{dest}</label>
                  <select value={solapasSeleccionadas[dest]} onChange={(e) => handleCambioSolapa(dest, e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 py-1.5 text-sm bg-white dark:bg-[#1C1C1E] dark:text-white">
                    <option value="">Seleccionar...</option>
                    {hojasDisponibles.map((h) => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {!archivoConsolidadoLocal && (
        <div className="p-5 rounded-xl bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white">Opción B: Cargar Archivos Individuales</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FileUpload title="1. Fórmulas / Recetas (BOM) *" file={store.archivoFormulas} onFileLoad={(f, d) => { store.setArchivoFormulas(f); store.setDatosCrudosFormulas(d.data, d.columns, d.previewData); }} />
            <FileUpload title="2. Existencias de Stock *" file={store.archivoStock} onFileLoad={(f, d) => { store.setArchivoStock(f); store.setDatosCrudosStock(d.data, d.columns, d.previewData); }} />
            <FileUpload title="3. Consumo Mensual *" file={store.archivoConsumo} onFileLoad={(f, d) => { store.setArchivoConsumo(f); store.setDatosCrudosConsumo(d.data, d.columns, d.previewData); }} />
            <FileUpload title="4. Maestro PT (STOCK PT)" file={store.archivoStockPT} onFileLoad={(f, d) => { store.setArchivoStockPT(f); store.setDatosCrudosStockPT(d.data, d.columns, d.previewData); }} />
            <FileUpload
              title="5. Pedidos de Compra *"
              file={archivoPedidosLocal || (store.datosCrudosPedidosCompra.length > 0 ? new File([], `${store.datosCrudosPedidosCompra.length} pedidos cargados`) : null)}
              onFileLoad={async (f) => {
                setArchivoPedidosLocal(f);
                store.setIsLoading(true); store.setError(null);
                try {
                  const regs = await procesarLibroPedidosCompra(f);
                  store.setDatosCrudosPedidosCompra(regs);
                } catch (err: any) {
                  store.setError(`Error en pedidos de compra: ${err.message || err}`);
                } finally {
                  store.setIsLoading(false);
                }
              }}
            />
            <FileUpload
              title="6. Prefijos de Códigos PT (Opcional)"
              file={archivoPrefijosLocal || (tienePrefijos ? new File([], 'Prefijos cargados') : null)}
              onFileLoad={async (f) => {
                setArchivoPrefijosLocal(f);
                store.setIsLoading(true); store.setError(null);
                try {
                  const res = await procesarArchivoPrefijos(f);
                  if (!res.exito) store.setError(res.mensaje || 'Error al procesar prefijos');
                } catch (err: any) {
                  store.setError(`Error en prefijos: ${err.message || err}`);
                } finally {
                  store.setIsLoading(false);
                }
              }}
            />
          </div>
        </div>
      )}

      {/* Resumen de estado de carga */}
      <div className="flex flex-wrap gap-4 justify-center py-2 px-4 bg-blue-50/30 dark:bg-blue-950/10 border border-blue-100/30 dark:border-blue-900/20 rounded-xl text-xs font-bold">
        <span className={store.datosCrudosFormulas.length > 0 ? 'text-green-600' : 'text-red-500'}>● Recetas: {store.datosCrudosFormulas.length}</span>
        <span className={store.datosCrudosStock.length > 0 ? 'text-green-600' : 'text-red-500'}>● Existencias: {store.datosCrudosStock.length}</span>
        <span className={store.datosCrudosConsumo.length > 0 ? 'text-green-600' : 'text-red-500'}>● Consumos: {store.datosCrudosConsumo.length}</span>
        <span className={store.datosCrudosStockPT.length > 0 ? 'text-green-600' : 'text-amber-500'}>● Maestro PT: {store.datosCrudosStockPT.length}</span>
        <span className={store.datosCrudosPedidosCompra.length > 0 ? 'text-green-600' : 'text-red-500'}>● Pedidos Compra: {store.datosCrudosPedidosCompra.length}</span>
        <span className={tienePrefijos ? 'text-green-600' : 'text-amber-500'}>● Prefijos: {reglasPrefijos.length}</span>
      </div>

      {store.error && <div className="p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg text-sm">{store.error}</div>}

      <div className="flex justify-end pt-4">
        <button onClick={() => store.setStep(2)} disabled={!listoParaContinuar || store.isLoading} className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all shadow-md disabled:bg-gray-300 dark:disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed cursor-pointer">
          Siguiente: Configurar Mapeo →
        </button>
      </div>
    </div>
  );
}
