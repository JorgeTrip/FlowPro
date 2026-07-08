// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
import { useState } from 'react';
import { useGestionFormulasStore } from '@/app/stores/gestionFormulasStore';
import { leerHojasExcel, procesarHojaEspecifica } from '../lib/lectorExcel';

/**
 * Hook personalizado para manejar la sincronización con Google Drive.
 * Extrae la lógica de negocio para mantener el componente UI limpio.
 * Soporta 2 fuentes: Fórmulas y Stock/Rotación.
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
  const [fuenteSincronizando, setFuenteSincronizando] = useState<'formulas' | 'stock' | null>(null);

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
      let errorMessage = 'Error al descargar el archivo';
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
        if (errorData.preview) {
          errorMessage += ` (Contenido: ${errorData.preview}...)`;
        }
      } catch {
        errorMessage = `Error ${response.status}: ${response.statusText}`;
      }
      throw new Error(errorMessage);
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
   * Sincroniza las fórmulas desde Google Drive.
   * Descarga del link de fórmulas y procesa la hoja "BASE DE DATOS FORMULAS".
   */
  const sincronizarFormulas = async () => {
    const url = store.urlGoogleDriveFormulas;
    if (!url) {
      setErrorSincronizacion('No hay un enlace de Google Drive configurado para fórmulas');
      return;
    }

    setIsSincronizando(true);
    setFuenteSincronizando('formulas');
    setErrorSincronizacion(null);
    store.setError(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 600));

      const archivo = await descargarDesdeDrive(url);
      const hojas = await leerHojasExcel(archivo);

      const hojaFormulas = hojas.find((h) => 
        h.toUpperCase() === 'BASE DE DATOS FORMULAS'
      );

      if (!hojaFormulas) {
        throw new Error('No se encontró la hoja "BASE DE DATOS FORMULAS" en el archivo');
      }

      await procesarYGuardarHoja(archivo, hojaFormulas, 'formulas');
    } catch (err: any) {
      const mensaje = err.message || 'Error al sincronizar fórmulas desde Google Drive';
      setErrorSincronizacion(mensaje);
      store.setError(mensaje);
    } finally {
      setIsSincronizando(false);
      setFuenteSincronizando(null);
    }
  };

  /**
   * Sincroniza stock y rotación desde Google Drive.
   * Descarga del link de stock y procesa las hojas "BASE DE DATOS ROTACIÓN MENSUAL" y "BASE DE DATOS STOCK".
   */
  const sincronizarStock = async () => {
    const url = store.urlGoogleDriveStock;
    if (!url) {
      setErrorSincronizacion('No hay un enlace de Google Drive configurado para stock');
      return;
    }

    setIsSincronizando(true);
    setFuenteSincronizando('stock');
    setErrorSincronizacion(null);
    store.setError(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 600));

      const archivo = await descargarDesdeDrive(url);
      const hojas = await leerHojasExcel(archivo);
      setHojasDisponibles(hojas);
      setArchivoConsolidado(archivo);

      const hojaRotacion = hojas.find((h) => 
        h.toUpperCase() === 'BASE DE DATOS ROTACIÓN MENSUAL'
      );
      const hojaStock = hojas.find((h) => 
        h.toUpperCase() === 'BASE DE DATOS STOCK'
      );

      if (!hojaRotacion && !hojaStock) {
        throw new Error('No se encontraron las hojas "BASE DE DATOS ROTACIÓN MENSUAL" ni "BASE DE DATOS STOCK"');
      }

      const nuevasSolapas = {
        formulas: '',
        stock: hojaStock || '',
        consumo: hojaRotacion || '',
      };

      setSolapasSeleccionadas(nuevasSolapas);

      if (hojaStock) await procesarYGuardarHoja(archivo, hojaStock, 'stock');
      if (hojaRotacion) await procesarYGuardarHoja(archivo, hojaRotacion, 'consumo');
    } catch (err: any) {
      const mensaje = err.message || 'Error al sincronizar stock desde Google Drive';
      setErrorSincronizacion(mensaje);
      store.setError(mensaje);
    } finally {
      setIsSincronizando(false);
      setFuenteSincronizando(null);
    }
  };

  /**
   * Sincroniza ambas fuentes (fórmulas y stock).
   */
  const sincronizarTodo = async () => {
    await sincronizarFormulas();
    await sincronizarStock();
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
    fuenteSincronizando,
    errorSincronizacion,
    sincronizarFormulas,
    sincronizarStock,
    sincronizarTodo,
    handleCambioSolapa,
    limpiarEstado,
  };
}
