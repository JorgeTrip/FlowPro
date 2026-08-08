// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import React, { useState } from 'react';
import { useArmadoStore } from '../../stores/armadoStore';
import { guardarPlanillaVerificada } from '../../services/firestoreService';
import { guardarImagenLocal } from '../../services/localImageStore';
import { IrregularityResolver } from './IrregularityResolver';
import { InteractiveImageViewer } from './InteractiveImageViewer';
import { CheckCircle, Trash2, AlertTriangle } from 'lucide-react';

export function VerificationSideBySide() {
  const {
    itemsPendientes,
    itemActualIndex,
    actualizarFilaActual,
    actualizarCabeceraActual,
    removerFilaActual,
    marcarActualComoVerificado,
  } = useArmadoStore();

  const [guardando, setGuardando] = useState(false);
  const actual = itemsPendientes[itemActualIndex];

  if (!actual) return null;

  const handleConfirmar = async () => {
    setGuardando(true);
    try {
      const docId = await guardarPlanillaVerificada(actual);
      if (actual.imagenBase64) {
        await guardarImagenLocal(docId, actual.imagenBase64);
      }

      const cantFilas = actual.filas.length;
      const cantArticulos = actual.filas.reduce((acc, f) => acc + (f.cantArticulos || 0), 0);
      marcarActualComoVerificado({
        empleado: actual.empleadoHeader,
        cantFilas,
        cantArticulos,
        guardadoEn: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
    } catch (err: any) {
      console.error(err);
      alert(`Error al guardar en Firestore: ${err?.message || 'Error desconocido'}`);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      {/* Columna Izquierda: Visor Interactivo de Imagen con Zoom en Rueda y Pan Arrastrable */}
      <div className="flex flex-col rounded-2xl border border-gray-200 bg-gray-900 p-4 shadow-xl dark:border-gray-800 lg:col-span-5">
        <InteractiveImageViewer src={actual.imagenBase64} />
      </div>

      {/* Columna Derecha: Tabla Editable de Datos */}
      <div className="flex flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-800 dark:bg-[#1C1C1E] lg:col-span-7">
        <div className="mb-4">
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
            Empleado Cabecera de la Planilla
          </label>
          <input
            type="text"
            value={actual.empleadoHeader}
            onChange={(e) => actualizarCabeceraActual(e.target.value, actual.fechaPlanilla || '')}
            className="mt-1 w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
        </div>

        {/* Tabla Editable con Asociación Visual Directa por Fila */}
        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-700 dark:text-gray-300">
            <thead className="border-b bg-gray-50 text-[11px] uppercase tracking-wider text-gray-500 dark:bg-gray-800 dark:text-gray-400">
              <tr>
                <th className="px-2 py-2">Fecha</th>
                <th className="px-2 py-2">Inicio</th>
                <th className="px-2 py-2">Fin</th>
                <th className="px-2 py-2">Artículos</th>
                <th className="px-2 py-2">Asignado</th>
                <th className="px-2 py-2 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {actual.filas.map((fila) => {
                const esIgnorada = fila.accionIrregularidad === 'ignorar';
                const esIrregular = fila.esIrregular;

                return (
                  <React.Fragment key={fila.id}>
                    {/* Fila Principal de Datos */}
                    <tr
                      className={`transition-colors ${
                        esIgnorada
                          ? 'opacity-40 line-through bg-gray-100 dark:bg-gray-900'
                          : esIrregular
                          ? 'border-l-4 border-l-amber-500 bg-amber-500/10 dark:bg-amber-950/20'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800/40'
                      }`}
                    >
                      <td className="px-2 py-2">
                        <input
                          type="date"
                          value={fila.fecha || new Date().toISOString().split('T')[0]}
                          onChange={(e) => actualizarFilaActual(fila.id, { fecha: e.target.value })}
                          className="w-28 rounded border border-gray-300 bg-gray-50 px-1.5 py-1 text-[11px] dark:border-gray-700 dark:bg-gray-800"
                        />
                      </td>
                      <td className="px-2 py-2">
                        <input
                          type="time"
                          value={fila.horaInicio}
                          onChange={(e) => actualizarFilaActual(fila.id, { horaInicio: e.target.value })}
                          className="rounded border border-gray-300 bg-gray-50 px-1.5 py-1 text-[11px] dark:border-gray-700 dark:bg-gray-800"
                        />
                      </td>
                      <td className="px-2 py-2">
                        <input
                          type="time"
                          value={fila.horaFin}
                          onChange={(e) => actualizarFilaActual(fila.id, { horaFin: e.target.value })}
                          className="rounded border border-gray-300 bg-gray-50 px-1.5 py-1 text-[11px] dark:border-gray-700 dark:bg-gray-800"
                        />
                      </td>
                      <td className="px-2 py-2">
                        <input
                          type="number"
                          value={fila.cantArticulos}
                          onChange={(e) => actualizarFilaActual(fila.id, { cantArticulos: Number(e.target.value) })}
                          className="w-16 rounded border border-gray-300 bg-gray-50 px-1.5 py-1 text-[11px] dark:border-gray-700 dark:bg-gray-800"
                        />
                      </td>
                      <td className="px-2 py-2 font-medium">
                        <div className="flex items-center space-x-1">
                          <span>{fila.nuevoEmpleado || fila.empleadoAsignado || actual.empleadoHeader}</span>
                          {esIrregular && (
                            <span className="flex items-center space-x-0.5 rounded bg-amber-200 px-1 py-0.5 text-[9px] font-bold text-amber-900 dark:bg-amber-900/80 dark:text-amber-200">
                              <AlertTriangle className="h-3 w-3" />
                              <span>Nota</span>
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-2 py-2 text-right">
                        <button
                          onClick={() => removerFilaActual(fila.id)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded dark:hover:bg-red-950/40"
                          title="Eliminar fila"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>

                    {/* Panel de Resolución Vinculado Visualmente */}
                    {esIrregular && (
                      <tr className="border-l-4 border-l-amber-500 bg-amber-500/10 dark:bg-amber-950/20">
                        <td colSpan={6} className="px-3 pb-3 pt-0">
                          <IrregularityResolver
                            fila={fila}
                            empleadoHeader={actual.empleadoHeader}
                            onResolver={(accion, nuevoEmp) =>
                              actualizarFilaActual(fila.id, {
                                accionIrregularidad: accion,
                                nuevoEmpleado: nuevoEmp,
                                empleadoAsignado: accion === 'asignar_nuevo' ? nuevoEmp : actual.empleadoHeader,
                              })
                            }
                          />
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        <button
          onClick={handleConfirmar}
          disabled={guardando}
          className="mt-6 flex w-full items-center justify-center space-x-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:bg-blue-700 disabled:opacity-50"
        >
          <CheckCircle className="h-5 w-5" />
          <span>{guardando ? 'Guardando en Firestore...' : 'Confirmar Planilla Verificada'}</span>
        </button>
      </div>
    </div>
  );
}
