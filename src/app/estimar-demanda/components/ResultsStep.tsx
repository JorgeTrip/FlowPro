// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import React from 'react';
import { useStoreWithEqualityFn } from 'zustand/traditional';
import { useEstimarDemandaStore, EstimarDemandaState } from '@/app/stores/estimarDemandaStore';
import { shallow } from 'zustand/shallow';
import { RefreshCwIcon, Loader2, FileDownIcon } from 'lucide-react';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { DemandaStockChart, ChartData } from './DemandaStockChart';
import { ResultsTable } from './ResultsTable';
import { exportarResultadosDemandaExcel } from '../services/exportadorResultadosExcel';

export function ResultsStep() {
  const { resultados, isLoading, reset, reAnalizar } = useStoreWithEqualityFn(
    useEstimarDemandaStore,
    (state: EstimarDemandaState) => ({
      resultados: state.resultados,
      isLoading: state.isLoading,
      reset: state.reset,
      reAnalizar: state.reAnalizar,
    }),
    shallow
  );

  const handleExport = async () => {
    if (!resultados || resultados.length === 0) return;
    await exportarResultadosDemandaExcel(resultados);
  };

  const coverageData: ChartData[] = (resultados || []).reduce(
    (acc, item) => {
      const coverage = Math.floor(item.mesesCobertura);
      if (coverage < 1) acc[0].count++;
      else if (coverage < 2) acc[1].count++;
      else if (coverage < 3) acc[2].count++;
      else if (coverage < 3) acc[2].count++;
      else if (coverage < 4) acc[3].count++;
      else if (coverage === 4) acc[4].count++;
      else acc[5].count++;
      return acc;
    },
    [
      { name: '0 meses', count: 0, fill: '#ef4444' },
      { name: '1 mes', count: 0, fill: '#ef4444' },
      { name: '2 meses', count: 0, fill: '#ef4444' },
      { name: '3 meses', count: 0, fill: '#ef4444' },
      { name: '4 meses', count: 0, fill: '#facc15' },
      { name: '> 4 meses', count: 0, fill: '#22c55e' },
    ]
  );

  return (
    <div className="space-y-8">
      <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Paso 3: Resultados del Análisis</h3>
        <p className="ml-2 text-sm text-gray-900 dark:text-gray-300">
          Visualice la comparación entre el stock actual y la demanda, y las sugerencias de compra.
        </p>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <h4 className="font-semibold text-gray-800 dark:text-gray-200">Acciones</h4>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <button
            onClick={handleExport}
            className="inline-flex items-center justify-center rounded-md bg-green-600 px-4 py-2 font-semibold text-white shadow-sm transition-colors hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-gray-800"
          >
            <FileDownIcon className="mr-2 h-5 w-5" />
            Exportar a Excel
          </button>
          <button
            onClick={reAnalizar}
            disabled={isLoading}
            className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400 dark:disabled:bg-gray-500"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Analizando...
              </>
            ) : (
              <>
                <RefreshCwIcon className="mr-2 h-5 w-5" />
                Refrescar Análisis
              </>
            )}
          </button>
          <button
            onClick={reset}
            disabled={isLoading}
            className="inline-flex items-center justify-center rounded-md bg-gray-500 px-4 py-2 font-semibold text-white shadow-sm transition-colors hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ArrowPathIcon className="mr-2 h-5 w-5" />
            Realizar Nuevo Análisis
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Distribución de Productos por Cobertura de Stock
          </h4>
          <DemandaStockChart data={coverageData} />
        </div>
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h5 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Leyenda de Criticidad:</h5>
          <div className="flex flex-wrap gap-4 text-sm mb-3">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 bg-red-500 border border-red-700 rounded"></span>
              <span className="text-gray-900 dark:text-gray-300">Alta: Stock CABA insuficiente, sin stock en Entre Ríos o insuficiente</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 bg-yellow-400 border border-yellow-600 rounded"></span>
              <span className="text-gray-900 dark:text-gray-300">Media: Stock CABA insuficiente, pero hay stock disponible en Entre Ríos</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 bg-green-500 border border-green-700 rounded"></span>
              <span className="text-gray-900 dark:text-gray-300">Baja: Stock CABA suficiente (≥ 4 meses de cobertura)</span>
            </div>
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 border-t border-gray-300 dark:border-gray-600 pt-2">
            <strong>Nota:</strong> La lógica considera que si Entre Ríos tiene stock para 3+ meses de rotación, puede cubrir la demanda insatisfecha de CABA.
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Detalle del Análisis</h4>
        <ResultsTable data={resultados || []} />
      </div>
    </div>
  );
}
