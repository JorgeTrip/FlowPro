// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import React from 'react';
import { MetricasKpi } from '../../types/armado';
import { Package, Layers, Zap, Clock } from 'lucide-react';

interface KPICardsProps {
  metricas: MetricasKpi;
}

export function KPICards({ metricas }: KPICardsProps) {
  const tarjetas = [
    {
      titulo: 'Pedidos Armados',
      valor: metricas.totalPedidos,
      unidad: 'pedidos',
      icono: Package,
      color: 'from-blue-500/10 via-cyan-500/10 to-blue-600/10',
      iconoColor: 'text-blue-500',
    },
    {
      titulo: 'Artículos Procesados',
      valor: metricas.totalArticulos.toLocaleString('es-AR'),
      unidad: 'unidades',
      icono: Layers,
      color: 'from-purple-500/10 via-pink-500/10 to-purple-600/10',
      iconoColor: 'text-purple-500',
    },
    {
      titulo: 'Velocidad Promedio',
      valor: metricas.velocidadPromedioEq,
      unidad: 'Art / hs',
      icono: Zap,
      color: 'from-amber-500/10 via-yellow-500/10 to-amber-600/10',
      iconoColor: 'text-amber-500',
    },
    {
      titulo: 'Tiempo por Pedido',
      valor: metricas.tiempoMedioPedidoMin,
      unidad: 'Min / pedido',
      icono: Clock,
      color: 'from-emerald-500/10 via-teal-500/10 to-emerald-600/10',
      iconoColor: 'text-emerald-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {tarjetas.map((t, idx) => {
        const IconComponent = t.icono;
        return (
          <div
            key={idx}
            className={`relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-lg backdrop-blur-sm transition-all hover:scale-[1.02] dark:border-gray-800 dark:bg-[#1C1C1E] bg-gradient-to-br ${t.color}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {t.titulo}
              </span>
              <div className={`rounded-xl bg-white/80 p-2 shadow-sm dark:bg-gray-800/80 ${t.iconoColor}`}>
                <IconComponent className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
                {t.valor}
              </span>
              <span className="ml-2 text-xs font-medium text-gray-500 dark:text-gray-400">{t.unidad}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
