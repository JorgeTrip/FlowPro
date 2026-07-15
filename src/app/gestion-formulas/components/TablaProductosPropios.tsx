// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import React from 'react';
import { ResultadoMRP } from '../lib/types';
import { Tooltip } from './ComponentesAuxiliares';

interface TablaProductosPropiosProps {
  resultadosFiltradosPropios: ResultadoMRP[];
  solicitarOrdenPropios: (key: keyof ResultadoMRP) => void;
  getIndP: (k: keyof ResultadoMRP) => string;
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

export function TablaProductosPropios({
  resultadosFiltradosPropios,
  solicitarOrdenPropios,
  getIndP,
  mesesProyeccionTransferencia,
  mesesProyeccionCompra,
}: TablaProductosPropiosProps) {
  
  const clsSincronizadoHeader = "sticky top-0 z-10 bg-[#E6F4EA] dark:bg-[#193220] text-emerald-900 dark:text-emerald-300 hover:bg-[#D4EDDA] dark:hover:bg-[#204029] transition-colors";
  const clsSincronizadoCell = "bg-emerald-50/30 dark:bg-emerald-950/15 text-emerald-950 dark:text-emerald-300";
  const clsAccionHeader = "sticky top-0 z-10 bg-[#FFF4E5] dark:bg-[#332211] text-amber-900 dark:text-amber-300 hover:bg-[#FFECCF] dark:hover:bg-[#442E16] transition-colors";
  const clsAccionCell = "bg-amber-50/30 dark:bg-amber-950/15 text-amber-950 dark:text-amber-300";
  const clsBlueHeader = "sticky top-0 z-10 bg-[#E6F0FA] dark:bg-[#192B40] text-blue-900 dark:text-blue-300 hover:bg-[#D4E6FA] dark:hover:bg-[#203752] transition-colors";
  const clsBlueCell = "bg-blue-50/30 dark:bg-blue-950/15 text-blue-950 dark:text-blue-300";
  const clsNormalHeader = "sticky top-0 z-10 bg-gray-50 dark:bg-[#2C2C2E] text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#3A3A3C] transition-colors";

  return (
    <table className="min-w-[2350px] divide-y divide-gray-200 dark:divide-gray-800 text-left text-[11px]">
      <thead className="bg-gray-50 dark:bg-[#2C2C2E] text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider select-none">
        <tr className="divide-x divide-gray-100 dark:divide-gray-800">
          <th onClick={() => solicitarOrdenPropios('codigoMP')} className={`${clsSincronizadoHeader} px-2.5 py-2 border-r border-gray-150 dark:border-gray-800 cursor-pointer`}>Código MP{getIndP('codigoMP')}</th>
          <th onClick={() => solicitarOrdenPropios('descripcionMP')} className={`${clsSincronizadoHeader} px-2.5 py-2 border-r border-gray-150 dark:border-gray-800 cursor-pointer`}>Descripción MP{getIndP('descripcionMP')}</th>
          <th onClick={() => solicitarOrdenPropios('unidadMedida')} className={`${clsSincronizadoHeader} px-2.5 py-2 border-r border-gray-150 dark:border-gray-800`}>UM{getIndP('unidadMedida')}</th>
          <th onClick={() => solicitarOrdenPropios('stockMPEntreRios')} className={`${clsSincronizadoHeader} px-2.5 py-2 text-right border-r border-gray-150 dark:border-gray-800 cursor-pointer`}>Stock MP E.R.{getIndP('stockMPEntreRios')}</th>
          <th onClick={() => solicitarOrdenPropios('stockMPCABA')} className={`${clsSincronizadoHeader} px-2.5 py-2 text-right border-r-2 border-gray-300 dark:border-gray-700 cursor-pointer`}>Stock MP CABA{getIndP('stockMPCABA')}</th>
          <th className={`${clsSincronizadoHeader} px-2.5 py-2 border-r border-gray-150 dark:border-gray-800`}>Código PT</th>
          <th className={`${clsSincronizadoHeader} px-2.5 py-2 border-r border-gray-150 dark:border-gray-800`}>Descripción PT</th>
          <th className={`${clsNormalHeader} px-2.5 py-2 border-r border-gray-150 dark:border-gray-800`}>Línea</th>
          <th className={`${clsNormalHeader} px-2.5 py-2 border-r border-gray-150 dark:border-gray-800`}>Planta</th>
          <th className={`${clsSincronizadoHeader} px-2.5 py-2 text-right border-r border-gray-150 dark:border-gray-800`}>Stock PT E.R.</th>
          <th className={`${clsSincronizadoHeader} px-2.5 py-2 text-right border-r-2 border-gray-300 dark:border-gray-700`}>Stock PT CABA</th>
          <th className={`${clsNormalHeader} px-2.5 py-2 text-right border-r border-gray-150 dark:border-gray-800`}>Rot. Mensual PT</th>
          <th className={`${clsNormalHeader} px-2.5 py-2 text-right border-r border-gray-150 dark:border-gray-800`}>Rot. {mesesProyeccionTransferencia}M PT (Transf.)</th>
          <th className={`${clsNormalHeader} px-2.5 py-2 text-right border-r border-gray-150 dark:border-gray-800`}>Rot. {mesesProyeccionCompra}M PT (Compra)</th>
          <th className={`${clsAccionHeader} px-2.5 py-2 text-right border-r border-gray-150 dark:border-gray-800`}>{"Transf. PT (E.R.→CABA)"}</th>
          <th className={`${clsAccionHeader} px-2.5 py-2 text-right border-r border-gray-150 dark:border-gray-800`}>{"Transf. MP (E.R.→CABA)"}</th>
          <th className={`${clsAccionHeader} px-2.5 py-2 text-right border-r border-gray-150 dark:border-gray-800`}>{"Transf. MP (CABA→E.R.)"}</th>
          <th className={`${clsAccionHeader} px-2.5 py-2 text-right border-r border-gray-150 dark:border-gray-800`}>Producir PT CABA</th>
          <th className={`${clsAccionHeader} px-2.5 py-2 text-right border-r border-gray-150 dark:border-gray-800`}>Producir PT E.R.</th>
          <th className={`${clsAccionHeader} px-2.5 py-2 text-right border-r border-gray-150 dark:border-gray-800`}>Compra MP</th>
          <th onClick={() => solicitarOrdenPropios('cantidadSugerida')} className={`${clsBlueHeader} px-2.5 py-2 text-right border-r border-gray-150 dark:border-gray-800 cursor-pointer`}>Cantidad necesaria MP{getIndP('cantidadSugerida')}</th>
          <th onClick={() => solicitarOrdenPropios('criticidad')} className={`${clsNormalHeader} pl-2.5 pr-8 py-2 cursor-pointer`}>Criticidad{getIndP('criticidad')}</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-[#1C1C1E] text-gray-900 dark:text-gray-300">
        {resultadosFiltradosPropios.map((fila, idx) => (
          <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-[#2C2C2E]/40 transition-colors divide-x divide-gray-100 dark:divide-gray-850 text-xs text-left align-top">
            <td className={`${clsSincronizadoCell} px-2.5 py-2 font-mono font-semibold`}>{fila.codigoMP}</td>
            <td className={`${clsSincronizadoCell} px-2.5 py-2 group relative cursor-help`}><div className="truncate max-w-[150px] text-ellipsis">{fila.descripcionMP}</div><Tooltip texto={fila.descripcionMP} /></td>
            <td className={`${clsSincronizadoCell} px-2.5 py-2`}>{fila.unidadMedida}</td>
            <td className={`${clsSincronizadoCell} px-2.5 py-2 text-right font-mono`}>{(fila.stockMPEntreRios ?? 0).toFixed(1)}</td>
            <td className={`${clsSincronizadoCell} px-2.5 py-2 text-right font-mono border-r-2 border-gray-300 dark:border-gray-700`}>{(fila.stockMPCABA ?? 0).toFixed(1)}</td>
            <td className={`${clsSincronizadoCell} px-2.5 py-2`}>{fila.productosUsados?.map((p, i) => <div key={i} className="text-[10px] h-[15px]">{p.codigoProducto}</div>)}</td>
            <td className={`${clsSincronizadoCell} px-2.5 py-2`}>{fila.productosUsados?.map((p, i) => <div key={i} className="text-[10px] h-[15px]">{p.descripcion}</div>)}</td>
            <td className="px-2.5 py-2">{fila.productosUsados?.map((p, i) => <div key={i} className="text-[10px] h-[15px]">{p.linea || '-'}</div>)}</td>
            <td className="px-2.5 py-2 text-center">{fila.productosUsados?.map((p, i) => <div key={i} className="text-[9px] h-[15px] font-bold">{p.sitioFabricacion || '-'}</div>)}</td>
            <td className={`${clsSincronizadoCell} px-2.5 py-2 text-right font-mono`}>{fila.productosUsados?.map((p, i) => <div key={i} className="text-[10px] h-[15px]">{(p.stockPTEntreRios ?? 0).toFixed(1)}</div>)}</td>
            <td className={`${clsSincronizadoCell} px-2.5 py-2 text-right font-mono border-r-2 border-gray-300 dark:border-gray-700`}>{fila.productosUsados?.map((p, i) => <div key={i} className="text-[10px] h-[15px]">{(p.stockPTCABA ?? 0).toFixed(1)}</div>)}</td>
            <td className="px-2.5 py-2 text-right font-mono">{fila.productosUsados?.map((p, i) => <div key={i} className="text-[10px] h-[15px]">{(p.rotacionMensual ?? 0).toFixed(1)}</div>)}</td>
            <td className="px-2.5 py-2 text-right font-mono">{fila.productosUsados?.map((p, i) => <div key={i} className="text-[10px] h-[15px]">{((p.rotacionMensual ?? 0) * mesesProyeccionTransferencia).toFixed(1)}</div>)}</td>
            <td className="px-2.5 py-2 text-right font-mono">{fila.productosUsados?.map((p, i) => <div key={i} className="text-[10px] h-[15px]">{((p.rotacionMensual ?? 0) * mesesProyeccionCompra).toFixed(1)}</div>)}</td>
            <td className={`${clsAccionCell} px-2.5 py-2 text-right font-mono`}>{fila.productosUsados?.map((p, i) => <div key={i} className="text-[10px] h-[15px]">{(p.transferirPT ?? 0).toFixed(1)}</div>)}</td>
            <td className={`${clsAccionCell} px-2.5 py-2 text-right font-mono`}>{(fila.movimientoSugerido.transferencia ?? 0).toFixed(1)}</td>
            <td className={`${clsAccionCell} px-2.5 py-2 text-right font-mono`}>{(fila.movimientoSugerido.transferenciaCabaEr ?? 0).toFixed(1)}</td>
            <td className={`${clsAccionCell} px-2.5 py-2 text-right font-mono font-semibold`}>{fila.productosUsados?.map((p, i) => <div key={i} className="text-[10px] h-[15px]">{(p.produccionExistenteCABA ?? 0).toFixed(1)}</div>)}</td>
            <td className={`${clsAccionCell} px-2.5 py-2 text-right font-mono font-semibold`}>{fila.productosUsados?.map((p, i) => <div key={i} className="text-[10px] h-[15px]">{(p.produccionExistenteER ?? 0).toFixed(1)}</div>)}</td>
            <td className={`${clsAccionCell} px-2.5 py-2 text-right font-mono`}>{(fila.movimientoSugerido.compra ?? 0).toFixed(1)}</td>
            <td className={`${clsBlueCell} px-2.5 py-2 text-right font-semibold font-mono`}>{(fila.cantidadSugerida ?? 0).toFixed(1)}</td>
            <td className="px-2.5 py-2 text-center"><BadgeCriticidad criticidad={fila.criticidad} /></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
