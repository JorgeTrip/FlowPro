// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { useGestionFormulasStore } from '@/app/stores/gestionFormulasStore';

/**
 * Componente de diálogo modal que se dispara si se detectan recetas nuevas o modificadas.
 * Permite al operador revisar los cambios antes de consolidar el versionamiento histórico en IndexedDB.
 */
export default function ModalConfirmacionVersiones() {
  const store = useGestionFormulasStore();
  const { formulasClasificadas, guardarImportacionConfirmada, setFormulasClasificadas } = store;

  if (!formulasClasificadas) return null;

  const totalNuevas = formulasClasificadas.nueva.length;
  const totalModificadas = formulasClasificadas.modificada.length;
  const totalSinCambios = formulasClasificadas.sin_cambios.length;

  // Si no hay nuevas ni modificadas, el hook lo procesará en segundo plano,
  // por lo que el modal solo debe estar abierto si existen cambios pendientes de confirmación.
  const tieneCambiosPendientes = totalNuevas > 0 || totalModificadas > 0;

  if (!tieneCambiosPendientes) return null;

  const handleCerrar = (abierto: boolean) => {
    if (!abierto) {
      setFormulasClasificadas(null);
    }
  };

  return (
    <Dialog.Root open={tieneCambiosPendientes} onOpenChange={handleCerrar}>
      <Dialog.Portal>
        {/* Fondo difuminado stelar (Backdrop Blur) */}
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity animate-fade-in" />
        
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-[#1C1C1E] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xl z-50 w-full max-w-md focus:outline-none animate-scale-up">
          <Dialog.Title className="text-lg font-bold text-gray-900 dark:text-white mb-2">
            Confirmación de Versiones de Fórmulas
          </Dialog.Title>
          <Dialog.Description className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Se ha realizado el cruce de recetas del Excel contra IndexedDB. Por favor, confirma las siguientes acciones:
          </Dialog.Description>

          {/* Desglose de cambios */}
          <div className="space-y-3 mb-6 p-4 rounded-xl bg-gray-50 dark:bg-[#2C2C2E]/40 border border-gray-100 dark:border-gray-800 text-sm">
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-700 dark:text-gray-300">Fórmulas Nuevas:</span>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-bold">
                +{totalNuevas} v1
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-700 dark:text-gray-300">Fórmulas Modificadas:</span>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 font-bold">
                +{totalModificadas} (Nueva versión)
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-700 dark:text-gray-300">Fórmulas Sin Cambios:</span>
              <span className="px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-semibold">
                {totalSinCambios} (Mantener activas)
              </span>
            </div>
          </div>

          {/* Alerta de Auditoría */}
          <div className="text-xs text-amber-800 dark:text-amber-400 mb-6 bg-amber-50 dark:bg-amber-950/20 p-3 rounded-lg border border-amber-200/50 dark:border-amber-900/30">
            <strong>Nota de Versiones</strong>: Las recetas modificadas incrementarán su versión en +1. Sus versiones anteriores se conservarán en el historial pero pasarán a estado <em>obsoleta</em>, y las nuevas pasarán a ser las <em>activas</em> para los cálculos MRP.
          </div>

          {/* Acciones */}
          <div className="flex justify-end space-x-3">
            <Dialog.Close asChild>
              <button
                onClick={() => setFormulasClasificadas(null)}
                className="px-4 py-2 text-sm font-semibold rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 transition-all cursor-pointer"
              >
                Cancelar
              </button>
            </Dialog.Close>
            <button
              onClick={guardarImportacionConfirmada}
              className="px-4 py-2 text-sm font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-md cursor-pointer hover:shadow-lg"
            >
              Confirmar e Importar ✔
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
