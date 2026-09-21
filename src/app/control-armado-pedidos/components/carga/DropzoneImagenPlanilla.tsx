// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useArmadoStore } from '../../stores/armadoStore';
import { optimizarImagenBase64 } from '../../utils/imageUtils';
import { ImagePlus, Loader2, FileJson, AlertCircle } from 'lucide-react';

/**
 * Área interactiva drag-and-drop para adjuntar una imagen física a una planilla
 * que fue importada originalmente mediante JSON externo (sin imagen previa).
 */
export function DropzoneImagenPlanilla() {
  const asignarImagenItemActual = useArmadoStore((state) => state.asignarImagenItemActual);
  const [procesando, setProcesando] = useState(false);
  const [errorLocal, setErrorLocal] = useState<string | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (!acceptedFiles || acceptedFiles.length === 0) return;
      setErrorLocal(null);
      setProcesando(true);

      try {
        const file = acceptedFiles[0];
        const base64Optimizada = await optimizarImagenBase64(file);
        asignarImagenItemActual(base64Optimizada);
      } catch (err: any) {
        console.error('Error al adjuntar imagen a la planilla:', err);
        setErrorLocal(err?.message || 'Error al procesar la imagen seleccionada.');
      } finally {
        setProcesando(false);
      }
    },
    [asignarImagenItemActual]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
    multiple: false,
  });

  return (
    <div
      {...getRootProps()}
      className={`flex flex-1 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-all ${
        isDragActive
          ? 'border-purple-400 bg-purple-900/40 text-purple-100 scale-[0.99]'
          : 'border-purple-500/40 bg-purple-950/20 text-purple-200 hover:border-purple-400 hover:bg-purple-950/30'
      }`}
    >
      <input {...getInputProps()} />

      <div className="flex flex-col items-center space-y-3 max-w-sm">
        {procesando ? (
          <div className="rounded-2xl bg-purple-500/20 p-4 text-purple-300">
            <Loader2 className="h-10 w-10 animate-spin" />
          </div>
        ) : (
          <div className="rounded-2xl bg-purple-500/20 p-4 text-purple-300 transition-transform group-hover:scale-105">
            {isDragActive ? <ImagePlus className="h-10 w-10" /> : <FileJson className="h-10 w-10" />}
          </div>
        )}

        <div className="space-y-1">
          <h4 className="text-sm font-bold text-purple-100">
            {procesando
              ? 'Procesando imagen...'
              : isDragActive
              ? '¡Soltá la imagen aquí!'
              : 'Planilla sin foto física (Importación JSON)'}
          </h4>
          <p className="text-xs text-purple-300">
            {isDragActive
              ? 'Se adjuntará instantáneamente a este registro'
              : 'Arrastra la foto correspondiente aquí o haz clic para seleccionarla'}
          </p>
        </div>

        <p className="text-[11px] text-purple-400 opacity-90">
          Al adjuntarla podrás cotejarla lado a lado, usar la lupa y verificar cada renglón con la foto original.
        </p>

        {errorLocal && (
          <div className="flex items-center space-x-1.5 text-xs text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorLocal}</span>
          </div>
        )}
      </div>
    </div>
  );
}
