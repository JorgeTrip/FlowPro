// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import SelectorMapeo from './SelectorMapeo';
import DataPreviewTable from './DataPreviewTable';

interface BloqueMapeoFormulasProps {
  columnas: string[];
  preview: any[];
  mapeo: {
    codigoProducto: string;
    descripcionProducto: string;
    contenido: string;
    codigoComponente: string;
    descripcionComponente: string;
    cantidad: string;
    unidadMedidaComponente: string;
  };
  onChange: (campo: string, valor: string) => void;
}

export default function BloqueMapeoFormulas({
  columnas,
  preview,
  mapeo,
  onChange,
}: BloqueMapeoFormulasProps) {
  return (
    <div className="p-4 rounded-xl bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
      <h3 className="text-sm font-bold text-gray-800 dark:text-white flex items-center">
        <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs mr-2 font-bold font-mono">
          1
        </span>
        Fórmulas / Recetas (BOM)
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 rounded-lg bg-gray-50/50 dark:bg-[#2C2C2E]/20 border border-gray-100 dark:border-gray-850">
        <SelectorMapeo label="Cód. Producto Principal" columnas={columnas} value={mapeo.codigoProducto} onChange={(v) => onChange('codigoProducto', v)} requerido />
        <SelectorMapeo label="Desc. Producto Principal" columnas={columnas} value={mapeo.descripcionProducto} onChange={(v) => onChange('descripcionProducto', v)} />
        <SelectorMapeo label="Contenido / Presentación" columnas={columnas} value={mapeo.contenido} onChange={(v) => onChange('contenido', v)} />
        <SelectorMapeo label="Cód. Componente" columnas={columnas} value={mapeo.codigoComponente} onChange={(v) => onChange('codigoComponente', v)} requerido />
        <SelectorMapeo label="Desc. Componente" columnas={columnas} value={mapeo.descripcionComponente} onChange={(v) => onChange('descripcionComponente', v)} />
        <SelectorMapeo label="Cantidad Requerida" columnas={columnas} value={mapeo.cantidad} onChange={(v) => onChange('cantidad', v)} requerido />
        <SelectorMapeo label="U.M. Componente" columnas={columnas} value={mapeo.unidadMedidaComponente} onChange={(v) => onChange('unidadMedidaComponente', v)} />
      </div>
      <DataPreviewTable previewData={preview} columns={columnas} title="Datos de Fórmulas" columnasMapeadas={Object.values(mapeo)} />
    </div>
  );
}
