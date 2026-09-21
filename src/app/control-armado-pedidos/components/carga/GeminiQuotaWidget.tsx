// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import React, { useEffect, useState } from 'react';
import { useGeminiQuotaStore, LIMITE_RPM_GRATIS, LIMITE_RPD_GRATIS } from '../../stores/useGeminiQuotaStore';
import { GeminiQuotaDetallada } from './GeminiQuotaDetallada';
import { Cpu, ExternalLink, ChevronDown } from 'lucide-react';

/**
 * Widget de monitoreo de cuota de consumo de Gemini AI.
 * Permite alternar entre un estado colapsado (una sola línea discreta)
 * y una vista detallada con indicadores de consumo en tiempo real.
 */
export function GeminiQuotaWidget() {
  const { peticionesHoy, timestampsMinuto, limpiarMinuto, resetearContadores } = useGeminiQuotaStore();
  const [isMounted, setIsMounted] = useState(false);
  const [desplegado, setDesplegado] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const interval = setInterval(() => {
      limpiarMinuto();
    }, 3000);
    return () => clearInterval(interval);
  }, [limpiarMinuto]);

  if (!isMounted) return null;

  const rpmActual = timestampsMinuto.length;
  const pctRpm = Math.min(100, Math.round((rpmActual / LIMITE_RPM_GRATIS) * 100));
  const pctRpd = Math.min(100, Math.round((peticionesHoy / LIMITE_RPD_GRATIS) * 100));

  let estadoColor = 'bg-emerald-500/10 text-emerald-600 border-emerald-300 dark:border-emerald-800 dark:text-emerald-400';
  let estadoTexto = 'Cuota Óptima (15 RPM / 1.5K RPD)';
  let dotColor = 'bg-emerald-500 animate-pulse';

  if (rpmActual >= 12 || pctRpd >= 80) {
    estadoColor = 'bg-amber-500/10 text-amber-600 border-amber-300 dark:border-amber-800 dark:text-amber-400';
    estadoTexto = 'Uso Elevado (Cerca del Límite)';
    dotColor = 'bg-amber-500 animate-ping';
  }
  if (rpmActual >= LIMITE_RPM_GRATIS) {
    estadoColor = 'bg-red-500/10 text-red-600 border-red-300 dark:border-red-800 dark:text-red-400';
    estadoTexto = 'Pausa por Límite de Minuto (429)';
    dotColor = 'bg-red-500';
  }

  // Vista Expandida delegada al submódulo
  if (desplegado) {
    return (
      <GeminiQuotaDetallada
        rpmActual={rpmActual}
        pctRpm={pctRpm}
        peticionesHoy={peticionesHoy}
        pctRpd={pctRpd}
        estadoColor={estadoColor}
        dotColor={dotColor}
        estadoTexto={estadoTexto}
        onColapsar={() => setDesplegado(false)}
        onResetContadores={resetearContadores}
      />
    );
  }

  // Vista Colapsada (1 Sola Línea)
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm transition-all hover:shadow-md dark:border-gray-800 dark:bg-[#1C1C1E] text-xs">
      <div
        onClick={() => setDesplegado(true)}
        className="flex cursor-pointer flex-wrap items-center justify-between gap-3"
      >
        <div className="flex items-center space-x-3">
          <div className="rounded-lg bg-blue-500/10 p-1.5 text-blue-600 dark:text-blue-400">
            <Cpu className="h-4 w-4" />
          </div>
          <div className="flex flex-wrap items-center space-x-2">
            <h4 className="font-bold text-gray-900 dark:text-white">Cuota Gemini AI</h4>
            <span className="text-gray-300 dark:text-gray-700">|</span>
            <span className="font-mono text-gray-600 dark:text-gray-300">
              RPM: <strong className="text-blue-600 dark:text-blue-400">{rpmActual}/{LIMITE_RPM_GRATIS}</strong>
            </span>
            <span className="text-gray-300 dark:text-gray-700">|</span>
            <span className="font-mono text-gray-600 dark:text-gray-300">
              RPD: <strong className="text-emerald-600 dark:text-emerald-400">{peticionesHoy}/{LIMITE_RPD_GRATIS} ({pctRpd}%)</strong>
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className={`flex items-center space-x-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${estadoColor}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
            <span>{estadoTexto}</span>
          </div>

          <a
            href="https://aistudio.google.com/"
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center space-x-1 rounded-lg border border-gray-200 bg-gray-50 px-2 py-0.5 text-[11px] font-semibold text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
            title="Abrir panel oficial de Google AI Studio"
          >
            <span>Consola</span>
            <ExternalLink className="h-3 w-3" />
          </a>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setDesplegado(true);
            }}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 dark:hover:text-white"
            title="Desplegar monitoreo detallado"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
