// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import React from 'react';
import { InteractiveImageViewer } from '../carga/InteractiveImageViewer';
import { X, ZoomIn } from 'lucide-react';

interface ImageLightboxModalProps {
  imagenBase64: string;
  titulo: string;
  onCerrar: () => void;
}

export function ImageLightboxModal({ imagenBase64, titulo, onCerrar }: ImageLightboxModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <div className="flex h-[90vh] w-full max-w-5xl flex-col rounded-2xl border border-gray-800 bg-gray-900 shadow-2xl overflow-hidden">
        {/* Header Lightbox */}
        <div className="flex items-center justify-between border-b border-gray-800 bg-gray-950 p-4 text-white">
          <div className="flex items-center space-x-2">
            <ZoomIn className="h-5 w-5 text-blue-400" />
            <h3 className="text-sm font-bold truncate max-w-lg">{titulo}</h3>
          </div>
          <button
            onClick={onCerrar}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-800 hover:text-white transition-all"
            title="Cerrar (Esc)"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Visor Interactivo con Pan y Zoom */}
        <div className="relative flex-1 bg-black p-2 overflow-hidden">
          <InteractiveImageViewer src={imagenBase64} />
        </div>
      </div>
    </div>
  );
}
