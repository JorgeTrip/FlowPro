// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import React from 'react';
import { ResultadoTercerizadosMRP } from '../lib/types';

interface TablaProductosTercerizadosProps {
  resultadosFiltradosTercerizados: ResultadoTercerizadosMRP[];
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
  solicitarOrdenTercerizados,
  getIndT,
  mesesProyeccionTransferencia,
  mesesProyeccionCompra,
}: TablaProductosTercerizadosProps) {
  // Clases de Estilo para las Columnas (Headers sólidos y opacos para evitar transparencias al hacer scroll)
  const clsExcelHeader = "sticky top-0 z-10 bg-gray-100 dark:bg-[#2C2C2E] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#3A3A3C] transition-colors";
  const clsExcelCell = "bg-white dark:bg-[#1C1C1E] text-gray-900 dark:text-gray-300";
  const clsVerdeHeader = "sticky top-0 z-10 bg-[#E6F4EA] dark:bg-[#193220] text-emerald-900 dark:text-emerald-300 hover:bg-[#D4EDDA] dark:hover:bg-[#204029] transition-colors";
  const clsVerdeCell = "bg-emerald-50/30 dark:bg-emerald-950/15 text-emerald-950 dark:text-emerald-300";
  const clsVioletaHeader = "sticky top-0 z-10 bg-[#F3E8FF] dark:bg-[#2D1A40] text-purple-900 dark:text-purple-300 hover:bg-[#E9D5FF] dark:hover:bg-[#3A2252] transition-colors";
  const clsVioletaCell = "bg-purple-50/30 dark:bg-purple-950/15 text-purple-950 dark:text-purple-300";
  const clsAccionHeader = "sticky top-0 z-10 bg-[#FFF4E5] dark:bg-[#332211] text-amber-900 dark:text-amber-300 hover:bg-[#FFECCF] dark:hover:bg-[#442E16] transition-colors";
  const clsAccionCell = "bg-amber-50/30 dark:bg-amber-950/15 text-amber-950 dark:text-amber-300";
  const clsNormalHeader = "sticky top-0 z-10 bg-gray-50 dark:bg-[#2C2C2E] text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#3A3A3C] transition-colors";

  return (
    <table className="min-w-[1100px] divide-y divide-gray-200 dark:divide-gray-800 text-left text-[11px]">
      <thead className="bg-gray-50 dark:bg-[#2C2C2E] text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider select-none">
        <tr className="divide-x divide-gray-100 dark:divide-gray-800">
          {/* PT Sincronizados */}
          <th onClick={() => solicitarOrdenTercerizados('codigoPT')} className={`${clsExcelHeader} px-2.5 py-2 border-r border-gray-150 dark:border-gray-800 cursor-pointer`}>Código PT{getIndT('codigoPT')}</th>
          <th onClick={() => solicitarOrdenTercerizados('descripcionPT')} className={`${clsExcelHeader} px-2.5 py-2 border-r border-gray-150 dark:border-gray-800 cursor-pointer`}>Descripción PT{getIndT('descripcionPT')}</th>
          <th onClick={() => solicitarOrdenTercerizados('stockPTEntreRios')} className={`${clsVerdeHeader} px-2.5 py-2 text-right border-r border-gray-150 dark:border-gray-800 cursor-pointer`}>Stock PT E.R.{getIndT('stockPTEntreRios')}</th>
          <th onClick={() => solicitarOrdenTercerizados('stockPTCABA')} className={`${clsVioletaHeader} px-2.5 py-2 text-right border-r-2 border-gray-300 dark:border-gray-700 cursor-pointer`}>Stock PT CABA{getIndT('stockPTCABA')}</th>
          
          {/* Calculados */}
          <th onClick={() => solicitarOrdenTercerizados('rotacionMensual')} className={`${clsNormalHeader} px-2.5 py-2 text-right border-r border-gray-150 dark:border-gray-800 cursor-pointer`}>Rot. Mensual PT{getIndT('rotacionMensual')}</th>
          <th className={`${clsNormalHeader} px-2.5 py-2 text-right border-r border-gray-150 dark:border-gray-800`}>Rot. {mesesProyeccionTransferencia}M PT (Transf.)</th>
          <th className={`${clsNormalHeader} px-2.5 py-2 text-right border-r-2 border-gray-300 dark:border-gray-700`}>Rot. {mesesProyeccionCompra}M PT (Compra)</th>
          
          {/* Acciones de Transferencia/Compra */}
          <th className={`${clsAccionHeader} px-2.5 py-2 text-right border-r border-gray-150 dark:border-gray-800`}>{"Transf. PT (ER->CABA)"}</th>
          <th className={`${clsAccionHeader} px-2.5 py-2 text-right border-r border-gray-150 dark:border-gray-800`}>Compra PT</th>
          <th onClick={() => solicitarOrdenTercerizados('criticidad')} className={`${clsNormalHeader} pl-2.5 pr-8 py-2 cursor-pointer`}>Criticidad{getIndT('criticidad')}</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-[#1C1C1E] text-gray-900 dark:text-gray-300">
        {resultadosFiltradosTercerizados.map((fila, idx) => (
          <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-[#2C2C2E]/40 transition-colors divide-x divide-gray-100 dark:divide-gray-850 text-xs align-top">
            <td className={`${clsExcelCell} px-2.5 py-2 font-mono font-semibold`}>{fila.codigoPT}</td>
            <td className={`${clsExcelCell} px-2.5 py-2`}>
              <div className="truncate max-w-[250px] text-ellipsis">{fila.descripcionPT}</div>
            </td>
            
            <td className={`${clsVerdeCell} px-2.5 py-2 text-right font-mono`}>{(fila.stockPTEntreRios ?? 0).toFixed(1)}</td>
            <td className={`${clsVioletaCell} px-2.5 py-2 text-right font-mono border-r-2 border-gray-300 dark:border-gray-700`}>{(fila.stockPTCABA ?? 0).toFixed(1)}</td>
            
            <td className="px-2.5 py-2 text-right font-mono">{(fila.rotacionMensual ?? 0).toFixed(1)}</td>
            <td className="px-2.5 py-2 text-right font-mono">{((fila.rotacionMensual ?? 0) * mesesProyeccionTransferencia).toFixed(1)}</td>
            <td className="px-2.5 py-2 text-right font-mono border-r-2 border-gray-300 dark:border-gray-700">{((fila.rotacionMensual ?? 0) * mesesProyeccionCompra).toFixed(1)}</td>
            
            <td className={`${clsAccionCell} px-2.5 py-2 text-right font-mono`}>{(fila.movimientoSugerido.transferencia ?? 0).toFixed(1)}</td>
            <td className={`${clsAccionCell} px-2.5 py-2 text-right font-mono font-semibold`}>{(fila.movimientoSugerido.compra ?? 0).toFixed(1)}</td>
            <td className="px-2.5 py-2 text-center"><BadgeCriticidad criticidad={fila.criticidad} /></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
