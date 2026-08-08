// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useArmadoStore } from '../../stores/armadoStore';
import { UploadCloud, Loader2 } from 'lucide-react';
import { verificarDuplicado } from '../../services/firestoreService';

export function BatchDropzone() {
  const { agregarItemPendiente, setCargandoScan, setErrorScan, setAlertaDuplicado, cargandoScan } =
    useArmadoStore();

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (!acceptedFiles.length) return;
      setCargandoScan(true);
      setErrorScan(null);
      setAlertaDuplicado(null);

      const hoyStr = new Date().toISOString().split('T')[0];

      for (const file of acceptedFiles) {
        try {
          const base64 = await fileToBase64(file);
          const res = await fetch('/api/control-armado/scan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imagenBase64: base64 }),
          });

          if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.error || 'Error al procesar la imagen con Gemini OCR.');
          }
          const data = await res.json();

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

          agregarItemPendiente({
            id: resVerif.docExistenteId || `scan-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            empleadoHeader: data.empleadoHeader || 'Empleado Desconocido',
            fechaPrimeraFila: primeraFilaFecha,
            horaInicioPrimeraFila: primeraFilaHora,
            estado: 'pendiente_verificacion',
            imagenBase64: base64,
            filas: (data.filas || []).map((f: any, idx: number) => ({
              id: f.id || `f-${idx}-${Date.now()}`,
              fecha: f.fecha || primeraFilaFecha,
              horaInicio: f.horaInicio || '08:00',
              horaFin: f.horaFin || '09:00',
              cantArticulos: Number(f.cantArticulos) || 0,
              notaIrregularidad: f.notaIrregularidad || null,
              esIrregular: Boolean(f.esIrregular),
              empleadoAsignado: data.empleadoHeader,
            })),
            creadoEn: new Date().toISOString(),
          });
        } catch (err: any) {
          console.error(err);
          setErrorScan(`Error al procesar "${file.name}": ${err.message || 'Error desconocido'}`);
        }
      }

      setCargandoScan(false);
    },
    [agregarItemPendiente, setCargandoScan, setErrorScan, setAlertaDuplicado]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
    multiple: true,
  });

  return (
    <div
      {...getRootProps()}
      className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
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
