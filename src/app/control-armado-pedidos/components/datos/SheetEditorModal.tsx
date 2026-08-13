// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import React, { useState, useEffect } from 'react';
import { RegistroArmadoDocumento, FilaArmado } from '../../types/armado';
import { guardarPlanillaVerificada } from '../../services/firestoreService';
import { obtenerImagenLocal, guardarImagenLocal } from '../../services/localImageStore';
import { useEmpleadosSugeridos } from '../../hooks/useEmpleadosSugeridos';
import { InteractiveImageViewer } from '../carga/InteractiveImageViewer';
import { DropzoneSheetEditor } from './DropzoneSheetEditor';
import { Save, Plus, X, UploadCloud } from 'lucide-react';
import { FilaSheetEditor } from './FilaSheetEditor';

interface SheetEditorModalProps {
  planilla: RegistroArmadoDocumento;
  onCerrar: () => void;
  onGuardadoExitoso: () => void;
}

export function SheetEditorModal({ planilla, onCerrar, onGuardadoExitoso }: SheetEditorModalProps) {
  const sugerenciasEmpleados = useEmpleadosSugeridos();
  const [empleadoHeader, setEmpleadoHeader] = useState(planilla.empleadoHeader);
  const [filas, setFilas] = useState<FilaArmado[]>(planilla.filas || []);
  const [guardando, setGuardando] = useState(false);
  const [imagenBase64, setImagenBase64] = useState<string | null>(planilla.imagenBase64 || null);
  const [modoCambiarImagen, setModoCambiarImagen] = useState(false);

  useEffect(() => {
    if (!planilla.imagenBase64 && planilla.id) {
      obtenerImagenLocal(planilla.id).then((img) => {
        if (img) setImagenBase64(img);
      });
    }
  }, [planilla]);

  const handleEnterBlur = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') e.currentTarget.blur();
  };

  const handleCambiarEmpleadoCabecera = (nuevoEmpleado: string) => {
    const empUpper = nuevoEmpleado.toUpperCase();
    setEmpleadoHeader(empUpper);
    setFilas((prev) =>
      prev.map((f) => (f.accionIrregularidad === 'asignar_nuevo' && f.nuevoEmpleado ? f : { ...f, empleadoAsignado: empUpper }))
    );
  };

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

  const handleEliminarFila = (id: string) => setFilas((prev) => prev.filter((f) => f.id !== id));

  const handleGuardar = async () => {
    setGuardando(true);
    try {
      if (imagenBase64 && planilla.id) {
        await guardarImagenLocal(planilla.id, imagenBase64);
      }
      await guardarPlanillaVerificada({
        ...planilla,
        empleadoHeader,
        filas,
        imagenBase64: imagenBase64 || undefined,
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
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/70 p-2 sm:p-4 md:p-6 backdrop-blur-md animate-fade-in">
      <datalist id="lista-empleados-sugeridos-datos">
        {sugerenciasEmpleados.map((emp) => (
          <option key={emp} value={emp} />
        ))}
      </datalist>

      <div className="flex max-h-[95vh] w-full max-w-[98vw] xl:max-w-[1400px] 2xl:max-w-[1600px] flex-col overflow-hidden rounded-3xl border border-gray-200 bg-[#F5F5F7] shadow-2xl dark:border-gray-800 dark:bg-[#1C1C1E]">
        <div className="flex items-center justify-between border-b border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-[#1C1C1E]">
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center space-x-2">
              <span>Edición de Planilla ({planilla.empleadoHeader})</span>
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              ID Documento: <span className="font-mono">{planilla.id}</span>
            </p>
          </div>
          <button onClick={onCerrar} className="rounded-full p-2 text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-stretch">
            {/* Columna Izquierda: Visor Interactivo o Dropzone de Imagen */}
            <div className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-gray-900 p-4 shadow-xl dark:border-gray-800 lg:col-span-5 min-h-[400px]">
              {imagenBase64 && !modoCambiarImagen ? (
                <div className="flex flex-col h-full justify-between">
                  <div className="flex-1">
                    <InteractiveImageViewer src={imagenBase64} />
                  </div>
                  <button
                    onClick={() => setModoCambiarImagen(true)}
                    className="mt-3 flex items-center justify-center space-x-1.5 rounded-xl border border-gray-700 bg-gray-800/80 px-3 py-1.5 text-xs font-semibold text-gray-300 hover:bg-gray-700 hover:text-white transition-all w-full"
                  >
                    <UploadCloud className="h-4 w-4 text-blue-400" />
                    <span>Cambiar / Reemplazar Imagen Escaneada</span>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col h-full justify-between">
                  <DropzoneSheetEditor
                    onImagenCargada={(base64) => {
                      setImagenBase64(base64);
                      setModoCambiarImagen(false);
                    }}
                  />
                  {modoCambiarImagen && (
                    <button
                      onClick={() => setModoCambiarImagen(false)}
                      className="mt-2 text-xs font-medium text-gray-400 hover:text-white text-center"
                    >
                      Cancelar cambio de imagen
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Columna Derecha: Tabla Editable de Datos */}
            <div className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-xl dark:border-gray-800 dark:bg-[#1C1C1E] lg:col-span-7">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Empleado Cabecera
                  </label>
                  <input
                    type="text"
                    list="lista-empleados-sugeridos-datos"
                    value={empleadoHeader}
                    onChange={(e) => handleCambiarEmpleadoCabecera(e.target.value)}
                    onKeyDown={handleEnterBlur}
                    className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-900 uppercase dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800 max-h-[400px]">
                  <table className="w-full text-left text-xs text-gray-700 dark:text-gray-300">
                    <thead className="sticky top-0 z-10 border-b bg-gray-100 text-[11px] uppercase tracking-wider text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                      <tr>
                        <th className="px-2 py-2 w-8 text-center">N°</th>
                        <th className="px-2 py-2">Fecha</th>
                        <th className="px-2 py-2">Inicio</th>
                        <th className="px-2 py-2">Fin</th>
                        <th className="px-2 py-2">Artículos</th>
                        <th className="px-2 py-2">Empleado Asignado</th>
                        <th className="px-2 py-2 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-[#1C1C1E]">
                      {filas.map((f, index) => (
                        <FilaSheetEditor
                          key={f.id}
                          f={f}
                          index={index}
                          empleadoHeader={empleadoHeader}
                          handleActualizarFila={handleActualizarFila}
                          handleEliminarFila={handleEliminarFila}
                          handleEnterBlur={handleEnterBlur}
                        />
                      ))}
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

              <div className="flex items-center justify-end space-x-3 border-t border-gray-200 pt-4 mt-4 dark:border-gray-800">
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
        </div>
      </div>
    </div>
  );
}
