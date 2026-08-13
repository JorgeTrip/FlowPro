// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import React, { useState, useEffect } from 'react';
import { RegistroArmadoDocumento } from '../../types/armado';
import { FileText, Package, Hash, Clock, Database } from 'lucide-react';

interface BarraResumenDatosProps {
  planillasFiltradas: RegistroArmadoDocumento[];
  totalPlanillasOriginal: number;
  hayFiltro: boolean;
  cargando: boolean;
}

export function BarraResumenDatos({
  planillasFiltradas,
  totalPlanillasOriginal,
  hayFiltro,
  cargando,
}: BarraResumenDatosProps) {
  const [montado, setMontado] = useState(false);

  useEffect(() => {
    setMontado(true);
  }, []);

  const totalPlanillas = planillasFiltradas.length;
  const totalFilas = planillasFiltradas.reduce((acc, r) => acc + (r.filas?.length || 0), 0);
  const totalArticulos = planillasFiltradas.reduce(
    (acc, r) => acc + (r.filas?.reduce((fAcc, f) => fAcc + (f.cantArticulos || 0), 0) || 0),
    0
  );

  const ultimaCargada = [...planillasFiltradas].sort((a, b) => {
    const tA = new Date(a.verificadoEn || a.creadoEn || 0).getTime();
    const tB = new Date(b.verificadoEn || b.creadoEn || 0).getTime();
    return tB - tA;
  })[0];

  const fechaHoraIso = ultimaCargada?.verificadoEn || ultimaCargada?.creadoEn;
  const fechaHoraTexto = !montado
    ? '...'
    : fechaHoraIso
    ? new Date(fechaHoraIso).toLocaleString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Sin planillas';

  return (
    <div className="w-full rounded-xl border border-gray-200 bg-white/95 px-4 py-2 shadow-sm backdrop-blur-md dark:border-gray-800 dark:bg-[#1C1C1E]/95 text-xs text-gray-700 dark:text-gray-300">
      <div className="flex flex-wrap items-center justify-between gap-3 font-medium">
        <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 font-semibold shrink-0">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
          </span>
          <Database className="h-3.5 w-3.5 shrink-0" />
          <span>Firestore Sincronizado</span>
        </div>

        <div className="flex flex-wrap items-center space-x-4 divide-x divide-gray-200 dark:divide-gray-800">
          <div className="flex items-center space-x-1.5 pl-2">
            <FileText className="h-3.5 w-3.5 text-blue-500" />
            <span>Planillas:</span>
            <strong className="text-gray-900 dark:text-white font-bold">
              {cargando
                ? '...'
                : hayFiltro
                ? `${totalPlanillas} de ${totalPlanillasOriginal}`
                : totalPlanillas}
            </strong>
          </div>

          <div className="flex items-center space-x-1.5 pl-4">
            <Package className="h-3.5 w-3.5 text-indigo-500" />
            <span>Filas / Pedidos:</span>
            <strong className="text-gray-900 dark:text-white font-bold">
              {cargando ? '...' : totalFilas}
            </strong>
          </div>

          <div className="flex items-center space-x-1.5 pl-4">
            <Hash className="h-3.5 w-3.5 text-emerald-500" />
            <span>Total Artículos:</span>
            <strong suppressHydrationWarning className="text-gray-900 dark:text-white font-bold">
              {cargando || !montado ? '...' : totalArticulos.toLocaleString('es-AR')}
            </strong>
          </div>

          <div className="flex items-center space-x-1.5 pl-4 text-amber-600 dark:text-amber-400">
            <Clock className="h-3.5 w-3.5 shrink-0" />
            <span>Última planilla cargada:</span>
            <strong suppressHydrationWarning className="text-gray-900 dark:text-amber-300 font-bold whitespace-nowrap">
              {cargando || !montado ? '...' : fechaHoraTexto}
              {ultimaCargada?.empleadoHeader ? ` (${ultimaCargada.empleadoHeader})` : ''}
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
}
