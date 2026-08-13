// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Loader2, ImagePlus } from 'lucide-react';
import { optimizarImagenBase64 } from '../../utils/imageUtils';

interface DropzoneSheetEditorProps {
  onImagenCargada: (base64: string) => void;
}

export function DropzoneSheetEditor({ onImagenCargada }: DropzoneSheetEditorProps) {
  const [procesando, setProcesando] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (!acceptedFiles || acceptedFiles.length === 0) return;
      setProcesando(true);
      try {
        const file = acceptedFiles[0];
        const optBase64 = await optimizarImagenBase64(file);
        onImagenCargada(optBase64);
      } catch (err) {
        console.error('Error al optimizar imagen subida:', err);
        alert('Error al procesar la imagen seleccionada.');
      } finally {
        setProcesando(false);
      }
    },
    [onImagenCargada]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
    multiple: false,
  });

  return (
    <div
      {...getRootProps()}
      className={`flex flex-col items-center justify-center h-full min-h-[380px] w-full rounded-2xl border-2 border-dashed p-6 text-center transition-all cursor-pointer ${
        isDragActive
          ? 'border-blue-500 bg-blue-950/40 text-blue-300'
          : 'border-gray-700 bg-gray-900/80 hover:border-blue-500 text-gray-300'
      }`}
    >
      <input {...getInputProps()} />
      {procesando ? (
        <div className="flex flex-col items-center space-y-3">
          <Loader2 className="h-10 w-10 animate-spin text-blue-400" />
          <p className="text-xs font-semibold text-blue-300">
            Optimizando imagen automáticamente (&lt; 1MB)...
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center space-y-3">
          <div className="rounded-full bg-blue-500/20 p-4 text-blue-400">
            <ImagePlus className="h-8 w-8" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-200">
              Adjuntar Imagen Escaneada a esta Planilla
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Arrastre un archivo JPG, PNG o WebP aquí o haga clic
            </p>
            <p className="mt-2 text-[11px] font-semibold text-blue-400 bg-blue-950/60 px-2.5 py-1 rounded-full border border-blue-800/40 inline-block">
              ✨ Se comprimirá automáticamente a &lt; 1MB para Firebase
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
