import React, { useState } from 'react';
import { useArmadoStore } from '../../stores/armadoStore';
import { guardarPlanillaVerificada } from '../../services/firestoreService';
import { guardarImagenLocal } from '../../services/localImageStore';
import { rotarImagenBase64 } from '../../utils/imageUtils';
import { IrregularityResolver } from './IrregularityResolver';
import { InteractiveImageViewer } from './InteractiveImageViewer';
import { CheckCircle, Trash2, AlertTriangle, SkipForward, SkipBack, RefreshCw, AlertCircle, Sparkles, FileJson } from 'lucide-react';

import { useEmpleadosSugeridos } from '../../hooks/useEmpleadosSugeridos';

export function VerificationSideBySide() {
  const {
    itemsPendientes,
    itemActualIndex,
    cantVerificadasLote,
    actualizarFilaActual,
    actualizarCabeceraActual,
    removerFilaActual,
    reemplazarFilasItemActual,
    saltarASiguientePlanilla,
    irAPlanillaAnterior,
    marcarActualComoVerificado,
    iniciarProgresoScan,
    actualizarProgresoScan,
    finalizarProgresoScan,
  } = useArmadoStore();

  const sugerenciasEmpleados = useEmpleadosSugeridos();
  const [guardando, setGuardando] = useState(false);
  const [reescaneando, setReescaneando] = useState(false);
  const [rotacionGrados, setRotacionGrados] = useState(0);
  const [mensajeReescanear, setMensajeReescanear] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const actual = itemsPendientes[itemActualIndex];

  if (!isMounted || !actual) return null;

  const totalLote = cantVerificadasLote + itemsPendientes.length;
  const numActual = cantVerificadasLote + 1;
  const porcentajeProgreso = totalLote > 0 ? Math.round((cantVerificadasLote / totalLote) * 100) : 0;

  const faltaEmpleado =
    !actual.empleadoHeader ||
    actual.empleadoHeader.trim() === '' ||
    actual.empleadoHeader === 'Empleado Desconocido';

  const handleConfirmar = async () => {
    setGuardando(true);
    try {
      const docId = await guardarPlanillaVerificada(actual);
      if (actual.imagenBase64) {
        // Si el usuario rotó la imagen en la previsualización, la rotamos en canvas antes de guardar
        const imagenAGuardar = rotacionGrados !== 0
          ? await rotarImagenBase64(actual.imagenBase64, rotacionGrados)
          : actual.imagenBase64;

        await guardarImagenLocal(docId, imagenAGuardar);
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

  const handleReescanear = async () => {
    if (!actual.imagenBase64) return;
    setReescaneando(true);
    setMensajeReescanear(null);

    // Iniciar widget flotante de progreso de re-escaneo
    iniciarProgresoScan(1);
    const nombreRef = actual.empleadoHeader && actual.empleadoHeader !== 'Empleado Desconocido'
      ? `Re-escaneo: ${actual.empleadoHeader}`
      : `Re-escaneo: Planilla #${numActual}`;

    actualizarProgresoScan({
      indiceActual: 1,
      nombreArchivo: nombreRef,
      porcentajePlanilla: 5,
      porcentajeGlobal: 100,
    });

    let pctLocal = 5;
    const timerProgreso = setInterval(() => {
      pctLocal = Math.min(92, pctLocal + Math.floor(Math.random() * 8) + 4);
      actualizarProgresoScan({ porcentajePlanilla: pctLocal });
    }, 180);

    try {
      const res = await fetch('/api/control-armado/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imagenBase64: actual.imagenBase64,
          modoAltaPrecision: true,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Error al re-escanear planilla.');
      }

      const data = await res.json();
      if (Array.isArray(data.filas)) {
        const nuevasFilas = data.filas.map((f: any, idx: number) => ({
          id: f.id || `f-reescan-${idx}-${Date.now()}`,
          fecha: f.fecha || actual.fechaPrimeraFila,
          horaInicio: f.horaInicio || '',
          horaFin: f.horaFin || '',
          cantArticulos: Number(f.cantArticulos) || 0,
          notaIrregularidad: f.notaIrregularidad || null,
          esIrregular: Boolean(f.esIrregular),
          empleadoAsignado: (data.empleadoHeader || actual.empleadoHeader || '').toUpperCase(),
        }));

        const headerUpper = (data.empleadoHeader || actual.empleadoHeader || '').toUpperCase();
        reemplazarFilasItemActual(nuevasFilas, headerUpper);
        setMensajeReescanear('✨ Re-escaneo completado con prompt de alta atención de IA.');

        clearInterval(timerProgreso);
        actualizarProgresoScan({ porcentajePlanilla: 100, porcentajeGlobal: 100 });
        setTimeout(() => setMensajeReescanear(null), 3000);
      }
    } catch (err: any) {
      clearInterval(timerProgreso);
      console.error(err);
      alert(`Error al re-escanear: ${err.message || 'Error desconocido'}`);
    } finally {
      setReescaneando(false);
      setTimeout(() => finalizarProgresoScan(), 1000);
    }
  };

  return (
    <div className="space-y-4">
      {/* Datalist Reutilizable de Sugerencias de Empleados en Mayúsculas */}
      <datalist id="lista-empleados-sugeridos">
        {sugerenciasEmpleados.map((emp) => (
          <option key={emp} value={emp} />
        ))}
      </datalist>

      {/* Banner de Contador de Progreso en Lote */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-xl border border-blue-200 bg-blue-50/80 p-3.5 shadow-sm dark:border-blue-900/40 dark:bg-blue-950/30 text-xs">
        <div className="flex items-center space-x-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-[11px] font-bold text-white shadow">
            {numActual}
          </span>
          <div>
            <p className="font-bold text-blue-900 dark:text-blue-200">
              Verificando Planilla {numActual} de {totalLote}
            </p>
            <p className="text-[11px] text-blue-700 dark:text-blue-400">
              Quedan <strong className="font-semibold">{itemsPendientes.length}</strong> planillas en la cola ({cantVerificadasLote} completadas)
            </p>
          </div>
        </div>

        <div className="mt-2 sm:mt-0 flex items-center space-x-3 w-full sm:w-auto">
          <div className="h-2 w-full sm:w-32 overflow-hidden rounded-full bg-blue-200 dark:bg-blue-900/60">
            <div
              className="h-full bg-blue-600 transition-all duration-300 dark:bg-blue-400"
              style={{ width: `${porcentajeProgreso}%` }}
            />
          </div>
          <span className="text-[11px] font-bold text-blue-800 dark:text-blue-300 shrink-0">
            {porcentajeProgreso}%
          </span>
        </div>
      </div>

      {mensajeReescanear && (
        <div className="flex items-center space-x-2 rounded-xl bg-purple-500/10 p-3 text-xs font-semibold text-purple-700 dark:text-purple-300">
          <Sparkles className="h-4 w-4 shrink-0 text-purple-600" />
          <span>{mensajeReescanear}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Columna Izquierda: Visor Interactivo de Imagen o Panel Externa */}
        <div className="flex flex-col rounded-2xl border border-gray-200 bg-gray-900 p-4 shadow-xl dark:border-gray-800 lg:col-span-5">
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
        <div className="flex flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-800 dark:bg-[#1C1C1E] lg:col-span-7">
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
              Empleado Cabecera de la Planilla
            </label>
            <input
              type="text"
              list="lista-empleados-sugeridos"
              value={actual.empleadoHeader}
              onFocus={() => {
                if (actual.empleadoHeader === 'Empleado Desconocido') {
                  actualizarCabeceraActual('', actual.fechaPlanilla || '');
                }
              }}
              onChange={(e) => actualizarCabeceraActual(e.target.value.toUpperCase(), actual.fechaPlanilla || '')}
              placeholder="Ingrese o seleccione empleado en MAYÚSCULAS..."
              className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none transition-all uppercase ${
                faltaEmpleado
                  ? 'border-2 border-red-500 bg-red-50/70 text-red-900 ring-2 ring-red-400/50 dark:bg-red-950/40 dark:text-red-200'
                  : 'border-gray-300 bg-gray-50 text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white'
              }`}
            />
            {faltaEmpleado && (
              <p className="mt-1 flex items-center space-x-1 text-[11px] font-semibold text-red-600 dark:text-red-400">
                <AlertCircle className="h-3.5 w-3.5" />
                <span>Atención: Ingrese el nombre del empleado de la cabecera</span>
              </p>
            )}
          </div>

          {/* Tabla Editable con Asociación Visual Directa por Fila */}
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-700 dark:text-gray-300">
              <thead className="border-b bg-gray-50 text-[11px] uppercase tracking-wider text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                <tr>
                  <th className="px-2 py-2 w-9 text-center">N°</th>
                  <th className="px-2 py-2">Fecha</th>
                  <th className="px-2 py-2">Inicio</th>
                  <th className="px-2 py-2">Fin</th>
                  <th className="px-2 py-2">Artículos</th>
                  <th className="px-2 py-2">Asignado</th>
                  <th className="px-2 py-2 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {actual.filas.map((fila, index) => {
                  const numLinea = index + 1;
                  const esIgnorada = fila.accionIrregularidad === 'ignorar';
                  const esIrregular = fila.esIrregular;
                  const faltaHoraInicio = !fila.horaInicio || fila.horaInicio.trim() === '';
                  const faltaHoraFin = !fila.horaFin || fila.horaFin.trim() === '';

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
                        <td className="px-1.5 py-2 text-center font-mono">
                          <span
                            className="inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                            title={`Línea #${numLinea}`}
                          >
                            {numLinea}
                          </span>
                        </td>
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
                            className={`rounded border px-1.5 py-1 text-[11px] transition-colors ${
                              faltaHoraInicio
                                ? 'border-2 border-amber-500 bg-amber-100 text-amber-900 font-bold dark:bg-amber-950/60 dark:text-amber-200'
                                : 'border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-800'
                            }`}
                          />
                        </td>
                        <td className="px-2 py-2">
                          <input
                            type="time"
                            value={fila.horaFin}
                            onChange={(e) => actualizarFilaActual(fila.id, { horaFin: e.target.value })}
                            className={`rounded border px-1.5 py-1 text-[11px] transition-colors ${
                              faltaHoraFin
                                ? 'border-2 border-amber-500 bg-amber-100 text-amber-900 font-bold dark:bg-amber-950/60 dark:text-amber-200'
                                : 'border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-800'
                            }`}
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

          {/* Botones de Acción: Anterior, Confirmar, Re-escanear con IA, Saltar */}
          <div className="mt-6 flex flex-col space-y-2 sm:flex-row sm:space-x-3 sm:space-y-0">
            <button
              onClick={irAPlanillaAnterior}
              disabled={guardando || reescaneando}
              className="flex items-center justify-center space-x-2 rounded-xl border border-gray-300 bg-gray-100 px-4 py-3 font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 text-xs"
              title="Volver a la planilla no verificada anterior"
            >
              <SkipBack className="h-4 w-4" />
              <span>Anterior</span>
            </button>

            <button
              onClick={handleConfirmar}
              disabled={guardando || reescaneando}
              className="flex-1 flex items-center justify-center space-x-2 rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white shadow-md transition-all hover:bg-blue-700 disabled:opacity-50 text-xs"
            >
              <CheckCircle className="h-4 w-4" />
              <span>{guardando ? 'Guardando en Firestore...' : 'Confirmar Planilla Verificada'}</span>
            </button>

            <button
              onClick={handleReescanear}
              disabled={guardando || reescaneando}
              className="flex items-center justify-center space-x-2 rounded-xl bg-purple-600 px-4 py-3 font-semibold text-white shadow-md transition-all hover:bg-purple-700 disabled:opacity-50 text-xs"
              title="Re-escanear esta planilla ordenándole a la IA prestar máxima atención"
            >
              <RefreshCw className={`h-4 w-4 ${reescaneando ? 'animate-spin' : ''}`} />
              <span>{reescaneando ? 'Re-escaneando...' : 'Re-escanear (IA)'}</span>
            </button>

            <button
              onClick={saltarASiguientePlanilla}
              disabled={guardando || reescaneando}
              className="flex items-center justify-center space-x-2 rounded-xl border border-gray-300 bg-gray-100 px-4 py-3 font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 text-xs"
              title="Posponer esta planilla para revisarla más tarde y pasar a la siguiente"
            >
              <SkipForward className="h-4 w-4" />
              <span>Saltar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
