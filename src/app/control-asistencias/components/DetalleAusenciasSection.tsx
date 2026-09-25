import React, { useState } from 'react';
import { renderFecha, Th, Td } from './TablasAsistenciasUI';
import { exportAusenciasExcel } from '../services/exportadorAsistenciasExcel';

interface AusenciaItem {
  empleado: string;
  cantidad: number;
  fechas: string[];
}

interface DetalleAusenciasSectionProps {
  ausenciasDetalle: AusenciaItem[];
}

export function DetalleAusenciasSection({ ausenciasDetalle }: DetalleAusenciasSectionProps) {
  const [openAus, setOpenAus] = useState(false);

  const handleExport = () => {
    exportAusenciasExcel(ausenciasDetalle);
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Detalle de ausencias</h3>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Días laborables sin fichadas por empleado.</p>
        </div>
        <button
          onClick={() => setOpenAus((v) => !v)}
          className="rounded-md bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
        >
          {openAus ? 'Contraer' : 'Desplegar'}
        </button>
      </div>
      <div className="mt-4 flex justify-end">
        <button
          onClick={handleExport}
          className="inline-flex items-center rounded-md bg-green-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-green-700"
        >
          Exportar Excel
        </button>
      </div>
      {openAus && (
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <Th>Empleado</Th>
                <Th>Cantidad</Th>
                <Th>Fechas</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {ausenciasDetalle.map((a) => (
                <tr key={a.empleado} className="bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700">
                  <Td>{a.empleado}</Td>
                  <Td>{a.cantidad}</Td>
                  <Td>{a.fechas.map((f) => renderFecha(f)).join(', ')}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
