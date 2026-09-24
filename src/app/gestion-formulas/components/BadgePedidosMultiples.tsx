// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import React from 'react';

interface BadgePedidosMultiplesProps {
  totalPedidos: number;
  fechaUltima?: string | null;
  cantidadUltima?: number | null;
}

/**
 * Badge de notificación reactivo con estilo Apple que alerta cuando un producto
 * de criticidad alta posee múltiples pedidos de compra pendientes sin recibir.
 */
export function BadgePedidosMultiples({
  totalPedidos,
  fechaUltima,
  cantidadUltima,
}: BadgePedidosMultiplesProps) {
  if (totalPedidos <= 1) return null;

  return (
    <div className="relative inline-flex items-center group cursor-help ml-1.5 align-middle">
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/50 text-amber-900 dark:text-amber-300 border border-amber-300/60 dark:border-amber-700/50 shadow-xs hover:scale-105 transition-transform">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
        <span>+{totalPedidos} ped.</span>
      </span>

      {/* Tooltip interactivo flotante estilo Apple */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col w-56 p-2 rounded-lg bg-gray-900/95 dark:bg-[#1C1C1E] text-white text-[11px] shadow-xl border border-gray-700/50 backdrop-blur-md z-50 pointer-events-none transition-all animate-in fade-in-0 zoom-in-95">
        <div className="font-semibold text-amber-400 flex items-center gap-1 mb-1">
          <span>⚠️ Múltiples pedidos sin recibir</span>
        </div>
        <p className="text-gray-300 text-[10px] leading-tight mb-1.5">
          Este producto acumula <strong className="text-white">{totalPedidos} solicitudes</strong> de compra sin recepción registrada en la columna V.
        </p>
        {fechaUltima && (
          <div className="pt-1 border-t border-gray-800 text-[9px] text-gray-400 flex justify-between">
            <span>Última solic: {fechaUltima}</span>
            {cantidadUltima !== undefined && cantidadUltima !== null && (
              <span className="text-amber-300 font-mono font-medium">{cantidadUltima.toLocaleString()} u.</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
