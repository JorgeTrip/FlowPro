// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import React from 'react';
import { useDropzone } from 'react-dropzone';
import { useArmadoStore } from '../../stores/armadoStore';
import { useProcesarLoteScan } from '../../hooks/useProcesarLoteScan';
import { UploadCloud, Loader2 } from 'lucide-react';

/**
 * Componente declarativo de área drag-and-drop para la carga masiva de fotos de planillas.
 * Delega la orquestación del escaneo y la captura de errores al hook `useProcesarLoteScan`.
 */
export function BatchDropzone() {
  const { cargandoScan } = useArmadoStore();
  const { procesarArchivos } = useProcesarLoteScan();

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: procesarArchivos,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
    multiple: true,
  });

  return (
    <div
      {...getRootProps()}
      className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-6 text-center transition-all flex h-full w-full flex-col items-center justify-center ${
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
            {cargandoScan ? 'Procesando imágenes con Gemini Vision OCR...' : 'Arrastre planillas escaneadas o haga clic para seleccionar'}
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Soporta carga masiva de imágenes (JPG, PNG, WebP)
          </p>
        </div>
      </div>
    </div>
  );
}
