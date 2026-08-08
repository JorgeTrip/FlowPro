// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useArmadoStore } from '../../stores/armadoStore';
import { useGeminiQuotaStore } from '../../stores/useGeminiQuotaStore';
import { UploadCloud, Loader2 } from 'lucide-react';
import { verificarDuplicado, guardarPlanillaPendienteFirestore } from '../../services/firestoreService';
import { RegistroArmadoDocumento } from '../../types/armado';

export function BatchDropzone() {
  const {
    agregarItemPendiente,
    setCargandoScan,
    setErrorScan,
    setAlertaDuplicado,
    cargandoScan,
    iniciarProgresoScan,
    actualizarProgresoScan,
    finalizarProgresoScan,
  } = useArmadoStore();

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (!acceptedFiles || acceptedFiles.length === 0) return;

      useArmadoStore.getState().resetCancelarScan();
      setCargandoScan(true);
      setErrorScan(null);
      setAlertaDuplicado(null);

      const totalArchivos = acceptedFiles.length;
      const hoyStr = new Date().toISOString().split('T')[0];
      iniciarProgresoScan(totalArchivos);

      for (let i = 0; i < acceptedFiles.length; i++) {
        if (useArmadoStore.getState().cancelarScanSolicitado) {
          console.log('[BatchDropzone] Proceso de lote cancelado por el usuario.');
          break;
        }

        // Regulación de velocidad entre planillas de un lote para no saturar la API
        if (i > 0) {
          await new Promise((resolve) => setTimeout(resolve, 1500));
        }

        const file = acceptedFiles[i];
        const indiceActual = i + 1;
        const porcentajeGlobal = Math.round((i / totalArchivos) * 100);

        actualizarProgresoScan({
          indiceActual,
          nombreArchivo: file.name,
          porcentajePlanilla: 5,
          porcentajeGlobal,
        });

        // Intervalo para animación fluida continua del escaneo de la planilla actual (0-90%)
        let pctLocal = 5;
        const timerProgreso = setInterval(() => {
          pctLocal = Math.min(92, pctLocal + Math.floor(Math.random() * 8) + 4);
          actualizarProgresoScan({ porcentajePlanilla: pctLocal });
        }, 180);

        let procesadoExitoso = false;
        let intentosArchivo = 0;

        try {
          const base64 = await fileToBase64(file);

          while (!procesadoExitoso && intentosArchivo < 10) {
            if (useArmadoStore.getState().cancelarScanSolicitado) {
              clearInterval(timerProgreso);
              break;
            }

            intentosArchivo++;
            useGeminiQuotaStore.getState().registrarPeticion();

            const res = await fetch('/api/control-armado/scan', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ imagenBase64: base64 }),
            });

            if (!res.ok) {
              const errData = await res.json();
              if (res.status === 429 || errData.esErrorCuota) {
                let segsRestantes = errData.segundosReintento || 35;
                const segsTotales = segsRestantes;

                while (segsRestantes > 0) {
                  if (useArmadoStore.getState().cancelarScanSolicitado) {
                    break;
                  }

                  const pctEspera = Math.min(95, Math.round(((segsTotales - segsRestantes) / segsTotales) * 100));
                  actualizarProgresoScan({
                    mensajeEstado: `Reintentando en ${segsRestantes}s (Cuota de Gemini)...`,
                    porcentajePlanilla: pctEspera,
                  });
                  await new Promise((resolve) => setTimeout(resolve, 1000));
                  segsRestantes--;
                }

                if (useArmadoStore.getState().cancelarScanSolicitado) {
                  clearInterval(timerProgreso);
                  break;
                }

                actualizarProgresoScan({ mensajeEstado: undefined, porcentajePlanilla: 5 });
                continue;
              } else {
                throw new Error(errData.error || 'Error al procesar la imagen con Gemini OCR.');
              }
            }

            const data = await res.json();
            procesadoExitoso = true;

            const primeraFilaHora = data.filas?.[0]?.horaInicio || '00:00';
            const primeraFilaFecha = data.filas?.[0]?.fecha || hoyStr;

            const resVerif = await verificarDuplicado(
              data.empleadoHeader,
              primeraFilaFecha,
              primeraFilaHora
            );

            if (resVerif.esDuplicado && !resVerif.docIncompleto) {
              setAlertaDuplicado(
                `ℹ️ La planilla de "${data.empleadoHeader}" (${primeraFilaFecha} - ${primeraFilaHora}) ya existía en Firestore. Se ha vuelto a cargar a la cola para permitir su actualización o re-verificación.`
              );
            }

            const itemPendiente: RegistroArmadoDocumento = {
              id: resVerif.docExistenteId || `scan-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
              empleadoHeader: data.empleadoHeader || 'Empleado Desconocido',
              fechaPrimeraFila: primeraFilaFecha,
              horaInicioPrimeraFila: primeraFilaHora,
              estado: 'pendiente_verificacion',
              imagenBase64: base64,
              nombreArchivoOriginal: file.name,
              creadoEn: new Date().toISOString(),
              filas: (data.filas || []).map((f: any, idx: number) => ({
                id: f.id || `f-${idx}-${Date.now()}`,
                fecha: f.fecha || hoyStr,
                horaInicio: f.horaInicio || '',
                horaFin: f.horaFin || '',
                cantArticulos: Number(f.cantArticulos) || 0,
                notaIrregularidad: f.notaIrregularidad || null,
                esIrregular: Boolean(f.esIrregular),
              })),
            };

            const idGuardado = await guardarPlanillaPendienteFirestore(itemPendiente);
            itemPendiente.id = idGuardado;

            agregarItemPendiente(itemPendiente);

            clearInterval(timerProgreso);
            actualizarProgresoScan({
              porcentajePlanilla: 100,
              porcentajeGlobal: Math.round((indiceActual / totalArchivos) * 100),
            });
          }
        } catch (err: any) {
          clearInterval(timerProgreso);
          console.error(err);
          setErrorScan(`Error al procesar "${file.name}": ${err.message || 'Error desconocido'}`);
        }
      }

      setCargandoScan(false);
      setTimeout(() => finalizarProgresoScan(), 1000);
    },
    [
      agregarItemPendiente,
      setCargandoScan,
      setErrorScan,
      setAlertaDuplicado,
      iniciarProgresoScan,
      actualizarProgresoScan,
      finalizarProgresoScan,
    ]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
    multiple: true,
  });

  return (
    <div
      {...getRootProps()}
      className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-6 text-center transition-all flex h-full min-h-[265px] flex-col items-center justify-center ${
        isDragActive
          ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20'
          : 'border-gray-300 hover:border-blue-400 dark:border-gray-700 dark:hover:border-blue-500'
      }`}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center space-y-3">
        {cargandoScan ? (
          <Loader2 className="h-10 w-10 animate-spin text-blue-600 dark:text-blue-400" />
        ) : (
          <div className="rounded-full bg-blue-100 p-3 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400">
            <UploadCloud className="h-8 w-8" />
          </div>
        )}
        <div>
          <p className="text-base font-semibold text-gray-800 dark:text-gray-200">
            {cargandoScan
              ? 'Procesando imágenes con Gemini Vision OCR...'
              : 'Arrastre planillas escaneadas o haga clic para seleccionar'}
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Soporta carga masiva de imágenes (JPG, PNG, WebP)
          </p>
        </div>
      </div>
    </div>
  );
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
  });
}
