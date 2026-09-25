'use client';

import React from 'react';
import { useAnalisisAsistencias } from '../hooks/useAnalisisAsistencias';
import { DashboardEmpleadoSection } from './DashboardEmpleadoSection';
import { DesviosGlobalesSection } from './DesviosGlobalesSection';
import { DetalleAusenciasSection } from './DetalleAusenciasSection';

export function ResultsStep() {
  const {
    setStep,
    config,
    empleadoSel,
    setEmpleadoSel,
    empleadosOptions,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    filtroTarde,
    setFiltroTarde,
    filtroRetiro,
    setFiltroRetiro,
    filtroAlmFranja,
    setFiltroAlmFranja,
    filtroAlmExced,
    setFiltroAlmExced,
    analisisEmpleado,
    kpis,
    violacionesGlobales,
    ausenciasDetalle,
  } = useAnalisisAsistencias();

  return (
    <div className="space-y-8">
      <div className="flex justify-start">
        <button
          onClick={() => setStep(2)}
          className="rounded-md bg-gray-200 px-4 py-2 font-semibold text-gray-800 transition-colors hover:bg-gray-300 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500"
        >
          Volver
        </button>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <div className="text-sm font-medium text-gray-800 dark:text-gray-200">Rango de fechas</div>
            <div className="mt-2 flex items-center gap-2">
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="rounded-md border-gray-300 px-2 py-1 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
              <span className="text-gray-500">a</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="rounded-md border-gray-300 px-2 py-1 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
              <button
                onClick={() => {
                  setDateFrom('');
                  setDateTo('');
                }}
                className="rounded-md bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
              >
                Limpiar
              </button>
            </div>
            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Si solo completás una fecha, se filtrará solo ese día.
            </div>
          </div>
        </div>
      </div>

      <DashboardEmpleadoSection
        empleadoSel={empleadoSel}
        setEmpleadoSel={setEmpleadoSel}
        empleadosOptions={empleadosOptions}
        analisisEmpleado={analisisEmpleado}
        kpis={kpis}
      />

      <DesviosGlobalesSection
        violacionesGlobales={violacionesGlobales}
        defaults={config.defaults}
        filtroTarde={filtroTarde}
        setFiltroTarde={setFiltroTarde}
        filtroRetiro={filtroRetiro}
        setFiltroRetiro={setFiltroRetiro}
        filtroAlmFranja={filtroAlmFranja}
        setFiltroAlmFranja={setFiltroAlmFranja}
        filtroAlmExced={filtroAlmExced}
        setFiltroAlmExced={setFiltroAlmExced}
      />

      <DetalleAusenciasSection ausenciasDetalle={ausenciasDetalle} />
    </div>
  );
}
