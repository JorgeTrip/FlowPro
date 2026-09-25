import React, { useState } from 'react';
import type { DayAnalysisRow } from '../types/asistencias';
import { classNames, renderFecha, formatMin, Kpi, Th, Td } from './TablasAsistenciasUI';
import { exportDashboardExcel } from '../services/exportadorAsistenciasExcel';

interface DashboardEmpleadoSectionProps {
  empleadoSel: string;
  setEmpleadoSel: (emp: string) => void;
  empleadosOptions: string[];
  analisisEmpleado: DayAnalysisRow[];
  kpis: {
    total: number;
    tardes: number;
    retiros: number;
    almFuera: number;
    almExced: number;
    promTarde: number;
    ausentes: number;
  };
}

export function DashboardEmpleadoSection({
  empleadoSel,
  setEmpleadoSel,
  empleadosOptions,
  analisisEmpleado,
  kpis,
}: DashboardEmpleadoSectionProps) {
  const [openDash, setOpenDash] = useState(false);

  const handleExport = () => {
    exportDashboardExcel(analisisEmpleado, empleadoSel || empleadosOptions[0]);
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Dashboard por empleado</h3>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Compare fichadas versus horario asignado.</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm text-gray-700 dark:text-gray-300">Empleado</label>
          <select
            value={empleadoSel || (empleadosOptions[0] || '')}
            onChange={(e) => setEmpleadoSel(e.target.value)}
            className="rounded-md border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            {empleadosOptions.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </select>
          <button
            onClick={() => setOpenDash((v) => !v)}
            className="rounded-md bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
          >
            {openDash ? 'Contraer' : 'Desplegar'}
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

      {openDash && (
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-6">
          <Kpi title="Días" value={kpis.total} />
          <Kpi title="Llegadas tarde" value={kpis.tardes} />
          <Kpi title="Retiros anticipados" value={kpis.retiros} />
          <Kpi title="Almuerzo fuera franja" value={kpis.almFuera} />
          <Kpi title="Almuerzo excedido" value={kpis.almExced} />
          <Kpi title="Prom. tardanza" value={formatMin(kpis.promTarde)} />
        </div>
      )}

      {openDash && (
        <div className="mt-6 rounded-md border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950">
          <div className="text-sm text-red-800 dark:text-red-200 font-medium">Días ausentes (excluye francos): {kpis.ausentes}</div>
        </div>
      )}

      {openDash && (
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <Th>Fecha</Th>
                <Th>Entrada prog.</Th>
                <Th>Entrada real</Th>
                <Th>Tardanza</Th>
                <Th>Salida prog.</Th>
                <Th>Salida real</Th>
                <Th>Retiro anticip.</Th>
                <Th>Alm. salida</Th>
                <Th>Alm. entrada</Th>
                <Th>Duración alm.</Th>
                <Th>Fuera franja</Th>
                <Th>Excedido</Th>
                <Th>Ausente</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {analisisEmpleado.map((r) => (
                <tr key={`${r.empleado}-${r.fecha}`} className="bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700">
                  <Td className={classNames(r.ausente ? 'text-red-700 dark:text-red-300 font-medium' : '')}>{renderFecha(r.fecha)}</Td>
                  <Td>{r.entradaProgramada}</Td>
                  <Td className={classNames(r.tardanzaMin > 0 ? 'text-red-600 dark:text-red-400 font-medium' : '', r.ausente ? 'line-through opacity-60' : '')}>{r.horaEntrada || '-'}</Td>
                  <Td className={classNames(r.tardanzaMin > 0 ? 'text-red-600 dark:text-red-400 font-medium' : '')}>{formatMin(r.tardanzaMin)}</Td>
                  <Td>{r.salidaProgramada}</Td>
                  <Td className={classNames(r.retiroAnticipadoMin > 0 ? 'text-orange-600 dark:text-orange-400 font-medium' : '', r.ausente ? 'line-through opacity-60' : '')}>{r.horaSalida || '-'}</Td>
                  <Td className={classNames(r.retiroAnticipadoMin > 0 ? 'text-orange-600 dark:text-orange-400 font-medium' : '')}>{formatMin(r.retiroAnticipadoMin)}</Td>
                  <Td>{r.almuerzoInicio || '-'}</Td>
                  <Td>{r.almuerzoFin || '-'}</Td>
                  <Td>{r.almuerzoDuracionMin !== undefined ? `${r.almuerzoDuracionMin} min` : '-'}</Td>
                  <Td className={classNames(r.almuerzoFueraFranja ? 'text-yellow-700 dark:text-yellow-300 font-medium' : '')}>{r.almuerzoFueraFranja ? 'Sí' : 'No'}</Td>
                  <Td className={classNames(r.almuerzoExcedido ? 'text-yellow-700 dark:text-yellow-300 font-medium' : '')}>{r.almuerzoExcedido ? 'Sí' : 'No'}</Td>
                  <Td className={classNames(r.ausente ? 'text-red-700 dark:text-red-300 font-medium' : '')}>{r.ausente ? 'Sí' : 'No'}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
