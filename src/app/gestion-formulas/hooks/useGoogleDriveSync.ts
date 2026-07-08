// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
import { useState } from 'react';
import { useGestionFormulasStore } from '@/app/stores/gestionFormulasStore';
import { leerHojasExcel, procesarHojaEspecifica } from '../lib/lectorExcel';

/**
 * Hook personalizado para manejar la sincronización con Google Drive.
 * Extrae la lógica de negocio para mantener el componente UI limpio.
 */
export function useGoogleDriveSync() {
  const store = useGestionFormulasStore();
  const [hojasDisponibles, setHojasDisponibles] = useState<string[]>([]);
  const [archivoConsolidado, setArchivoConsolidado] = useState<File | null>(null);
  const [solapasSeleccionadas, setSolapasSeleccionadas] = useState({
    formulas: '',
    stock: '',
    consumo: '',
  });
  const [isSincronizando, setIsSincronizando] = useState(false);
  const [errorSincronizacion, setErrorSincronizacion] = useState<string | null>(null);

  /**
   * Extrae el ID de archivo de una URL de Google Drive.
   * Soporta formatos: /d/ID, /file/d/ID, y parámetros ?id=ID
   */
  const extraerIdDeUrl = (url: string): string | null => {
    try {
      const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/) || url.match(/[?&]id=([a-zA-Z0-9-_]+)/);
      return match ? match[1] : null;
    } catch {
      return null;
    }
  };

  /**
   * Descarga el archivo desde Google Drive usando el proxy local.
   */
  const descargarDesdeDrive = async (url: string): Promise<File> => {
    const id = extraerIdDeUrl(url);
    if (!id) {
      throw new Error('No se pudo extraer el ID del enlace de Google Drive');
    }

    const response = await fetch(`/api/proxy-drive?id=${id}`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al descargar el archivo');
    }

    const buffer = await response.arrayBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    return new File([blob], 'planilla_drive.xlsx', { type: blob.type });
  };

  /**
   * Procesa una hoja específica del archivo y guarda los datos en el store.
   */
  const procesarYGuardarHoja = async (file: File, hoja: string, destino: 'formulas' | 'stock' | 'consumo') => {
    if (!hoja) return;
    try {
      const { data, columns, previewData } = await procesarHojaEspecifica(file, hoja);
      
      if (destino === 'formulas') {
        store.setArchivoFormulas(file);
        store.setDatosCrudosFormulas(data, columns, previewData);
      } else if (destino === 'stock') {
        store.setArchivoStock(file);
        store.setDatosCrudosStock(data, columns, previewData);
      } else {
        store.setArchivoConsumo(file);
        store.setDatosCrudosConsumo(data, columns, previewData);
      }
    } catch (err: any) {
      throw new Error(`Error procesando la hoja '${hoja}': ${err.message}`);
    }
  };

  /**
   * Sincroniza el archivo desde Google Drive y pre-carga las solapas.
   */
  const sincronizarDesdeDrive = async () => {
    const url = store.urlGoogleDrive;
    if (!url) {
      setErrorSincronizacion('No hay un enlace de Google Drive configurado');
      return;
    }

    setIsSincronizando(true);
    setErrorSincronizacion(null);
    store.setError(null);

    try {
      // Ilusión de progreso elegante (Triada de Jorge)
      await new Promise((resolve) => setTimeout(resolve, 600));

      const archivo = await descargarDesdeDrive(url);
      const hojas = await leerHojasExcel(archivo);
      setHojasDisponibles(hojas);
      setArchivoConsolidado(archivo);

      const buscarSolapa = (keywords: string[]) => {
        return hojas.find((h) =>
          keywords.some((k) =>
            h.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(k)
          )
        ) || '';
      };

      const solapaFormulas = buscarSolapa(['formula', 'receta', 'bom']);
      const solapaStock = buscarSolapa(['stock', 'saldo', 'inventario', 'existencia']);
      const solapaConsumo = buscarSolapa(['consumo', 'demanda', 'venta']);

      const nuevasSolapas = {
        formulas: solapaFormulas,
        stock: solapaStock,
        consumo: solapaConsumo,
      };

      setSolapasSeleccionadas(nuevasSolapas);

      if (solapaFormulas) await procesarYGuardarHoja(archivo, solapaFormulas, 'formulas');
      if (solapaStock) await procesarYGuardarHoja(archivo, solapaStock, 'stock');
      if (solapaConsumo) await procesarYGuardarHoja(archivo, solapaConsumo, 'consumo');
    } catch (err: any) {
      const mensaje = err.message || 'Error al sincronizar con Google Drive';
      setErrorSincronizacion(mensaje);
      store.setError(mensaje);
    } finally {
      setIsSincronizando(false);
    }
  };

  /**
   * Maneja el cambio de solapa seleccionada.
   */
  const handleCambioSolapa = async (destino: 'formulas' | 'stock' | 'consumo', hoja: string) => {
    setSolapasSeleccionadas((prev) => ({ ...prev, [destino]: hoja }));
    if (archivoConsolidado && hoja) {
      await procesarYGuardarHoja(archivoConsolidado, hoja, destino);
    }
  };

  /**
   * Limpia el estado de sincronización.
   */
  const limpiarEstado = () => {
    setHojasDisponibles([]);
    setArchivoConsolidado(null);
    setSolapasSeleccionadas({ formulas: '', stock: '', consumo: '' });
    setErrorSincronizacion(null);
  };

  return {
    hojasDisponibles,
    archivoConsolidado,
    solapasSeleccionadas,
    isSincronizando,
    errorSincronizacion,
    sincronizarDesdeDrive,
    handleCambioSolapa,
    limpiarEstado,
  };
}
