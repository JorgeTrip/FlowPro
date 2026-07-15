// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import { useState } from 'react';
import { useGestionFormulasStore } from '@/app/stores/gestionFormulasStore';
import { FileUpload } from '@/app/components/shared/FileUpload';
import { GoogleDriveSection } from './GoogleDriveSection';
import { useGoogleDriveSync } from '../hooks/useGoogleDriveSync';

export default function UploadStep() {
  const store = useGestionFormulasStore();
  const [archivoConsolidadoLocal, setArchivoConsolidadoLocal] = useState<File | null>(null);
  
  const [archivoPrefijosLocal, setArchivoPrefijosLocal] = useState<File | null>(null);

  const {
    hojasDisponibles,
    solapasSeleccionadas,
    handleCambioSolapa,
  } = useGoogleDriveSync();

  const listoParaContinuar =
    store.datosCrudosFormulas.length > 0 &&
    store.datosCrudosStock.length > 0 &&
    store.datosCrudosConsumo.length > 0;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <GoogleDriveSection />

      <div className="p-5 rounded-xl bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-gray-800 shadow-sm">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">Opción A: Cargar Planilla Consolidada (Recomendado)</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Arrastra un único libro de Excel que contenga solapas separadas para recetas, stock, consumos y maestro PT.
        </p>
        <FileUpload
          title="Planilla Consolidada de Tango"
          file={archivoConsolidadoLocal}
          onFileLoad={async (file) => {
            setArchivoConsolidadoLocal(file);
            store.setIsLoading(true); store.setError(null);
            try {
              const { leerHojasExcel, procesarHojaEspecifica, importarPrefijosDesdeHoja } = await import('../lib/lectorExcel');
              const hojas = await leerHojasExcel(file);
              const buscarSolapa = (keywords: string[]) => {
                return hojas.find((h: string) =>
                  keywords.some((k) =>
                    h.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(k)
                  )
                ) || '';
              };

              const solapaFormulas = buscarSolapa(['formula', 'receta', 'bom']);
              const solapaStock = buscarSolapa(['stock', 'saldo', 'inventario', 'existencia']);
              const solapaConsumo = buscarSolapa(['consumo', 'demanda', 'venta']);
              const solapaStockPT = buscarSolapa(['stock pt', 'maestro pt', 'productos terminados', 'pt']);
              const solapaPrefijos = buscarSolapa(['prefijo de codigos - lineas pt', 'prefijo de codigos', 'lineas pt', 'prefijos']);

              if (solapaFormulas) {
                const { data, columns, previewData } = await procesarHojaEspecifica(file, solapaFormulas);
                store.setArchivoFormulas(file); store.setDatosCrudosFormulas(data, columns, previewData);
              }
              if (solapaStock) {
                const { data, columns, previewData } = await procesarHojaEspecifica(file, solapaStock);
                store.setArchivoStock(file); store.setDatosCrudosStock(data, columns, previewData);
              }
              if (solapaConsumo) {
                const { data, columns, previewData } = await procesarHojaEspecifica(file, solapaConsumo);
                store.setArchivoConsumo(file); store.setDatosCrudosConsumo(data, columns, previewData);
              }
              if (solapaStockPT) {
                const { data, columns, previewData } = await procesarHojaEspecifica(file, solapaStockPT);
                store.setArchivoStockPT(file); store.setDatosCrudosStockPT(data, columns, previewData);
              }
              if (solapaPrefijos) {
                await importarPrefijosDesdeHoja(file, solapaPrefijos);
              }
            } catch (err: any) {
              store.setError(`Error al leer las solapas: ${err.message || err}`);
            } finally {
              store.setIsLoading(false);
            }
          }}
          setIsLoading={store.setIsLoading}
          setError={store.setError}
        />

        {hojasDisponibles.length > 0 && (
          <div className="mt-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-lg bg-gray-50 dark:bg-[#2C2C2E]/40 border border-gray-100 dark:border-gray-800">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase">Hoja de Fórmulas</label>
                <select value={solapasSeleccionadas.formulas} onChange={(e) => handleCambioSolapa('formulas', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 py-1.5 text-sm bg-white dark:bg-[#1C1C1E] dark:text-white">
                  <option value="">Seleccionar...</option>
                  {hojasDisponibles.map((h) => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase">Hoja de Stock</label>
                <select value={solapasSeleccionadas.stock} onChange={(e) => handleCambioSolapa('stock', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 py-1.5 text-sm bg-white dark:bg-[#1C1C1E] dark:text-white">
                  <option value="">Seleccionar...</option>
                  {hojasDisponibles.map((h) => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase">Hoja de Consumos</label>
                <select value={solapasSeleccionadas.consumo} onChange={(e) => handleCambioSolapa('consumo', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 py-1.5 text-sm bg-white dark:bg-[#1C1C1E] dark:text-white">
                  <option value="">Seleccionar...</option>
                  {hojasDisponibles.map((h) => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase">Hoja Maestro PT</label>
                <select value={solapasSeleccionadas.stockPT} onChange={(e) => handleCambioSolapa('stockPT', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 py-1.5 text-sm bg-white dark:bg-[#1C1C1E] dark:text-white">
                  <option value="">Seleccionar...</option>
                  {hojasDisponibles.map((h) => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 justify-center py-2 px-4 bg-blue-50/30 dark:bg-blue-950/10 border border-blue-100/30 dark:border-blue-900/20 rounded-xl text-xs font-bold">
              <div className="flex items-center space-x-1.5">
                <span className={`w-2.5 h-2.5 rounded-full ${store.datosCrudosFormulas.length > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-gray-700 dark:text-gray-300">Recetas: {store.datosCrudosFormulas.length}</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className={`w-2.5 h-2.5 rounded-full ${store.datosCrudosStock.length > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-gray-700 dark:text-gray-300">Existencias: {store.datosCrudosStock.length}</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className={`w-2.5 h-2.5 rounded-full ${store.datosCrudosConsumo.length > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-gray-700 dark:text-gray-300">Consumos: {store.datosCrudosConsumo.length}</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className={`w-2.5 h-2.5 rounded-full ${store.datosCrudosStockPT.length > 0 ? 'bg-green-500' : 'bg-amber-500'}`} />
                <span className="text-gray-700 dark:text-gray-300">Maestro PT: {store.datosCrudosStockPT.length}</span>
              </div>
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
              title="5. Prefijos de Códigos PT (Opcional)"
              file={archivoPrefijosLocal}
              onFileLoad={async (file) => {
                setArchivoPrefijosLocal(file);
                store.setIsLoading(true); store.setError(null);
                try {
                  const nombreArchivo = file.name.toLowerCase();
                  const { usePrefijosStore } = await import('@/app/stores/prefijosStore');
                  let contenido: any[] = [];

                  if (nombreArchivo.endsWith('.json')) {
                    const text = await file.text();
                    contenido = JSON.parse(text);
                  } else if (nombreArchivo.endsWith('.xlsx')) {
                    const { leerHojasExcel, procesarHojaEspecifica } = await import('../lib/lectorExcel');
                    const hojas = await leerHojasExcel(file);
                    const solapaPrefijos = hojas.find((h: string) =>
                      ['prefijo de codigos - lineas pt', 'prefijo de codigos', 'lineas pt', 'prefijos'].some((k) =>
                        h.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(k)
                      )
                    ) || hojas[0];
                    
                    if (solapaPrefijos) {
                      const { data } = await procesarHojaEspecifica(file, solapaPrefijos);
                      data.forEach((row: any) => {
                        const keys = Object.keys(row);
                        const findVal = (keywords: string[]) => {
                          const key = keys.find(k => keywords.some(kw => k.toLowerCase().includes(kw)));
                          return key ? row[key] : null;
                        };
                        const prefijo = findVal(['prefijo']);
                        const linea = findVal(['linea']);
                        const sitioFabricacion = findVal(['sitio', 'fabricacion', 'planta']);
                        const descripcion = findVal(['descripcion', 'detalle']);
                        if (prefijo && linea && sitioFabricacion) {
                          contenido.push({
                            prefijo: String(prefijo).trim(),
                            linea: String(linea).trim(),
                            sitioFabricacion: String(sitioFabricacion).trim().toUpperCase(),
                            descripcion: descripcion ? String(descripcion).trim() : undefined
                          });
                        }
                      });
                    }
                  } else if (nombreArchivo.endsWith('.csv')) {
                    const text = await file.text();
                    const lineas = text.split(/\r?\n/);
                    for (let i = 1; i < lineas.length; i++) {
                      const lineaStr = lineas[i].trim();
                      if (!lineaStr) continue;
                      
                      const celdas: string[] = [];
                      let dentroDeComillas = false;
                      let celdaActual = '';
                      for (let j = 0; j < lineaStr.length; j++) {
                        const char = lineaStr[j];
                        if (char === '"') {
                          dentroDeComillas = !dentroDeComillas;
                        } else if (char === ',' && !dentroDeComillas) {
                          celdas.push(celdaActual.trim());
                          celdaActual = '';
                        } else {
                          celdaActual += char;
                        }
                      }
                      celdas.push(celdaActual.trim());

                      const [prefijo, linea, sitioFabricacion, descripcion] = celdas;
                      if (prefijo && linea && sitioFabricacion) {
                        contenido.push({
                          prefijo: prefijo.replace(/^"(.*)"$/, '$1').trim(),
                          linea: linea.replace(/^"(.*)"$/, '$1').trim(),
                          sitioFabricacion: sitioFabricacion.replace(/^"(.*)"$/, '$1').trim().toUpperCase(),
                          descripcion: descripcion ? descripcion.replace(/^"(.*)"$/, '$1').trim() : undefined
                        });
                      }
                    }
                  } else {
                    store.setError('Formato no soportado para prefijos. Use .json, .csv o .xlsx');
                    return;
                  }

                  const resultado = usePrefijosStore.getState().importarReglas(contenido);
                  if (!resultado.exito) {
                    store.setError(resultado.mensaje);
                  }
                } catch (err: any) {
                  store.setError(`Error al importar prefijos: ${err.message || err}`);
                } finally {
                  store.setIsLoading(false);
                }
              }}
            />
          </div>
        </div>
      )}

      {store.error && <div className="p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg text-sm">{store.error}</div>}

      <div className="flex justify-end pt-4">
        <button onClick={() => store.setStep(2)} disabled={!listoParaContinuar || store.isLoading} className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all shadow-md disabled:bg-gray-300 dark:disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed cursor-pointer">
          Siguiente: Configurar Mapeo →
        </button>
      </div>
    </div>
  );
}
