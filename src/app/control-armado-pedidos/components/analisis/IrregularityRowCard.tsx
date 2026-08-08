// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import React, { useState } from 'react';
import { CheckCircle, Edit3, FileText, Calendar, Clock, Package, AlertTriangle, User } from 'lucide-react';

export interface IrregularityItem {
  docId: string;
  filaId: string;
  empleadoHeader: string;
  armador: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  cantArticulos: number;
  notaIrregularidad: string;
  nombreArchivo?: string;
}

interface IrregularityRowCardProps {
  item: IrregularityItem;
  guardando: boolean;
  onNormalizar: (docId: string, filaId: string) => void;
  onGuardarNota: (docId: string, filaId: string, nuevaNota: string) => void;
}

export function IrregularityRowCard({
  item,
  guardando,
  onNormalizar,
  onGuardarNota,
}: IrregularityRowCardProps) {
  const [editando, setEditando] = useState(false);
  const [nota, setNota] = useState(item.notaIrregularidad);

  const handleGuardar = () => {
    onGuardarNota(item.docId, item.filaId, nota);
    setEditando(false);
  };

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50/50 p-4 shadow-sm dark:border-amber-900/50 dark:bg-amber-950/20 transition-all hover:border-amber-300">
      {/* Cabecera del Documento Original */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200/60 pb-2 dark:border-amber-900/40 text-xs">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <div className="flex items-center space-x-1 font-bold text-gray-900 dark:text-white">
            <User className="h-3.5 w-3.5 text-blue-500" />
            <span>Cabecera: {item.empleadoHeader}</span>
          </div>

          <div className="flex items-center space-x-1 font-semibold text-amber-900 dark:text-amber-300">
            <span>• Armador: {item.armador}</span>
          </div>

          {item.nombreArchivo && (
            <div className="flex items-center space-x-1 text-[11px] text-gray-500 dark:text-gray-400 font-mono truncate max-w-xs" title={item.nombreArchivo}>
              <FileText className="h-3 w-3 text-gray-400 shrink-0" />
              <span className="truncate">{item.nombreArchivo}</span>
            </div>
          )}
        </div>

        <button
          disabled={guardando}
          onClick={() => onNormalizar(item.docId, item.filaId)}
          className="flex items-center space-x-1.5 rounded-lg border border-emerald-300 bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800 hover:bg-emerald-200 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 transition-all shrink-0"
          title="Remover marca de irregularidad e integrarla al total de rendimiento"
        >
          <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
          <span>Normalizar (Volver al Total)</span>
        </button>
      </div>

      {/* Grilla Completa de la Fila Extraída de la Planilla */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 text-xs bg-white/70 dark:bg-gray-900/50 p-2.5 rounded-lg border border-amber-100 dark:border-amber-900/20">
        <div>
          <span className="text-[10px] uppercase font-semibold text-gray-400 block flex items-center gap-1">
            <Calendar className="h-3 w-3" /> Fecha Fila
          </span>
          <span className="font-mono font-bold text-gray-900 dark:text-gray-200">{item.fecha || 'Sin Fecha'}</span>
        </div>

        <div>
          <span className="text-[10px] uppercase font-semibold text-gray-400 block flex items-center gap-1">
            <Clock className="h-3 w-3" /> Horario Fila
          </span>
          <span className="font-mono font-bold text-gray-900 dark:text-gray-200">
            {item.horaInicio || '--:--'} - {item.horaFin || '--:--'}
          </span>
        </div>

        <div>
          <span className="text-[10px] uppercase font-semibold text-gray-400 block flex items-center gap-1">
            <Package className="h-3 w-3" /> Cant. Artículos
          </span>
          <span className="font-bold text-blue-600 dark:text-blue-400">{item.cantArticulos} bultos</span>
        </div>

        <div>
          <span className="text-[10px] uppercase font-semibold text-amber-700 dark:text-amber-400 block flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" /> Irregularidad
          </span>
          {editando ? (
            <div className="mt-0.5 flex items-center space-x-1">
              <input
                type="text"
                value={nota}
                onChange={(e) => setNota(e.target.value.toUpperCase())}
                className="w-full rounded border border-amber-400 bg-white px-1.5 py-0.5 text-xs font-semibold uppercase dark:bg-gray-800 dark:text-white"
              />
              <button
                disabled={guardando}
                onClick={handleGuardar}
                className="rounded bg-amber-600 px-2 py-0.5 text-[11px] font-bold text-white hover:bg-amber-700"
              >
                OK
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-1 font-bold text-amber-900 dark:text-amber-200">
              <span className="truncate">"{item.notaIrregularidad}"</span>
              <button
                onClick={() => setEditando(true)}
                className="text-amber-700 hover:text-amber-900 dark:text-amber-400 p-0.5"
                title="Editar etiqueta"
              >
                <Edit3 className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
