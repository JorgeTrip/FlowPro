// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import React, { useState, useEffect } from 'react';
import { useEstimarDemandaStore } from '@/app/stores/estimarDemandaStore';
import { estimarDemanda } from '@/app/lib/demandEstimator';
import DataPreviewTable from './DataPreviewTable';
import { FormularioMapeoColumnas } from './FormularioMapeoColumnas';
import { deducirMapeoInicialDemanda } from '../services/deductorColumnasDemanda';

export function ConfigStep() {
  const {
    ventasColumnas,
    stockColumnas,
    ventasData,
    stockData,
    setStep,
    setConfiguracion,
    setResultados,
    setIsLoading,
    setError,
    ventasPreviewData,
    stockPreviewData,
  } = useEstimarDemandaStore();

  const [mapeo, setMapeo] = useState({
    ventas: { productoId: '', cantidad: '', fecha: '', descripcion: '' },
    stock: { productoId: '', cantidad: '', deposito: '', stockReservado: '', descripcion: '' },
  });

  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const ventasReady = mapeo.ventas.productoId && mapeo.ventas.cantidad && mapeo.ventas.fecha;
    const stockReady = mapeo.stock.productoId && mapeo.stock.cantidad && mapeo.stock.deposito;
    const descripcionReady = mapeo.ventas.descripcion || mapeo.stock.descripcion;
    setIsReady(!!(ventasReady && stockReady && descripcionReady));
  }, [mapeo]);

  useEffect(() => {
    if (ventasColumnas.length > 0 || stockColumnas.length > 0) {
      const sugerido = deducirMapeoInicialDemanda(ventasData, stockData, ventasColumnas, stockColumnas);
      setMapeo((prev) => ({
        ventas: {
          productoId: prev.ventas.productoId || sugerido.ventas.productoId,
          cantidad: prev.ventas.cantidad || sugerido.ventas.cantidad,
          fecha: prev.ventas.fecha || sugerido.ventas.fecha,
          descripcion: prev.ventas.descripcion || sugerido.ventas.descripcion,
        },
        stock: {
          productoId: prev.stock.productoId || sugerido.stock.productoId,
          cantidad: prev.stock.cantidad || sugerido.stock.cantidad,
          deposito: prev.stock.deposito || sugerido.stock.deposito,
          stockReservado: prev.stock.stockReservado || sugerido.stock.stockReservado,
          descripcion: prev.stock.descripcion || sugerido.stock.descripcion,
        },
      }));
    }
  }, [ventasColumnas, stockColumnas, ventasData, stockData]);

  const handleMapeoChange = (fileType: 'ventas' | 'stock', campo: string, valor: string) => {
    setMapeo((prev) => {
      const newState = {
        ...prev,
        [fileType]: { ...prev[fileType], [campo]: valor },
      };
      if (campo === 'descripcion' && valor) {
        const otro = fileType === 'ventas' ? 'stock' : 'ventas';
        newState[otro].descripcion = '';
      }
      return newState;
    });
  };

  const handleAnalizar = () => {
    if (!isReady) {
      setError('Por favor, complete todos los campos de mapeo requeridos antes de continuar.');
      return;
    }

    setIsLoading(true);
    try {
      setConfiguracion({ mapeo });
      const resultados = estimarDemanda(ventasData, stockData, mapeo);
      setResultados(resultados);
      setStep(3);
    } catch (err: any) {
      setError(err?.message || 'Error durante el análisis.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Paso 2: Mapeo de Columnas</h3>
        <p className="ml-2 text-sm text-gray-900 dark:text-gray-300">
          Asigne las columnas de sus archivos a los campos requeridos para el análisis.
        </p>
      </div>

      <FormularioMapeoColumnas
        mapeo={mapeo}
        ventasColumnas={ventasColumnas}
        stockColumnas={stockColumnas}
        onMapeoChange={handleMapeoChange}
      />

      <div className="space-y-8">
        <DataPreviewTable
          title="Vista Previa de Ventas"
          previewData={ventasPreviewData}
          columns={ventasColumnas}
        />
        <DataPreviewTable
          title="Vista Previa de Stock"
          previewData={stockPreviewData}
          columns={stockColumnas}
        />
      </div>

      <div className="flex justify-end pt-4">
        <button
          onClick={handleAnalizar}
          disabled={!isReady}
          className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-6 py-3 font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400 dark:disabled:bg-gray-500"
        >
          Iniciar Análisis
        </button>
      </div>
    </div>
  );
}
