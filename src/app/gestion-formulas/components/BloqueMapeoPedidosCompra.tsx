// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import SelectorMapeo from './SelectorMapeo';
import DataPreviewTable from './DataPreviewTable';

interface BloqueMapeoPedidosCompraProps {
  columnas: string[];
  preview: any[];
  mapeo: {
    fechaSolicitud: string;
    codigoProducto: string;
    cantidadSolicitada: string;
    cantidadRecibida: string;
  };
  onChange: (campo: string, valor: string) => void;
}

export default function BloqueMapeoPedidosCompra({
  columnas,
  preview,
  mapeo,
  onChange,
}: BloqueMapeoPedidosCompraProps) {
  const columnasParaSelect = columnas.length > 0 ? columnas : [
    mapeo.fechaSolicitud,
    mapeo.codigoProducto,
    mapeo.cantidadSolicitada,
    mapeo.cantidadRecibida,
  ].filter(Boolean);

  return (
    <div className="p-4 rounded-xl bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
      <h3 className="text-sm font-bold text-gray-800 dark:text-white flex items-center">
        <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs mr-2 font-bold font-mono">
          5
        </span>
        Pedidos de Compra (Solicitud de Compras y Hierbas)
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 rounded-lg bg-gray-50/50 dark:bg-[#2C2C2E]/20 border border-gray-100 dark:border-gray-850">
        <SelectorMapeo
          label="Fecha de Solicitud (Columna A)"
          columnas={columnasParaSelect}
          value={mapeo.fechaSolicitud}
          onChange={(v) => onChange('fechaSolicitud', v)}
          requerido
        />
        <SelectorMapeo
          label="Código Producto / Insumo (Columna D)"
          columnas={columnasParaSelect}
          value={mapeo.codigoProducto}
          onChange={(v) => onChange('codigoProducto', v)}
          requerido
        />
        <SelectorMapeo
          label="Cantidad Solicitada (Columna F)"
          columnas={columnasParaSelect}
          value={mapeo.cantidadSolicitada}
          onChange={(v) => onChange('cantidadSolicitada', v)}
          requerido
        />
        <SelectorMapeo
          label="Cantidad Recibida / Entrega (Columna V)"
          columnas={columnasParaSelect}
          value={mapeo.cantidadRecibida}
          onChange={(v) => onChange('cantidadRecibida', v)}
          requerido
        />
      </div>
      {preview && preview.length > 0 && (
        <DataPreviewTable
          previewData={preview}
          columns={columnasParaSelect}
          title="Vista Previa de Pedidos de Compra"
          columnasMapeadas={Object.values(mapeo)}
        />
      )}
    </div>
  );
}
