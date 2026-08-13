// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import React, { useState, useEffect } from 'react';
import { RegistroArmadoDocumento } from '../../types/armado';
import { obtenerImagenLocal } from '../../services/localImageStore';
import { Edit3, Trash2, User, RefreshCw, ZoomIn, ImageOff, FileText, Clock, FileJson } from 'lucide-react';

interface SheetCardProps {
  p: RegistroArmadoDocumento;
  onEditar: (p: RegistroArmadoDocumento) => void;
  onEliminar: (id: string, emp: string) => void;
  onVerImagen: (base64: string, titulo: string) => void;
}

export function SheetCard({ p, onEditar, onEliminar, onVerImagen }: SheetCardProps) {
  const [imagenBase64, setImagenBase64] = useState<string | null>(null);
  const [cargandoImg, setCargandoImg] = useState(true);
  const [montado, setMontado] = useState(false);

  useEffect(() => {
    setMontado(true);
    let cancelado = false;
    if (p.id) {
      obtenerImagenLocal(p.id).then((img) => {
        if (!cancelado) {
          setImagenBase64(img);
          setCargandoImg(false);
        }
      });
    } else {
      setCargandoImg(false);
    }
    return () => {
      cancelado = true;
    };
  }, [p.id]);

  const cantFilas = p.filas?.length || 0;

  // Formatear Fecha y Hora de registro
  const fechaHoraStr = p.verificadoEn || p.creadoEn;
  let fechaHoraFormateada = '';
  if (montado && fechaHoraStr) {
    try {
      const dateObj = new Date(fechaHoraStr);
      if (!isNaN(dateObj.getTime())) {
        fechaHoraFormateada = `${dateObj.toLocaleDateString()} ${dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} hs`;
      } else {
        fechaHoraFormateada = fechaHoraStr;
      }
    } catch {
      fechaHoraFormateada = fechaHoraStr;
    }
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-gray-800 dark:bg-[#1C1C1E]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        {/* Thumbnail de la Planilla con Botón Lightbox */}
        <div className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-gray-900 group">
          {cargandoImg ? (
            <RefreshCw className="h-5 w-5 animate-spin text-gray-400" />
          ) : imagenBase64 ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imagenBase64} alt="Planilla Escaneada" className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105" />
              <button
                onClick={() => onVerImagen(imagenBase64, `Planilla de ${p.empleadoHeader} (${p.fechaPrimeraFila})`)}
                className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-white font-semibold text-xs space-x-1"
              >
                <ZoomIn className="h-4 w-4" />
                <span>Ampliar</span>
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center p-2 text-center text-gray-400">
              <ImageOff className="h-5 w-5 mb-1 text-gray-400" />
              <span className="text-[9px]">Sin imagen local</span>
            </div>
          )}
        </div>

        {/* Información y Tabla Resumen */}
        <div className="flex-1 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-2 dark:border-gray-800">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <User className="h-4 w-4 text-blue-500" />
                <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                  {p.empleadoHeader || 'Empleado Desconocido'}
                </h4>
                <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                  ({cantFilas} pedidos)
                </span>
              </div>

              {/* Metadata de Archivo Original y Timestamp */}
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-gray-500 dark:text-gray-400">
                {p.nombreArchivoOriginal && (
                  <div
                    className={`flex items-center space-x-1 truncate max-w-xs ${
                      p.nombreArchivoOriginal.includes('Externa')
                        ? 'text-purple-600 font-bold dark:text-purple-400'
                        : 'text-gray-700 dark:text-gray-300 font-medium'
                    }`}
                    title={p.nombreArchivoOriginal}
                  >
                    {p.nombreArchivoOriginal.includes('Externa') ? (
                      <FileJson className="h-3.5 w-3.5 text-purple-500 shrink-0" />
                    ) : (
                      <FileText className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                    )}
                    <span className="truncate font-mono">
                      {p.nombreArchivoOriginal}
                    </span>
                  </div>
                )}
                {fechaHoraFormateada && (
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                    <span suppressHydrationWarning>{fechaHoraFormateada}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => onEditar(p)}
                className="flex items-center space-x-1 rounded-xl border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100 dark:border-blue-800/60 dark:bg-blue-950/40 dark:text-blue-300"
              >
                <Edit3 className="h-3.5 w-3.5" />
                <span>Editar</span>
              </button>
              <button
                onClick={() => p.id && onEliminar(p.id, p.empleadoHeader)}
                className="rounded-xl p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600 dark:text-gray-400">
              <thead>
                <tr className="text-[10px] uppercase text-gray-400 border-b border-gray-100 dark:border-gray-800">
                  <th className="py-1 px-2">Fecha</th>
                  <th className="py-1 px-2">Horario</th>
                  <th className="py-1 px-2">Artículos</th>
                  <th className="py-1 px-2">Asignado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800/40">
                {p.filas?.slice(0, 4).map((f) => (
                  <tr key={f.id}>
                    <td className="py-1 px-2 font-mono text-[11px]">{f.fecha}</td>
                    <td className="py-1 px-2">{f.horaInicio} - {f.horaFin}</td>
                    <td className="py-1 px-2 font-bold text-gray-900 dark:text-gray-200">{f.cantArticulos}</td>
                    <td className="py-1 px-2">{f.empleadoAsignado || p.empleadoHeader}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
