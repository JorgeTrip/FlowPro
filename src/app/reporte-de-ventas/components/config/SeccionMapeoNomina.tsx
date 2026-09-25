import React from 'react';
import { ExcelRow } from '@/app/stores/reporteVentasStore';
import DataPreviewTable from '../DataPreviewTable';
import { SelectAsignacion } from './SelectAsignacion';

interface SeccionMapeoNominaProps {
  nominaFile: File;
  nominaData: ExcelRow[];
  nominaColumnas: string[];
  nominaPreviewData: ExcelRow[];
  nominaMapeoLocal: { RazonSocial: string; Vendedor: string };
  setNominaMapeoLocal: React.Dispatch<React.SetStateAction<{ RazonSocial: string; Vendedor: string }>>;
}

export function SeccionMapeoNomina({
  nominaFile,
  nominaData,
  nominaColumnas,
  nominaPreviewData,
  nominaMapeoLocal,
  setNominaMapeoLocal,
}: SeccionMapeoNominaProps) {
  return (
    <div className="rounded-md border border-gray-300 p-6 dark:border-gray-600">
      <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200">
        Nómina de Clientes: <span className="font-normal text-gray-600 dark:text-gray-400">{nominaFile.name}</span>
      </h4>
      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
        📋 <strong>{nominaData.length}</strong> registros. Asigne las columnas para el cruce de vendedores.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
        <div>
          {nominaPreviewData.length > 0 && (
            <DataPreviewTable
              title="Previsualización de Nómina"
              previewData={nominaPreviewData as ExcelRow[]}
              columns={nominaColumnas}
              highlightedColumns={[nominaMapeoLocal.RazonSocial, nominaMapeoLocal.Vendedor].filter(Boolean)}
            />
          )}
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <SelectAsignacion
            label="Razón Social (para cruce)"
            columnas={nominaColumnas}
            value={nominaMapeoLocal.RazonSocial || ''}
            onChange={(e) =>
              setNominaMapeoLocal((prev) => ({
                ...prev,
                RazonSocial: e.target.value === 'Seleccionar columna...' ? '' : e.target.value,
              }))
            }
          />
          <SelectAsignacion
            label="Vendedor"
            columnas={nominaColumnas}
            value={nominaMapeoLocal.Vendedor || ''}
            onChange={(e) =>
              setNominaMapeoLocal((prev) => ({
                ...prev,
                Vendedor: e.target.value === 'Seleccionar columna...' ? '' : e.target.value,
              }))
            }
          />
        </div>
      </div>

      {nominaMapeoLocal.RazonSocial && nominaMapeoLocal.Vendedor ? (
        <p className="mt-3 text-xs text-green-600 dark:text-green-400">
          ✅ Al generar el reporte, se reasignarán las ventas al vendedor real según esta nómina.
        </p>
      ) : (
        <p className="mt-3 text-xs text-yellow-600 dark:text-yellow-400">
          ⚠️ Asigne ambas columnas para activar la reasignación de vendedores.
        </p>
      )}
    </div>
  );
}
