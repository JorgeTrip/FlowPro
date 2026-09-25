// © 2025 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import React, { useState, useEffect } from 'react';
import { useReporteVentasStore, ExcelRow } from '@/app/stores/reporteVentasStore';
import DataPreviewTable from './DataPreviewTable';
import { SelectAsignacion } from './config/SelectAsignacion';
import { SeccionMapeoNomina } from './config/SeccionMapeoNomina';
import {
  detectarMapeoAutomaticoVentas,
  detectarMapeoAutomaticoNomina,
  MapeoVentas,
} from '../services/detectorColumnasVentas';

export function ConfigStep() {
  const {
    ventasFile,
    ventasColumnas,
    ventasPreviewData,
    nominaFile,
    nominaData,
    nominaColumnas,
    nominaPreviewData,
    setStep,
    setConfiguracion,
    generarReporte,
  } = useReporteVentasStore();

  const [mapeo, setMapeo] = useState<MapeoVentas>({
    Periodo: '',
    Fecha: '',
    TipoComprobante: '',
    NroComprobante: '',
    ReferenciaVendedor: '',
    RazonSocial: '',
    Cliente: '',
    Direccion: '',
    Articulo: '',
    Descripcion: '',
    Cantidad: '',
    PrecioUnitario: '',
    Total: '',
    TotalCIVA: '',
    DirectoIndirecto: '',
    DescRubro: '',
    DescripcionZona: '',
  });

  const [isInitialMapping, setIsInitialMapping] = useState(true);
  const [isReady, setIsReady] = useState(false);

  const [nominaMapeoLocal, setNominaMapeoLocal] = useState({
    RazonSocial: '',
    Vendedor: '',
  });
  const [isNominaInitialMapping, setIsNominaInitialMapping] = useState(true);

  useEffect(() => {
    if (ventasColumnas.length > 0 && isInitialMapping) {
      const automaticMapping = detectarMapeoAutomaticoVentas(ventasColumnas);
      setMapeo(automaticMapping);
      setIsInitialMapping(false);
    }
  }, [ventasColumnas, isInitialMapping]);

  useEffect(() => {
    if (nominaColumnas.length > 0 && isNominaInitialMapping) {
      const autoNominaMapeo = detectarMapeoAutomaticoNomina(nominaColumnas);
      setNominaMapeoLocal(autoNominaMapeo);
      setIsNominaInitialMapping(false);
    }
  }, [nominaColumnas, isNominaInitialMapping]);

  useEffect(() => {
    const isMapeoReady =
      mapeo.Fecha &&
      mapeo.Articulo &&
      mapeo.Descripcion &&
      mapeo.Cantidad &&
      mapeo.Cliente &&
      mapeo.ReferenciaVendedor &&
      mapeo.DescripcionZona &&
      mapeo.DescRubro &&
      mapeo.Total &&
      mapeo.TotalCIVA;
    setIsReady(!!isMapeoReady);
  }, [mapeo]);

  const handleMapeoChange = (field: keyof MapeoVentas, value: string) => {
    const newValue = value === 'Seleccionar columna...' ? '' : value;
    setMapeo((prev) => {
      const newMapeo = { ...prev };
      if (newValue) {
        Object.keys(newMapeo).forEach((key) => {
          if (key !== field && newMapeo[key as keyof MapeoVentas] === newValue) {
            newMapeo[key as keyof MapeoVentas] = '';
          }
        });
      }
      newMapeo[field] = newValue;
      return newMapeo;
    });
  };

  const handleAnalizar = () => {
    if (!isReady) return;
    setConfiguracion({
      mapeo,
      nominaMapeo:
        nominaMapeoLocal.RazonSocial && nominaMapeoLocal.Vendedor ? nominaMapeoLocal : undefined,
    });
    generarReporte();
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Paso 2: Configurar Reporte</h3>
      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
        Asigne las columnas de su archivo de ventas a los campos requeridos.
      </p>

      <div className="mt-8 space-y-8">
        <div className="rounded-md border border-gray-300 p-6 dark:border-gray-600">
          <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200">
            Archivo de Ventas: <span className="font-normal text-gray-600 dark:text-gray-400">{ventasFile?.name}</span>
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
            <div>
              {ventasFile && ventasPreviewData.length > 0 && (
                <DataPreviewTable
                  title="Previsualización de Ventas"
                  previewData={ventasPreviewData as ExcelRow[]}
                  columns={ventasColumnas}
                  highlightedColumns={Object.values(mapeo).filter((v): v is string => !!v && v !== '')}
                />
              )}
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <SelectAsignacion label="Fecha" columnas={ventasColumnas} value={mapeo.Fecha || ''} onChange={(e) => handleMapeoChange('Fecha', e.target.value)} />
              <SelectAsignacion label="Artículo (SKU)" columnas={ventasColumnas} value={mapeo.Articulo || ''} onChange={(e) => handleMapeoChange('Articulo', e.target.value)} />
              <SelectAsignacion label="Descripción" columnas={ventasColumnas} value={mapeo.Descripcion || ''} onChange={(e) => handleMapeoChange('Descripcion', e.target.value)} />
              <SelectAsignacion label="Cantidad" columnas={ventasColumnas} value={mapeo.Cantidad || ''} onChange={(e) => handleMapeoChange('Cantidad', e.target.value)} />
              <SelectAsignacion label="Cliente" columnas={ventasColumnas} value={mapeo.Cliente || ''} onChange={(e) => handleMapeoChange('Cliente', e.target.value)} />
              <SelectAsignacion label="Vendedor" columnas={ventasColumnas} value={mapeo.ReferenciaVendedor || ''} onChange={(e) => handleMapeoChange('ReferenciaVendedor', e.target.value)} />
              <SelectAsignacion label="Zona" columnas={ventasColumnas} value={mapeo.DescripcionZona || ''} onChange={(e) => handleMapeoChange('DescripcionZona', e.target.value)} />
              <SelectAsignacion label="Rubro" columnas={ventasColumnas} value={mapeo.DescRubro || ''} onChange={(e) => handleMapeoChange('DescRubro', e.target.value)} />
              <SelectAsignacion label="Total Sin IVA" columnas={ventasColumnas} value={mapeo.Total || ''} onChange={(e) => handleMapeoChange('Total', e.target.value)} />
              <SelectAsignacion label="Total Con IVA" columnas={ventasColumnas} value={mapeo.TotalCIVA || ''} onChange={(e) => handleMapeoChange('TotalCIVA', e.target.value)} />
            </div>
          </div>
        </div>

        {nominaFile && (
          <SeccionMapeoNomina
            nominaFile={nominaFile}
            nominaData={nominaData as ExcelRow[]}
            nominaColumnas={nominaColumnas}
            nominaPreviewData={nominaPreviewData as ExcelRow[]}
            nominaMapeoLocal={nominaMapeoLocal}
            setNominaMapeoLocal={setNominaMapeoLocal}
          />
        )}
      </div>

      <div className="mt-6">
        {isReady ? (
          <div className="flex items-center rounded-md bg-green-50 p-4 dark:bg-green-900/20">
            <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p className="ml-3 text-sm font-medium text-green-800 dark:text-green-200">
              ✅ Configuración completa. Los campos obligatorios están mapeados y listos para generar el reporte.
            </p>
          </div>
        ) : (
          <div className="flex items-center rounded-md bg-yellow-50 p-4 dark:bg-yellow-900/20">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p className="ml-3 text-sm font-medium text-yellow-800 dark:text-yellow-200">
              ⚠️ Faltan campos obligatorios: Todos los campos (Fecha, Artículo, Descripción, Cantidad, Cliente, Vendedor, Zona, Rubro y Totales) son requeridos para continuar.
            </p>
          </div>
        )}
      </div>

      <div className="mt-8 flex items-center justify-end space-x-4">
        <button onClick={() => setStep(1)} className="rounded-md bg-gray-200 px-4 py-2 font-semibold text-gray-800 transition-colors hover:bg-gray-300 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500">
          Volver
        </button>
        <button onClick={handleAnalizar} disabled={!isReady} className="rounded-md bg-blue-600 px-4 py-2 font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400 dark:disabled:bg-gray-500">
          Generar Reporte
        </button>
      </div>
    </div>
  );
}
