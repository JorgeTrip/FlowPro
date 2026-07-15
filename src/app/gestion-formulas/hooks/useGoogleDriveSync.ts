// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
import { useState } from 'react';
import { useGestionFormulasStore } from '@/app/stores/gestionFormulasStore';
import { leerHojasExcel, procesarHojaEspecifica } from '../lib/lectorExcel';

export function useGoogleDriveSync() {
  const store = useGestionFormulasStore();
  const [hojasDisponibles, setHojasDisponibles] = useState<string[]>([]);
  const [archivoConsolidadoDrive, setArchivoConsolidadoDrive] = useState<File | null>(null);
  const [solapasSeleccionadas, setSolapasSeleccionadas] = useState({
    formulas: '', stock: '', consumo: '', stockPT: '',
  });
  const [isSincronizando, setIsSincronizando] = useState(false);
  const [errorSincronizacion, setErrorSincronizacion] = useState<string | null>(null);
  const [fuenteSincronizando, setFuenteSincronizando] = useState<'formulas' | 'stock' | null>(null);

  const extraerIdDeUrl = (url: string): string | null => {
    const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/) || url.match(/[?&]id=([a-zA-Z0-9-_]+)/);
    return match ? match[1] : null;
  };

  const descargarDesdeDrive = async (url: string): Promise<File> => {
    const id = extraerIdDeUrl(url);
    if (!id) throw new Error('No se pudo extraer el ID del enlace de Google Drive');
    const response = await fetch(`/api/proxy-drive?id=${id}`);
    if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
    const buffer = await response.arrayBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    return new File([blob], 'planilla_drive.xlsx', { type: blob.type });
  };

  const procesarYGuardarHoja = async (file: File, hoja: string, destino: 'formulas' | 'stock' | 'consumo' | 'stockPT') => {
    if (!hoja) return;
    try {
      const { data, columns, previewData } = await procesarHojaEspecifica(file, hoja);
      if (destino === 'formulas') {
        store.setDatosCrudosFormulas(data, columns, previewData);
      } else if (destino === 'stock') {
        store.setDatosCrudosStock(data, columns, previewData);
      } else if (destino === 'consumo') {
        store.setDatosCrudosConsumo(data, columns, previewData);
      } else {
        store.setDatosCrudosStockPT(data, columns, previewData);
      }
    } catch (err: any) {
      throw new Error(`Error procesando la hoja '${hoja}': ${err.message}`);
    }
  };

  const sincronizarFormulas = async () => {
    const url = store.urlGoogleDriveFormulas;
    if (!url) return setErrorSincronizacion('No hay enlace de Drive configurado para fórmulas');
    setIsSincronizando(true); setFuenteSincronizando('formulas'); setErrorSincronizacion(null);
    try {
      const archivo = await descargarDesdeDrive(url);
      const hojas = await leerHojasExcel(archivo);
      const hoja = hojas.find((h) => h.toUpperCase() === 'BASE DE DATOS FORMULAS');
      if (!hoja) throw new Error('No se encontró la hoja "BASE DE DATOS FORMULAS"');
      await procesarYGuardarHoja(archivo, hoja, 'formulas');
    } catch (err: any) {
      setErrorSincronizacion(err.message); store.setError(err.message);
    } finally {
      setIsSincronizando(false); setFuenteSincronizando(null);
    }
  };

  const sincronizarStock = async () => {
    const url = store.urlGoogleDriveStock;
    if (!url) return setErrorSincronizacion('No hay enlace de Drive configurado para stock');
    setIsSincronizando(true); setFuenteSincronizando('stock'); setErrorSincronizacion(null);
    try {
      const archivo = await descargarDesdeDrive(url);
      const hojas = await leerHojasExcel(archivo);
      setHojasDisponibles(hojas); setArchivoConsolidadoDrive(archivo);

      const hojaRotacion = hojas.find((h) => h.toUpperCase() === 'BASE DE DATOS ROTACIÓN MENSUAL');
      const hojaStock = hojas.find((h) => h.toUpperCase() === 'BASE DE DATOS STOCK');
      const hojaStockPT = hojas.find((h) => h.toUpperCase() === 'BASE DE DATOS STOCK PT' || h.toUpperCase() === 'STOCK PT');

      if (!hojaStock) throw new Error('No se encontró la hoja obligatoria "BASE DE DATOS STOCK" en la planilla de Drive.');
      if (!hojaRotacion) throw new Error('No se encontró la hoja obligatoria "BASE DE DATOS ROTACIÓN MENSUAL" en la planilla de Drive.');

      setSolapasSeleccionadas({
        formulas: '',
        stock: hojaStock || '',
        consumo: hojaRotacion || '',
        stockPT: hojaStockPT || '',
      });

      if (hojaStock) await procesarYGuardarHoja(archivo, hojaStock, 'stock');
      if (hojaRotacion) await procesarYGuardarHoja(archivo, hojaRotacion, 'consumo');
      if (hojaStockPT) await procesarYGuardarHoja(archivo, hojaStockPT, 'stockPT');

      // Buscar e importar prefijos si no hay reglas cargadas
      const hojaPrefijos = hojas.find((h) =>
        ['prefijo de codigos - lineas pt', 'prefijo de codigos', 'lineas pt', 'prefijos'].some((k) =>
          h.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(k)
        )
      );
      if (hojaPrefijos) {
        const { importarPrefijosDesdeHoja } = await import('../lib/lectorExcel');
        await importarPrefijosDesdeHoja(archivo, hojaPrefijos);
      }
    } catch (err: any) {
      setErrorSincronizacion(err.message); store.setError(err.message);
    } finally {
      setIsSincronizando(false); setFuenteSincronizando(null);
    }
  };

  const handleCambioSolapa = async (destino: 'formulas' | 'stock' | 'consumo' | 'stockPT', hoja: string) => {
    setSolapasSeleccionadas((prev) => ({ ...prev, [destino]: hoja }));
    if (archivoConsolidadoDrive && hoja) {
      await procesarYGuardarHoja(archivoConsolidadoDrive, hoja, destino);
    }
  };

  return {
    hojasDisponibles,
    archivoConsolidadoDrive,
    solapasSeleccionadas,
    isSincronizando,
    fuenteSincronizando,
    errorSincronizacion,
    sincronizarFormulas,
    sincronizarStock,
    sincronizarTodo: async () => { await sincronizarFormulas(); await sincronizarStock(); },
    handleCambioSolapa,
    limpiarEstado: () => {
      setHojasDisponibles([]); setArchivoConsolidadoDrive(null);
      setSolapasSeleccionadas({ formulas: '', stock: '', consumo: '', stockPT: '' });
      setErrorSincronizacion(null);
    },
  };
}
