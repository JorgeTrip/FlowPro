// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import React, { useState } from 'react';
import { RegistroArmadoDocumento, FilaArmado } from '../../types/armado';
import { guardarPlanillaVerificada } from '../../services/firestoreService';
import { Save, Trash2, Plus, X } from 'lucide-react';

interface SheetEditorModalProps {
  planilla: RegistroArmadoDocumento;
  onCerrar: () => void;
  onGuardadoExitoso: () => void;
}

export function SheetEditorModal({ planilla, onCerrar, onGuardadoExitoso }: SheetEditorModalProps) {
  const [empleadoHeader, setEmpleadoHeader] = useState(planilla.empleadoHeader);
  const [filas, setFilas] = useState<FilaArmado[]>(planilla.filas || []);
  const [guardando, setGuardando] = useState(false);

  const handleActualizarFila = (id: string, updates: Partial<FilaArmado>) => {
    setFilas((prev) => prev.map((f) => (f.id === id ? { ...f, ...updates } : f)));
  };

  const handleAgregarFila = () => {
    const hoyStr = new Date().toISOString().split('T')[0];
    const nueva: FilaArmado = {
      id: `fila-nueva-${Date.now()}`,
      fecha: filas[0]?.fecha || hoyStr,
      horaInicio: '08:00',
      horaFin: '09:00',
      cantArticulos: 0,
      notaIrregularidad: null,
      esIrregular: false,
      empleadoAsignado: empleadoHeader,
    };
    setFilas((prev) => [...prev, nueva]);
  };

  const handleEliminarFila = (id: string) => {
    setFilas((prev) => prev.filter((f) => f.id !== id));
  };

  const handleGuardar = async () => {
    setGuardando(true);
    try {
      await guardarPlanillaVerificada({
        ...planilla,
        empleadoHeader,
        filas,
        fechaPrimeraFila: filas[0]?.fecha || planilla.fechaPrimeraFila,
        horaInicioPrimeraFila: filas[0]?.horaInicio || planilla.horaInicioPrimeraFila,
      });
      onGuardadoExitoso();
    } catch (err: any) {
      alert(`Error al guardar cambios: ${err.message}`);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-[#1C1C1E]">
        {/* Cabecera del Modal */}
        <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-800">
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              Editar Planilla Guardada en Firestore
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              ID Documento: <span className="font-mono">{planilla.id}</span>
            </p>
          </div>
          <button onClick={onCerrar} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Cuerpo Editable */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Empleado Cabecera
            </label>
            <input
              type="text"
              list="lista-empleados-sugeridos"
              value={empleadoHeader}
              onChange={(e) => setEmpleadoHeader(e.target.value.toUpperCase())}
              className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-900 uppercase dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-700 dark:text-gray-300">
              <thead className="border-b bg-gray-50 text-[11px] uppercase tracking-wider text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                <tr>
                  <th className="px-2 py-2 w-9 text-center">N°</th>
                  <th className="px-2 py-2">Fecha</th>
                  <th className="px-2 py-2">Inicio</th>
                  <th className="px-2 py-2">Fin</th>
                  <th className="px-2 py-2">Artículos</th>
                  <th className="px-2 py-2">Empleado Asignado</th>
                  <th className="px-2 py-2 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {filas.map((f, index) => {
                  const numLinea = index + 1;
                  const excedeLimite = numLinea > 17;
                  const faltaHoraInicio = !f.horaInicio || f.horaInicio.trim() === '';
                  const faltaHoraFin = !f.horaFin || f.horaFin.trim() === '';

                  return (
                    <tr key={f.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                      <td className="px-1.5 py-1.5 text-center font-mono">
                        <span
                          className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                            excedeLimite
                              ? 'bg-red-600 text-white animate-pulse'
                              : 'bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                          }`}
                          title={excedeLimite ? `Línea #${numLinea} (⚠️ Supera las 17 filas impresas de la planilla)` : `Línea #${numLinea}`}
                        >
                          {numLinea}
                        </span>
                      </td>
                      <td className="px-2 py-1.5">
                        <input
                          type="date"
                          value={f.fecha}
                          onChange={(e) => handleActualizarFila(f.id, { fecha: e.target.value })}
                          className="w-28 rounded border border-gray-300 bg-gray-50 px-1.5 py-1 text-xs dark:border-gray-700 dark:bg-gray-800"
                        />
                      </td>
                      <td className="px-2 py-1.5">
                        <input
                          type="time"
                          value={f.horaInicio}
                          onChange={(e) => handleActualizarFila(f.id, { horaInicio: e.target.value })}
                          className={`rounded border px-1.5 py-1 text-xs transition-colors ${
                            faltaHoraInicio
                              ? 'border-2 border-amber-500 bg-amber-100 font-bold text-amber-900 dark:bg-amber-950/60 dark:text-amber-200'
                              : 'border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-800'
                          }`}
                        />
                      </td>
                      <td className="px-2 py-1.5">
                        <input
                          type="time"
                          value={f.horaFin}
                          onChange={(e) => handleActualizarFila(f.id, { horaFin: e.target.value })}
                          className={`rounded border px-1.5 py-1 text-xs transition-colors ${
                            faltaHoraFin
                              ? 'border-2 border-amber-500 bg-amber-100 font-bold text-amber-900 dark:bg-amber-950/60 dark:text-amber-200'
                              : 'border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-800'
                          }`}
                        />
                      </td>
                    <td className="px-2 py-1.5">
                      <input
                        type="number"
                        value={f.cantArticulos}
                        onChange={(e) => handleActualizarFila(f.id, { cantArticulos: Number(e.target.value) })}
                        className="w-20 rounded border border-gray-300 bg-gray-50 px-1.5 py-1 text-xs dark:border-gray-700 dark:bg-gray-800"
                      />
                    </td>
                    <td className="px-2 py-1.5">
                      <input
                        type="text"
                        list="lista-empleados-sugeridos"
                        value={f.empleadoAsignado || f.nuevoEmpleado || empleadoHeader}
                        onChange={(e) => handleActualizarFila(f.id, { empleadoAsignado: e.target.value.toUpperCase() })}
                        className="w-36 rounded border border-gray-300 bg-gray-50 px-1.5 py-1 text-xs uppercase dark:border-gray-700 dark:bg-gray-800"
                      />
                    </td>
                    <td className="px-2 py-1.5 text-right">
                      <button
                        onClick={() => handleEliminarFila(f.id)}
                        className="rounded p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              </tbody>
            </table>
          </div>

          <button
            onClick={handleAgregarFila}
            className="flex items-center space-x-1 rounded-lg border border-dashed border-gray-300 px-3 py-1.5 text-xs font-semibold text-blue-600 hover:border-blue-400 dark:border-gray-700 dark:text-blue-400"
          >
            <Plus className="h-4 w-4" />
            <span>Agregar Fila</span>
          </button>
        </div>

        {/* Acciones Footer */}
        <div className="flex items-center justify-end space-x-3 border-t border-gray-200 p-4 dark:border-gray-800">
          <button onClick={onCerrar} className="rounded-xl px-4 py-2 text-xs font-semibold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800">
            Cancelar
          </button>
          <button
            onClick={handleGuardar}
            disabled={guardando}
            className="flex items-center space-x-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-blue-700 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            <span>{guardando ? 'Guardando en Firestore...' : 'Guardar Cambios en BD'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
