// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import { ModuleLayout } from '@/app/components/layout/ModuleLayout';
import { usePrefijosUI } from './hooks/usePrefijosUI';
import { CabeceraAcciones } from './components/CabeceraAcciones';
import { TablaPrefijos } from './components/TablaPrefijos';
import { FormularioPrefijo } from './components/FormularioPrefijo';

export default function PrefijosCodigosPTPage() {
  const ui = usePrefijosUI();

  return (
    <ModuleLayout
      titulo="Prefijos de códigos PT"
      descripcion="Configure prefijos de códigos de productos terminados, asociando líneas de producción y plantas de fabricación (CABA / ENTRE RIOS)."
      breadcrumbs={[{ nombre: 'Dashboard', href: '/' }, { nombre: 'Prefijos de códigos PT' }]}
    >
      <div className="relative space-y-6">
        {/* Notificación global transitoria */}
        {ui.mensajeNotificacion && (
          <div
            className={`fixed top-4 right-4 z-[9999] flex items-center space-x-2 rounded-lg px-4 py-3 text-xs font-semibold shadow-lg transition-all duration-300 border ${
              ui.mensajeNotificacion.tipo === 'exito'
                ? 'bg-green-150 border-green-300 text-green-800 dark:bg-green-950/45 dark:border-green-850 dark:text-green-300'
                : 'bg-red-150 border-red-300 text-red-800 dark:bg-red-950/45 dark:border-red-850 dark:text-red-300'
            }`}
          >
            <span>{ui.mensajeNotificacion.tipo === 'exito' ? '✅' : '❌'}</span>
            <span>{ui.mensajeNotificacion.texto}</span>
          </div>
        )}

        {/* Bloqueador de pantalla para la ilusión de progreso en operaciones rápidas */}
        {ui.procesando && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/45 backdrop-blur-[1px] dark:bg-gray-900/45 rounded-xl">
            <div className="flex flex-col items-center space-y-3 rounded-xl bg-white p-6 shadow-xl border border-gray-150 dark:bg-[#1C1C1E] dark:border-gray-800">
              <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-blue-500 border-t-transparent" />
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Procesando solicitud...</p>
            </div>
          </div>
        )}

        <CabeceraAcciones ui={ui} />
        <TablaPrefijos ui={ui} />
        {ui.modalAbierto && <FormularioPrefijo ui={ui} />}
      </div>
    </ModuleLayout>
  );
}
