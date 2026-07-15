// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
import React from 'react';
import { ReglaPrefijo } from '@/app/gestion-formulas/lib/types';

interface TablaPrefijosProps {
  ui: {
    reglasFiltradas: ReglaPrefijo[];
    abrirModalEditar: (regla: ReglaPrefijo) => void;
    confirmarEliminar: (id: string) => void;
    procesando: boolean;
  };
}

function BadgeSitio({ sitio }: { sitio: ReglaPrefijo['sitioFabricacion'] }) {
  const classes = {
    'CABA': 'bg-blue-100 text-blue-800 dark:bg-blue-950/30 dark:text-blue-400 border border-blue-200/50 dark:border-blue-900/30',
    'ENTRE RIOS': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-900/30',
    'CABA + ENTRE RIOS': 'bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-200/50 dark:border-amber-900/30',
    'TERC. CABA': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/30 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-900/30',
    'TERC. ENTRE RIOS': 'bg-pink-100 text-pink-800 dark:bg-pink-950/30 dark:text-pink-400 border border-pink-200/50 dark:border-pink-900/30',
    'TERC. CON PROV. MP': 'bg-teal-100 text-teal-800 dark:bg-teal-950/30 dark:text-teal-400 border border-teal-200/50 dark:border-teal-900/30'
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${classes[sitio]}`}>
      {sitio}
    </span>
  );
}

export function TablaPrefijos({ ui }: TablaPrefijosProps) {
  if (ui.reglasFiltradas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 rounded-xl bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-gray-800 text-center">
        <span className="text-4xl mb-3 select-none">🔖</span>
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">No se encontraron reglas</h3>
        <p className="text-xs text-gray-400 mt-1">Cree una nueva regla de prefijo o importe un archivo JSON para comenzar.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1C1C1E] shadow-sm">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800 text-left text-xs">
        <thead className="bg-gray-50 dark:bg-[#2C2C2E] text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider select-none">
          <tr>
            <th className="px-6 py-3">Prefijo PT</th>
            <th className="px-6 py-3">Línea de Productos</th>
            <th className="px-6 py-3">Planta de Fabricación</th>
            <th className="px-6 py-3">Descripción / Notas</th>
            <th className="px-6 py-3 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-800 text-gray-700 dark:text-gray-300">
          {ui.reglasFiltradas.map((regla) => (
            <tr
              key={regla.id}
              className="hover:bg-gray-50 dark:hover:bg-[#2C2C2E]/40 transition-colors text-xs"
            >
              <td className="px-6 py-4 font-mono font-bold text-gray-900 dark:text-white">
                {regla.prefijo}
              </td>
              <td className="px-6 py-4 font-semibold">
                {regla.linea}
              </td>
              <td className="px-6 py-4">
                <BadgeSitio sitio={regla.sitioFabricacion} />
              </td>
              <td className="px-6 py-4 text-gray-500 dark:text-gray-400 max-w-xs truncate" title={regla.descripcion}>
                {regla.descripcion || '-'}
              </td>
              <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                <button
                  onClick={() => ui.abrirModalEditar(regla)}
                  disabled={ui.procesando}
                  className="inline-flex items-center justify-center p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-[#2C2C2E] text-gray-600 dark:text-gray-400 transition-colors cursor-pointer disabled:opacity-50"
                  title="Editar regla"
                >
                  ✏️
                </button>
                <button
                  onClick={() => ui.confirmarEliminar(regla.id)}
                  disabled={ui.procesando}
                  className="inline-flex items-center justify-center p-1.5 rounded-lg border border-red-200 dark:border-red-950/40 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 dark:text-red-450 transition-colors cursor-pointer disabled:opacity-50"
                  title="Eliminar regla"
                >
                  🗑️
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
