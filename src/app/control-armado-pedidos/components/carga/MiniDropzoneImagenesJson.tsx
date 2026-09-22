// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import React from 'react';
import { useDropzone } from 'react-dropzone';
import { ImagePlus, X, Image as ImageIcon } from 'lucide-react';

interface MiniDropzoneImagenesJsonProps {
  archivos: File[];
  onArchivosChange: (archivos: File[]) => void;
  compacto?: boolean;
}

export function MiniDropzoneImagenesJson({
  archivos,
  onArchivosChange,
  compacto = false,
}: MiniDropzoneImagenesJsonProps) {
  const onDrop = React.useCallback(
    (nuevos: File[]) => {
      onArchivosChange([...archivos, ...nuevos]);
    },
    [archivos, onArchivosChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
    multiple: true,
  });

  const removerArchivo = (index: number) => {
    onArchivosChange(archivos.filter((_, idx) => idx !== index));
  };

  const limpiarTodos = () => {
    onArchivosChange([]);
  };

  return (
    <div className="space-y-2">
      <div
        {...getRootProps()}
        className={`relative flex cursor-pointer items-center justify-center rounded-xl border border-dashed transition-all ${
          compacto ? 'p-2.5' : 'p-3'
        } ${
          isDragActive
            ? 'border-purple-500 bg-purple-50/50 dark:border-purple-400 dark:bg-purple-950/20'
            : 'border-purple-200 bg-purple-50/30 hover:border-purple-400 hover:bg-purple-50/50 dark:border-purple-900/40 dark:bg-[#252528]/40 dark:hover:border-purple-600'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex items-center space-x-2 text-center text-xs">
          <ImagePlus className="h-4 w-4 shrink-0 text-purple-600 dark:text-purple-400" />
          <span className="font-medium text-gray-700 dark:text-gray-300">
            {isDragActive
              ? 'Suelte las fotos de las planillas aquí...'
              : 'Arrastre las fotos originales o haga clic para adjuntar (opcional)'}
          </span>
        </div>
      </div>

      {archivos.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          <span className="text-[10px] font-bold uppercase tracking-wide text-purple-700 dark:text-purple-300">
            {archivos.length} {archivos.length === 1 ? 'foto lista' : 'fotos listas'}:
          </span>
          {archivos.map((archivo, idx) => (
            <span
              key={idx}
              className="inline-flex items-center space-x-1 rounded-md border border-purple-200 bg-purple-50 px-2 py-0.5 text-[10px] text-purple-800 dark:border-purple-900/60 dark:bg-purple-950/50 dark:text-purple-300"
            >
              <ImageIcon className="h-3 w-3 shrink-0 opacity-70" />
              <span className="max-w-[120px] truncate">{archivo.name}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removerArchivo(idx);
                }}
                className="hover:text-red-500"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          <button
            type="button"
            onClick={limpiarTodos}
            className="text-[10px] font-semibold text-gray-400 hover:text-red-500 dark:hover:text-red-400 pl-1"
          >
            Quitar todas
          </button>
        </div>
      )}
    </div>
  );
}
