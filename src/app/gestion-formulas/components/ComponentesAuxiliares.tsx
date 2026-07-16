// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
import React from 'react';

/** Tooltip nativo reutilizable estilizado */
export const Tooltip = ({ texto }: { texto: string }) => (
  <span className="absolute top-full left-1/2 -translate-x-1/2 mt-1 hidden group-hover:block w-48 p-2 bg-gray-900 text-white text-[10px] rounded-lg shadow-lg text-center z-20 font-normal normal-case leading-normal">
    {texto}
  </span>
);

/** Skeleton Screen para la tabla (UX de Ilusión de Progreso de Jorge) */
export function SkeletonTabla() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-10 bg-gray-200 dark:bg-[#2C2C2E] rounded-lg" />
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-12 bg-gray-100 dark:bg-[#1C1C1E] border border-gray-200 dark:border-gray-800 rounded-lg" />
      ))}
    </div>
  );
}

/** Badge de criticidad visual con grises pro de Jorge */
export const BadgeCriticidad = ({ criticidad }: { criticidad: string }) => {
  const estilos = {
    alta: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 border-red-200 dark:border-red-900/50',
    media: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200 dark:border-amber-900/50',
    baja: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 border-green-200 dark:border-green-900/50',
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${estilos[criticidad as keyof typeof estilos]}`}>
      {criticidad.toUpperCase()}
    </span>
  );
};

/** Referencia de colores en la tabla */
export const ReferenciaColores = () => (
  <div className="flex flex-wrap items-center gap-5 px-3 py-2 bg-gray-50/50 dark:bg-[#2C2C2E]/20 border border-gray-150 dark:border-gray-800/30 rounded-lg text-[10px] font-bold text-gray-500 dark:text-gray-400 select-none">
    <span className="flex items-center space-x-1.5">
      <span className="w-3.5 h-3.5 rounded bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700" />
      <span>Gris: Datos extraídos (planillas)</span>
    </span>
    <span className="flex items-center space-x-1.5">
      <span className="w-3.5 h-3.5 rounded bg-[#E6F4EA] dark:bg-[#193220] border border-emerald-200/50 dark:border-emerald-900/30" />
      <span>Verde: Stock Entre Ríos (E.R.)</span>
    </span>
    <span className="flex items-center space-x-1.5">
      <span className="w-3.5 h-3.5 rounded bg-[#F3E8FF] dark:bg-[#2D1A40] border border-purple-200/50 dark:border-purple-900/30" />
      <span>Violeta: Stock CABA</span>
    </span>
    <span className="flex items-center space-x-1.5">
      <span className="w-3.5 h-3.5 rounded bg-[#E6F0FA] dark:bg-[#192B40] border border-blue-200/50 dark:border-blue-900/30" />
      <span>Azul: Cantidades necesarias (cálculo)</span>
    </span>
    <span className="flex items-center space-x-1.5">
      <span className="w-3.5 h-3.5 rounded bg-[#FFF4E5] dark:bg-[#332211] border border-amber-200/50 dark:border-amber-900/30" />
      <span>Amarillo: Acciones sugeridas (traslado/compra)</span>
    </span>
  </div>
);
