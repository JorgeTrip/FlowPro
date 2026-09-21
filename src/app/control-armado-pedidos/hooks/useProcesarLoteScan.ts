// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import { useCallback } from 'react';
import { useArmadoStore } from '../stores/armadoStore';
import { useGeminiQuotaStore } from '../stores/useGeminiQuotaStore';
import { verificarDuplicado, guardarPlanillaPendienteFirestore } from '../services/firestoreService';
import { optimizarImagenBase64 } from '../utils/imageUtils';
import { RegistroArmadoDocumento } from '../types/armado';
import { ArchivoFallidoScan } from '../stores/armadoStoreTypes';

/**
 * Hook personalizado que orquesta el procesamiento secuencial en lote de imágenes
 * escaneadas con IA (Gemini Vision OCR), controlando cuotas, reintentos y registro
 * exhaustivo de fallos para su posterior análisis o reintento.
 */
export function useProcesarLoteScan() {
  const {
    setCargandoScan,
    setErrorScan,
    setAlertaDuplicado,
    iniciarProgresoScan,
    actualizarProgresoScan,
    finalizarProgresoScan,
    limpiarArchivosFallidosScan,
    setArchivosFallidosScan,
    setModalFallosScanAbierto,
  } = useArmadoStore();

  const procesarArchivos = useCallback(
    async (acceptedFiles: File[]) => {
      if (!acceptedFiles || acceptedFiles.length === 0) return;

      useArmadoStore.getState().resetCancelarScan();
      limpiarArchivosFallidosScan();
      setCargandoScan(true);
      setErrorScan(null);
      setAlertaDuplicado(null);

      const totalArchivos = acceptedFiles.length;
      const hoyStr = new Date().toISOString().split('T')[0];
      const listaFallidos: ArchivoFallidoScan[] = [];
      iniciarProgresoScan(totalArchivos);

      for (let i = 0; i < acceptedFiles.length; i++) {
        if (useArmadoStore.getState().cancelarScanSolicitado) break;
        if (i > 0) await new Promise((resolve) => setTimeout(resolve, 1200));

        const file = acceptedFiles[i];
        const indiceActual = i + 1;
        const porcentajeGlobal = Math.round((i / totalArchivos) * 100);

        actualizarProgresoScan({ indiceActual, nombreArchivo: file.name, porcentajePlanilla: 5, porcentajeGlobal });

        let pctLocal = 5;
        const timerProgreso = setInterval(() => {
          pctLocal = Math.min(92, pctLocal + Math.floor(Math.random() * 8) + 4);
          actualizarProgresoScan({ porcentajePlanilla: pctLocal });
        }, 180);

        let procesadoExitoso = false;
        let intentosArchivo = 0;

        try {
          const base64 = await optimizarImagenBase64(file);

          while (!procesadoExitoso && intentosArchivo < 6) {
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
                  if (useArmadoStore.getState().cancelarScanSolicitado) break;
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
                throw new Error(errData.error || 'Error en respuesta de servidor Gemini OCR.');
              }
            }

            const data = await res.json();
            procesadoExitoso = true;

            const primeraFilaHora = data.filas?.[0]?.horaInicio || '00:00';
            const primeraFilaFecha = data.filas?.[0]?.fecha || hoyStr;

            const resVerif = await verificarDuplicado(data.empleadoHeader, primeraFilaFecha, primeraFilaHora);
            if (resVerif.esDuplicado && !resVerif.docIncompleto) {
              setAlertaDuplicado(
                `ℹ️ La planilla de "${data.empleadoHeader}" (${primeraFilaFecha} - ${primeraFilaHora}) ya existía en Firestore. Se ha cargado a la cola.`
              );
            }

            const itemPendiente: RegistroArmadoDocumento = {
              id: `scan-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
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
            if (!idGuardado) {
              useArmadoStore.getState().agregarItemPendiente(itemPendiente);
            }

            clearInterval(timerProgreso);
            actualizarProgresoScan({
              porcentajePlanilla: 100,
              porcentajeGlobal: Math.round((indiceActual / totalArchivos) * 100),
            });
          }
        } catch (err: any) {
          clearInterval(timerProgreso);
          console.error(`Fallo al procesar ${file.name}:`, err);
          listaFallidos.push({
            id: `fallo-${Date.now()}-${i}`,
            nombreArchivo: file.name,
            motivo: err.message || 'Error desconocido al procesar la imagen.',
            archivo: file,
          });
        }
      }

      setCargandoScan(false);
      setTimeout(() => finalizarProgresoScan(), 800);

      if (listaFallidos.length > 0) {
        setArchivosFallidosScan(listaFallidos);
        setModalFallosScanAbierto(true);
      }
    },
    [
      setCargandoScan,
      setErrorScan,
      setAlertaDuplicado,
      iniciarProgresoScan,
      actualizarProgresoScan,
      finalizarProgresoScan,
      limpiarArchivosFallidosScan,
      setArchivosFallidosScan,
      setModalFallosScanAbierto,
    ]
  );

  return { procesarArchivos };
}
