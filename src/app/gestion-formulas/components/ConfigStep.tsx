// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import { useGestionFormulasStore } from '@/app/stores/gestionFormulasStore';
import { useProcesarImportacion } from '../hooks/useProcesarImportacion';
import { useMapeoColumnas } from '../hooks/useMapeoColumnas';
import BloqueMapeoFormulas from './BloqueMapeoFormulas';
import BloqueMapeoStockConsumo from './BloqueMapeoStockConsumo';
import BloqueMapeoPedidosCompra from './BloqueMapeoPedidosCompra';

export default function ConfigStep() {
  const store = useGestionFormulasStore();
  const { procesarConfirmacion } = useProcesarImportacion();
  const { mapeoLocal, setMapeoLocal } = useMapeoColumnas(store);

  const handleConfirmar = async () => {
    store.setConfiguracionMapeo({
      formulas: mapeoLocal.formulas,
      stock: mapeoLocal.stock,
      productos: null,
      consumo: mapeoLocal.consumo,
      stockPT: store.datosCrudosStockPT.length > 0 ? mapeoLocal.stockPT : null,
      consumoSemi: store.datosCrudosRotacionSemiElab.length > 0 ? mapeoLocal.consumoSemi : null,
      pedidosCompra: mapeoLocal.pedidosCompra,
    });
    procesarConfirmacion();
  };

  const formulasReady = Boolean(mapeoLocal.formulas.codigoProducto && mapeoLocal.formulas.codigoComponente && mapeoLocal.formulas.cantidad);
  const stockReady = Boolean(mapeoLocal.stock.codigoProducto && mapeoLocal.stock.deposito && mapeoLocal.stock.stockFisico);
  const consumoReady = Boolean(mapeoLocal.consumo.codigoProducto && mapeoLocal.consumo.cantidadConsumida);
  const stockPTReady = store.datosCrudosStockPT.length > 0 ? Boolean(mapeoLocal.stockPT.codigo && mapeoLocal.stockPT.descripcion) : true;
  const consumoSemiReady = store.datosCrudosRotacionSemiElab.length > 0 ? Boolean(mapeoLocal.consumoSemi.codigoProducto && mapeoLocal.consumoSemi.cantidadConsumida) : true;
  const pedidosCompraReady = Boolean(mapeoLocal.pedidosCompra.fechaSolicitud && mapeoLocal.pedidosCompra.codigoProducto && mapeoLocal.pedidosCompra.cantidadSolicitada);
  const listoParaImportar = formulasReady && stockReady && consumoReady && stockPTReady && consumoSemiReady && pedidosCompraReady;

  return (
    <div className="space-y-8 max-w-6xl mx-auto text-xs">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* BLOQUE 1: Fórmulas */}
        <BloqueMapeoFormulas
          columnas={store.columnasFormulas}
          preview={store.previewFormulas}
          mapeo={mapeoLocal.formulas}
          onChange={(campo, val) =>
            setMapeoLocal((prev) => ({ ...prev, formulas: { ...prev.formulas, [campo]: val } }))
          }
        />

        {/* BLOQUE 2: Stock, Consumo y PT */}
        <BloqueMapeoStockConsumo
          store={store}
          mapeoLocal={mapeoLocal}
          setMapeoLocal={setMapeoLocal}
        />
      </div>

      {/* BLOQUE 5: Pedidos de Compra (Ancho completo) */}
      <BloqueMapeoPedidosCompra
        columnas={store.columnasPedidosCompra}
        preview={store.previewPedidosCompra}
        mapeo={mapeoLocal.pedidosCompra}
        onChange={(campo, val) =>
          setMapeoLocal((prev) => ({
            ...prev,
            pedidosCompra: { ...prev.pedidosCompra, [campo]: val },
          }))
        }
      />

      {store.error && (
        <div className="p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg text-sm">
          {store.error}
        </div>
      )}

      <div className="flex justify-between items-center pt-4">
        <button
          onClick={() => store.setStep(1)}
          className="px-5 py-2 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 transition-all font-semibold cursor-pointer"
        >
          ← Volver a Carga
        </button>
        <button
          onClick={handleConfirmar}
          disabled={!listoParaImportar || store.isLoading}
          className="px-6 py-2.5 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold transition-all shadow-md disabled:bg-gray-300 dark:disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed cursor-pointer"
        >
          {store.isLoading ? 'Procesando Excel...' : 'Confirmar Mapeo e Importar ✔'}
        </button>
      </div>
    </div>
  );
}
