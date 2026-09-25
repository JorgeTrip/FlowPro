// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import React, { useState, useEffect } from 'react';
import { X, HardDrive, Trash2, CheckCircle2, RefreshCw } from 'lucide-react';
import {
  estimarEspacioAlmacenamiento,
  limpiarCacheNoCritica,
  type MetricasAlmacenamiento,
} from '@/features/usuarios/services/servicioCuotaAlmacenamiento';

interface ModalGestionAlmacenamientoProps {
  abierto: boolean;
  onCerrar: () => void;
}

export function ModalGestionAlmacenamiento({ abierto, onCerrar }: ModalGestionAlmacenamientoProps) {
  const [metricas, setMetricas] = useState<MetricasAlmacenamiento | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  const cargarMetricas = async () => {
    const m = await estimarEspacioAlmacenamiento();
    setMetricas(m);
  };

  useEffect(() => {
    if (abierto) {
      cargarMetricas();
      setMensajeExito(null);
    }
  }, [abierto]);

  const handleLimpiarCache = () => {
    const eliminadas = limpiarCacheNoCritica();
    cargarMetricas();
    setMensajeExito(`Se eliminaron ${eliminadas} entradas temporales de caché.`);
    setTimeout(() => setMensajeExito(null), 3000);
  };

  if (!abierto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white/95 p-6 shadow-2xl backdrop-blur-xl dark:border-gray-800 dark:bg-[#1C1C1E]/95">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center space-x-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-950/80 dark:text-purple-400">
              <HardDrive className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">Almacenamiento Local</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Caché, planillas y datos del navegador</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCerrar}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Métricas de Uso */}
        <div className="mt-4 space-y-3">
          <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-3.5 dark:border-gray-800/60 dark:bg-gray-900/40">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-gray-600 dark:text-gray-400">Espacio Utilizado</span>
              <span className="font-mono text-gray-900 dark:text-gray-100 font-bold">
                {metricas ? `${metricas.usadoMB} MB / ${metricas.cuotaMB} MB` : 'Calculando...'}
              </span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
              <div
                className="h-full rounded-full bg-purple-600 transition-all duration-500"
                style={{ width: `${metricas?.porcentaje || 2}%` }}
              />
            </div>
            <p className="mt-2 text-[11px] text-gray-500 dark:text-gray-400">
              {metricas?.cantidadClavesLocalStorage || 0} configuraciones y registros en almacenamiento local.
            </p>
          </div>

          {mensajeExito && (
            <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-2.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              <span>{mensajeExito}</span>
            </div>
          )}

          <div className="pt-1">
            <button
              type="button"
              onClick={handleLimpiarCache}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white p-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 transition-all shadow-sm"
            >
              <Trash2 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <span>Limpiar Caché y Tablas Temporales</span>
            </button>
          </div>
        </div>

        <div className="mt-5 flex justify-end border-t border-gray-100 pt-3 dark:border-gray-800">
          <button
            type="button"
            onClick={onCerrar}
            className="rounded-xl bg-gray-100 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 transition-all"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
