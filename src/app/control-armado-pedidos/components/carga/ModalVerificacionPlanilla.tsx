// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import React, { useEffect } from 'react';
import { useArmadoStore } from '../../stores/armadoStore';
import { useLogicaVerificacion } from '../../hooks/useLogicaVerificacion';
import { InteractiveImageViewer } from './InteractiveImageViewer';
import { TablaVerificacionFilas } from './TablaVerificacionFilas';
import { BarraAccionesVerificacion } from './BarraAccionesVerificacion';
import { X, Sparkles, FileJson, CheckCircle2 } from 'lucide-react';

export function ModalVerificacionPlanilla() {
  const modalVerificacionAbierta = useArmadoStore((state) => state.modalVerificacionAbierta);
  const {
    actual,
    itemsPendientes,
    numActual,
    totalLote,
    porcentajeProgreso,
    faltaEmpleado,
    guardando,
    reescaneando,
    setRotacionGrados,
    mensajeReescanear,
    handleConfirmar,
    handleReescanear,
    actualizarFilaActual,
    actualizarCabeceraActual,
    removerFilaActual,
    saltarASiguientePlanilla,
    irAPlanillaAnterior,
    cerrarModalVerificacion,
  } = useLogicaVerificacion();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && modalVerificacionAbierta) {
        cerrarModalVerificacion();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modalVerificacionAbierta, cerrarModalVerificacion]);

  if (!modalVerificacionAbierta || !actual) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3 sm:p-6 backdrop-blur-md animate-fade-in">
      <div className="flex max-h-[92vh] w-full max-w-[96vw] xl:max-w-7xl flex-col overflow-hidden rounded-3xl border border-gray-200 bg-[#F5F5F7] shadow-2xl dark:border-gray-800 dark:bg-[#1C1C1E]">
        {/* Cabecera del Modal Amplio */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-gray-200 bg-white px-6 py-4 dark:border-gray-800 dark:bg-[#1C1C1E]">
          <div className="flex items-center space-x-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white shadow">
              {numActual}
            </span>
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center space-x-2">
                <span>Verificación de Planilla #{numActual} de {totalLote}</span>
                {actual.empleadoHeader && (
                  <span className="text-xs font-normal text-gray-500 dark:text-gray-400">
                    ({actual.empleadoHeader})
                  </span>
                )}
              </h2>
              <p className="text-xs text-blue-700 dark:text-blue-400">
                Quedan <strong className="font-semibold">{itemsPendientes.length}</strong> planillas en cola
              </p>
            </div>
          </div>

          <div className="mt-3 sm:mt-0 flex items-center space-x-4 w-full sm:w-auto justify-between sm:justify-end">
            <div className="flex items-center space-x-2">
              <div className="h-2 w-28 sm:w-36 overflow-hidden rounded-full bg-blue-200 dark:bg-blue-900/60">
                <div
                  className="h-full bg-blue-600 transition-all duration-300 dark:bg-blue-400"
                  style={{ width: `${porcentajeProgreso}%` }}
                />
              </div>
              <span className="text-xs font-bold text-blue-800 dark:text-blue-300">
                {porcentajeProgreso}%
              </span>
            </div>

            <button
              onClick={cerrarModalVerificacion}
              className="rounded-full p-2 text-gray-400 hover:bg-gray-200 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200 transition-all"
              title="Cerrar modal (Esc)"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Banner de Mensajes (Re-escaneo con IA) */}
        {mensajeReescanear && (
          <div className="flex items-center space-x-2 bg-purple-500/10 px-6 py-2 text-xs font-semibold text-purple-700 dark:text-purple-300 border-b border-purple-500/20">
            <Sparkles className="h-4 w-4 shrink-0 text-purple-600" />
            <span>{mensajeReescanear}</span>
          </div>
        )}

        {/* Cuerpo del Modal: Visor Lado a Lado */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-stretch">
            {/* Columna Izquierda: Visor Interactivo de Imagen o Importación JSON */}
            <div className="flex flex-col rounded-2xl border border-gray-200 bg-gray-900 p-4 shadow-xl dark:border-gray-800 lg:col-span-5 min-h-[400px]">
              {actual.imagenBase64 ? (
                <InteractiveImageViewer
                  src={actual.imagenBase64}
                  onRotacionChange={setRotacionGrados}
                />
              ) : (
                <div className="flex flex-1 flex-col items-center justify-center p-6 text-center space-y-4 rounded-xl border border-purple-500/30 bg-purple-950/20 text-purple-200">
                  <div className="rounded-2xl bg-purple-500/20 p-4 text-purple-300">
                    <FileJson className="h-10 w-10 animate-bounce" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm text-purple-100">Importación Externa (JSON)</h4>
                    <p className="text-xs text-purple-300">
                      Esta planilla proviene de la lectura realizada mediante un modelo de IA externo.
                    </p>
                  </div>
                  <p className="text-[11px] text-purple-400 max-w-xs">
                    No posee una imagen física adjunta. Podés revisar los datos extraídos en la tabla de la derecha y resolver las irregularidades antes de guardar.
                  </p>
                </div>
              )}
            </div>

            {/* Columna Derecha: Tabla Editable de Datos */}
            <div className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-800 dark:bg-[#1C1C1E] lg:col-span-7">
              <TablaVerificacionFilas
                actual={actual}
                faltaEmpleado={faltaEmpleado}
                actualizarCabeceraActual={actualizarCabeceraActual}
                actualizarFilaActual={actualizarFilaActual}
                removerFilaActual={removerFilaActual}
              />

              <BarraAccionesVerificacion
                guardando={guardando}
                reescaneando={reescaneando}
                onAnterior={irAPlanillaAnterior}
                onConfirmar={handleConfirmar}
                onReescanear={handleReescanear}
                onSaltar={saltarASiguientePlanilla}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
