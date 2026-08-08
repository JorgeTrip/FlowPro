// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ZoomIn, ZoomOut, RotateCw, RefreshCw } from 'lucide-react';

interface InteractiveImageViewerProps {
  src?: string;
  onRotacionChange?: (rotacion: number) => void;
}

export function InteractiveImageViewer({ src, onRotacionChange }: InteractiveImageViewerProps) {
  const [zoom, setZoom] = useState(1);
  const [rotacion, setRotacion] = useState(0);
  const [posicion, setPosicion] = useState({ x: 0, y: 0 });
  const [arrastrando, setArrastrando] = useState(false);
  const [inicioArrastre, setInicioArrastre] = useState({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);

  // Escuchador nativo para interceptar la rueda del mouse y suspender el scroll de la página web
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onWheelNativo = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const factor = e.deltaY < 0 ? 0.15 : -0.15;
      setZoom((z) => Math.max(0.5, Math.min(4, z + factor)));
    };

    // { passive: false } es fundamental para permitir e.preventDefault() en eventos wheel
    el.addEventListener('wheel', onWheelNativo, { passive: false });

    return () => {
      el.removeEventListener('wheel', onWheelNativo);
    };
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setArrastrando(true);
    setInicioArrastre({ x: e.clientX - posicion.x, y: e.clientY - posicion.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!arrastrando) return;
    setPosicion({ x: e.clientX - inicioArrastre.x, y: e.clientY - inicioArrastre.y });
  };

  const handleMouseUp = () => setArrastrando(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setArrastrando(true);
      const touch = e.touches[0];
      setInicioArrastre({ x: touch.clientX - posicion.x, y: touch.clientY - posicion.y });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (arrastrando && e.touches.length === 1) {
      const touch = e.touches[0];
      setPosicion({ x: touch.clientX - inicioArrastre.x, y: touch.clientY - inicioArrastre.y });
    }
  };

  const resetearVisor = () => {
    setZoom(1);
    setRotacion(0);
    setPosicion({ x: 0, y: 0 });
    onRotacionChange?.(0);
  };

  const handleRotar = () => {
    const nuevaRotacion = (rotacion + 90) % 360;
    setRotacion(nuevaRotacion);
    onRotacionChange?.(nuevaRotacion);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="mb-3 flex items-center justify-between border-b border-gray-800 pb-2">
        <span className="text-xs font-semibold text-gray-300">Planilla Escaneada (OCR Vision)</span>
        <div className="flex space-x-1.5">
          <button
            onClick={() => setZoom((z) => Math.min(z + 0.25, 4))}
            className="rounded bg-gray-800 p-1.5 text-gray-300 hover:bg-gray-700"
            title="Acercar (+)"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(z - 0.25, 0.5))}
            className="rounded bg-gray-800 p-1.5 text-gray-300 hover:bg-gray-700"
            title="Alejar (-)"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <button
            onClick={handleRotar}
            className="rounded bg-gray-800 p-1.5 text-gray-300 hover:bg-gray-700"
            title="Rotar 90°"
          >
            <RotateCw className="h-4 w-4" />
          </button>
          <button
            onClick={resetearVisor}
            className="rounded bg-gray-800 p-1.5 text-gray-300 hover:bg-gray-700"
            title="Resetear Visor"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMouseUp}
        className={`relative flex h-[500px] w-full items-center justify-center overflow-hidden rounded-lg bg-black/50 select-none ${
          arrastrando ? 'cursor-grabbing' : 'cursor-grab'
        }`}
      >
        {src ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={src}
            alt="Planilla escaneada"
            draggable={false}
            style={{
              transform: `translate(${posicion.x}px, ${posicion.y}px) scale(${zoom}) rotate(${rotacion}deg)`,
              transition: arrastrando ? 'none' : 'transform 0.1s ease-out',
            }}
            className="max-h-full max-w-full object-contain pointer-events-none"
          />
        ) : (
          <p className="text-xs text-gray-500">Sin imagen disponible</p>
        )}
      </div>
      <p className="mt-2 text-[10px] text-gray-400 text-center">
        💡 Al estar sobre la imagen, el rodillo hace Zoom sin mover la página. Afuera se restaura el scroll normal.
      </p>
    </div>
  );
}
