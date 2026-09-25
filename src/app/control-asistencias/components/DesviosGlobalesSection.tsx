import React, { useState } from 'react';
import type { DayAnalysisRow, AsistenciaConfig } from '../types/asistencias';
import { renderFecha, Th, Td } from './TablasAsistenciasUI';
import { exportGlobalExcel } from '../services/exportadorAsistenciasExcel';

interface DesviosGlobalesSectionProps {
  violacionesGlobales: DayAnalysisRow[];
  defaults: AsistenciaConfig['defaults'];
  filtroTarde: boolean;
  setFiltroTarde: (v: boolean) => void;
  filtroRetiro: boolean;
  setFiltroRetiro: (v: boolean) => void;
  filtroAlmFranja: boolean;
  setFiltroAlmFranja: (v: boolean) => void;
  filtroAlmExced: boolean;
  setFiltroAlmExced: (v: boolean) => void;
}

export function DesviosGlobalesSection({
  violacionesGlobales,
  defaults,
  filtroTarde,
  setFiltroTarde,
  filtroRetiro,
  setFiltroRetiro,
  filtroAlmFranja,
  setFiltroAlmFranja,
  filtroAlmExced,
  setFiltroAlmExced,
}: DesviosGlobalesSectionProps) {
  const [openGlobal, setOpenGlobal] = useState(false);

  const handleExport = () => {
    exportGlobalExcel(violacionesGlobales, defaults);
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Empleados con desvíos</h3>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Filtrar por llegadas tarde, retiros anticipados y almuerzo fuera de condiciones.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <input type="checkbox" checked={filtroTarde} onChange={(e) => setFiltroTarde(e.target.checked)} /> Tarde
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <input type="checkbox" checked={filtroRetiro} onChange={(e) => setFiltroRetiro(e.target.checked)} /> Salida antes
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <input type="checkbox" checked={filtroAlmFranja} onChange={(e) => setFiltroAlmFranja(e.target.checked)} /> Alm. fuera franja
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <input type="checkbox" checked={filtroAlmExced} onChange={(e) => setFiltroAlmExced(e.target.checked)} /> Alm. excedido
          </label>
          <button
            onClick={() => setOpenGlobal((v) => !v)}
            className="rounded-md bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
          >
            {openGlobal ? 'Contraer' : 'Desplegar'}
          </button>
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <button
          onClick={handleExport}
          className="inline-flex items-center rounded-md bg-green-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-green-700"
        >
          Exportar Excel
        </button>
      </div>

      {openGlobal && (
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <Th>Empleado</Th>
                <Th>Fecha</Th>
                <Th>Desvío</Th>
                <Th>Programado</Th>
                <Th>Real</Th>
                <Th>Minutos</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {violacionesGlobales.map((r) => {
                const desvio =
                  r.tardanzaMin > 0
                    ? 'Llegada tarde'
                    : r.retiroAnticipadoMin > 0
                      ? 'Salida antes'
                      : r.almuerzoFueraFranja
                        ? 'Almuerzo fuera franja'
                        : 'Almuerzo excedido';

                let programado = '-';
                let real = '-';
                let minutos: number | undefined = undefined;
                if (desvio === 'Llegada tarde') {
                  programado = r.entradaProgramada;
                  real = r.horaEntrada || '-';
                  minutos = r.tardanzaMin;
                } else if (desvio === 'Salida antes') {
                  programado = r.salidaProgramada;
                  real = r.horaSalida || '-';
                  minutos = r.retiroAnticipadoMin;
                } else if (desvio === 'Almuerzo fuera franja') {
                  programado = `${defaults.almuerzoInicio} - ${defaults.almuerzoFin}`;
                  real = `${r.almuerzoInicio || '-'} - ${r.almuerzoFin || '-'}`;
                  minutos = r.almuerzoDuracionMin;
                } else if (desvio === 'Almuerzo excedido') {
                  programado = `${defaults.almuerzoDuracionMin} min`;
                  real = r.almuerzoDuracionMin !== undefined ? `${r.almuerzoDuracionMin} min` : '-';
                  minutos = r.almuerzoDuracionMin;
                }

                return (
                  <tr
                    key={`${r.empleado}-${r.fecha}-${desvio}`}
                    className="bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700"
                  >
                    <Td>{r.empleado}</Td>
                    <Td>{renderFecha(r.fecha)}</Td>
                    <Td>{desvio}</Td>
                    <Td>{programado}</Td>
                    <Td>{real}</Td>
                    <Td>{minutos !== undefined ? `${minutos} min` : '-'}</Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
