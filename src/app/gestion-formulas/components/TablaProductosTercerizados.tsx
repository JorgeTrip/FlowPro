// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import React from 'react';
import { ResultadoTercerizadosMRP } from '../lib/types';

interface TablaProductosTercerizadosProps {
  resultadosFiltradosTercerizados: ResultadoTercerizadosMRP[];
  sortTercerizados: { key: keyof ResultadoTercerizadosMRP; direction: 'asc' | 'desc' } | null;
  solicitarOrdenTercerizados: (key: keyof ResultadoTercerizadosMRP) => void;
  getIndT: (k: keyof ResultadoTercerizadosMRP) => string;
  mesesProyeccionTransferencia: number;
  mesesProyeccionCompra: number;
}

function BadgeCriticidad({ criticidad }: { criticidad: 'alta' | 'media' | 'baja' }) {
  const classes = {
    alta: 'bg-red-100 text-red-800 dark:bg-red-950/30 dark:text-red-400 border border-red-200/50 dark:border-red-900/30',
    media: 'bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-200/50 dark:border-amber-900/30',
    baja: 'bg-green-100 text-green-800 dark:bg-green-950/30 dark:text-green-400 border border-green-200/50 dark:border-green-900/30',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${classes[criticidad]}`}>
      {criticidad}
    </span>
  );
}

export function TablaProductosTercerizados({
  resultadosFiltradosTercerizados,
  sortTercerizados,
  solicitarOrdenTercerizados,
  getIndT,
  mesesProyeccionTransferencia,
  mesesProyeccionCompra,
}: TablaProductosTercerizadosProps) {
  return (
    <table className="min-w-[1000px] divide-y divide-gray-200 dark:divide-gray-800 text-left text-[11px]">
      <thead className="bg-gray-50 dark:bg-[#2C2C2E] text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider select-none">
        <tr className="divide-x divide-gray-100 dark:divide-gray-800">
          <th onClick={() => solicitarOrdenTercerizados('codigoPT')} className="sticky top-0 z-10 bg-gray-50 dark:bg-[#2C2C2E] px-2.5 py-2 border-r border-gray-150 dark:border-gray-800 cursor-pointer hover:bg-gray-100 dark:hover:bg-[#3A3A3C]">Código PT{getIndT('codigoPT')}</th>
          <th onClick={() => solicitarOrdenTercerizados('descripcionPT')} className="sticky top-0 z-10 bg-gray-50 dark:bg-[#2C2C2E] px-2.5 py-2 border-r border-gray-150 dark:border-gray-800 cursor-pointer hover:bg-gray-100 dark:hover:bg-[#3A3A3C]">Descripción PT{getIndT('descripcionPT')}</th>
          <th onClick={() => solicitarOrdenTercerizados('stockPTEntreRios')} className="sticky top-0 z-10 bg-gray-50 dark:bg-[#2C2C2E] px-2.5 py-2 text-right border-r border-gray-150 dark:border-gray-800 cursor-pointer hover:bg-gray-100 dark:hover:bg-[#3A3A3C]">Stock PT E.R.{getIndT('stockPTEntreRios')}</th>
          <th onClick={() => solicitarOrdenTercerizados('stockPTCABA')} className="sticky top-0 z-10 bg-gray-50 dark:bg-[#2C2C2E] px-2.5 py-2 text-right border-r border-gray-150 dark:border-gray-800 cursor-pointer hover:bg-gray-100 dark:hover:bg-[#3A3A3C]">Stock PT CABA{getIndT('stockPTCABA')}</th>
          <th onClick={() => solicitarOrdenTercerizados('rotacion')} className="sticky top-0 z-10 bg-gray-50 dark:bg-[#2C2C2E] text-right border-r border-gray-150 dark:border-gray-800 cursor-pointer hover:bg-gray-100 dark:hover:bg-[#3A3A3C]">Rotación{getIndT('rotacion')}</th>
          <th className="sticky top-0 z-10 bg-gray-50 dark:bg-[#2C2C2E] px-2.5 py-2 text-right border-r border-gray-150 dark:border-gray-800">Demanda {mesesProyeccionCompra} {mesesProyeccionCompra === 1 ? 'Mes' : 'Meses'} (Compra)</th>
          <th className="sticky top-0 z-10 bg-gray-50 dark:bg-[#2C2C2E] px-2.5 py-2 text-right border-r border-gray-150 dark:border-gray-800">Demanda {mesesProyeccionTransferencia} {mesesProyeccionTransferencia === 1 ? 'Mes' : 'Meses'} (Transf.)</th>
          <th onClick={() => solicitarOrdenTercerizados('criticidad')} className="sticky top-0 z-10 bg-gray-50 dark:bg-[#2C2C2E] pl-2.5 pr-8 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-[#3A3A3C]">Criticidad{getIndT('criticidad')}</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-[#1C1C1E] text-gray-900 dark:text-gray-300">
        {resultadosFiltradosTercerizados.map((fila, idx) => (
          <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-[#2C2C2E]/40 transition-colors divide-x divide-gray-100 dark:divide-gray-850 text-xs">
            <td className="px-2.5 py-2 font-mono font-semibold">{fila.codigoPT}</td>
            <td className="px-2.5 py-2 group relative cursor-help">
              <div className="truncate max-w-[250px] text-ellipsis">{fila.descripcionPT}</div>
            </td>
            <td className="px-2.5 py-2 text-right font-mono text-gray-700 dark:text-gray-300">{(fila.stockPTEntreRios ?? 0).toFixed(1)}</td>
            <td className="px-2.5 py-2 text-right font-mono text-gray-700 dark:text-gray-300">{(fila.stockPTCABA ?? 0).toFixed(1)}</td>
            <td className="px-2.5 py-2 text-right font-mono text-gray-700 dark:text-gray-300">{(fila.rotacion ?? 0).toFixed(1)}</td>
            <td className="px-2.5 py-2 text-right font-mono text-gray-900 dark:text-white font-semibold">{(fila.movimientoSugerido.compra ?? 0).toFixed(1)}</td>
            <td className="px-2.5 py-2 text-right font-mono text-gray-700 dark:text-gray-300">{(fila.movimientoSugerido.transferencia ?? 0).toFixed(1)}</td>
            <td className="px-2.5 py-2 text-center"><BadgeCriticidad criticidad={fila.criticidad} /></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
