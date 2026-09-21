// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import React from 'react';
import { LIMITE_RPM_GRATIS, LIMITE_RPD_GRATIS } from '../../stores/useGeminiQuotaStore';
import { Cpu, Zap, Activity, ExternalLink, RefreshCw, ChevronUp } from 'lucide-react';

interface GeminiQuotaDetalladaProps {
  rpmActual: number;
  pctRpm: number;
  peticionesHoy: number;
  pctRpd: number;
  estadoColor: string;
  dotColor: string;
  estadoTexto: string;
  onColapsar: () => void;
  onResetContadores: () => void;
}

/**
 * Vista expandida y detallada del widget de monitoreo de cuota de Gemini AI.
 * Muestra medidores visuales de consumo por minuto (RPM) y diario (RPD).
 */
export function GeminiQuotaDetallada({
  rpmActual,
  pctRpm,
  peticionesHoy,
  pctRpd,
  estadoColor,
  dotColor,
  estadoTexto,
  onColapsar,
  onResetContadores,
}: GeminiQuotaDetalladaProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-md dark:border-gray-800 dark:bg-[#1C1C1E] text-xs">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-3 dark:border-gray-800">
        <div className="flex items-center space-x-2">
          <div className="rounded-lg bg-blue-500/10 p-1.5 text-blue-600 dark:text-blue-400">
            <Cpu className="h-4 w-4" />
          </div>
          <div>
            <h4 className="font-bold text-gray-900 dark:text-white">Cuota de Consumo Gemini AI</h4>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              Monitoreo en tiempo real de la clave de API gratuita
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className={`flex items-center space-x-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${estadoColor}`}>
            <span className={`h-2 w-2 rounded-full ${dotColor}`} />
            <span>{estadoTexto}</span>
          </div>

          <a
            href="https://aistudio.google.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1 rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1 text-[11px] font-semibold text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
            title="Abrir panel oficial de Google AI Studio"
          >
            <span>Consola</span>
            <ExternalLink className="h-3 w-3" />
          </a>

          <button
            type="button"
            onClick={onColapsar}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 dark:hover:text-white"
            title="Colapsar a 1 sola línea"
          >
            <ChevronUp className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5 rounded-xl border border-gray-100 bg-gray-50/70 p-3 dark:border-gray-800/60 dark:bg-gray-900/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1 font-semibold text-gray-700 dark:text-gray-300">
              <Zap className="h-3.5 w-3.5 text-blue-500" />
              <span>Consumo por Minuto (RPM)</span>
            </div>
            <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
              {rpmActual} / {LIMITE_RPM_GRATIS}
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
            <div
              className={`h-full transition-all duration-300 ${
                pctRpm > 80 ? 'bg-amber-500' : 'bg-blue-600 dark:bg-blue-400'
              }`}
              style={{ width: `${pctRpm}%` }}
            />
          </div>
          <p className="text-[10px] text-gray-500 dark:text-gray-400">
            Ventana móvil de 60s ({LIMITE_RPM_GRATIS - rpmActual} peticiones disponibles)
          </p>
        </div>

        <div className="space-y-1.5 rounded-xl border border-gray-100 bg-gray-50/70 p-3 dark:border-gray-800/60 dark:bg-gray-900/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1 font-semibold text-gray-700 dark:text-gray-300">
              <Activity className="h-3.5 w-3.5 text-emerald-500" />
              <span>Consumo Diario (RPD)</span>
            </div>
            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
              {peticionesHoy} / {LIMITE_RPD_GRATIS} ({pctRpd}%)
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
            <div
              className={`h-full transition-all duration-300 ${
                pctRpd > 80 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${pctRpd}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-gray-500 dark:text-gray-400">
            <span>Restan {LIMITE_RPD_GRATIS - peticionesHoy} planillas hoy</span>
            <button
              onClick={onResetContadores}
              className="flex items-center space-x-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-white"
              title="Resetear contador diario manual"
            >
              <RefreshCw className="h-2.5 w-2.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
