// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import React from 'react';
import { ResultadoMRP } from '../lib/types';
import { Tooltip } from './ComponentesAuxiliares';

interface TablaProductosPropiosProps {
  resultadosFiltradosPropios: ResultadoMRP[];
  sortPropios: { key: keyof ResultadoMRP; direction: 'asc' | 'desc' } | null;
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
  sortPropios,
  solicitarOrdenPropios,
  getIndP,
  mesesProyeccionTransferencia,
  mesesProyeccionCompra,
}: TablaProductosPropiosProps) {
  return (
    <table className="min-w-[1950px] divide-y divide-gray-200 dark:divide-gray-800 text-left text-[11px]">
      <thead className="bg-gray-50 dark:bg-[#2C2C2E] text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider select-none">
        <tr className="divide-x divide-gray-100 dark:divide-gray-800">
          <th onClick={() => solicitarOrdenPropios('codigoMP')} className="sticky top-0 z-10 bg-gray-50 dark:bg-[#2C2C2E] px-2.5 py-2 border-r border-gray-150 dark:border-gray-800 cursor-pointer hover:bg-gray-100 dark:hover:bg-[#3A3A3C]">Código MP{getIndP('codigoMP')}</th>
          <th onClick={() => solicitarOrdenPropios('descripcionMP')} className="sticky top-0 z-10 bg-gray-50 dark:bg-[#2C2C2E] px-2.5 py-2 border-r border-gray-150 dark:border-gray-800 cursor-pointer hover:bg-gray-100 dark:hover:bg-[#3A3A3C]">Descripción MP{getIndP('descripcionMP')}</th>
          <th onClick={() => solicitarOrdenPropios('unidadMedida')} className="sticky top-0 z-10 bg-gray-50 dark:bg-[#2C2C2E] px-2.5 py-2 border-r border-gray-150 dark:border-gray-800 cursor-pointer hover:bg-gray-100 dark:hover:bg-[#3A3A3C]">UM{getIndP('unidadMedida')}</th>
          <th onClick={() => solicitarOrdenPropios('stockMPEntreRios')} className="sticky top-0 z-10 bg-gray-50 dark:bg-[#2C2C2E] px-2.5 py-2 text-right border-r border-gray-150 dark:border-gray-800 cursor-pointer hover:bg-gray-100 dark:hover:bg-[#3A3A3C]">Stock MP E.R.{getIndP('stockMPEntreRios')}</th>
          <th onClick={() => solicitarOrdenPropios('stockMPCABA')} className="sticky top-0 z-10 bg-gray-50 dark:bg-[#2C2C2E] px-2.5 py-2 text-right border-r border-gray-150 dark:border-gray-800 cursor-pointer hover:bg-gray-100 dark:hover:bg-[#3A3A3C]">Stock MP CABA{getIndP('stockMPCABA')}</th>
          <th onClick={() => solicitarOrdenPropios('cantidadSugerida')} className="sticky top-0 z-10 bg-gray-50 dark:bg-[#2C2C2E] px-2.5 py-2 text-right border-r border-gray-150 dark:border-gray-800 cursor-pointer hover:bg-gray-100 dark:hover:bg-[#3A3A3C]">Cant. Sugerida{getIndP('cantidadSugerida')}</th>
          <th className="sticky top-0 z-10 bg-gray-50 dark:bg-[#2C2C2E] px-2.5 py-2 text-right border-r border-gray-150 dark:border-gray-800">Demanda {mesesProyeccionCompra} {mesesProyeccionCompra === 1 ? 'Mes' : 'Meses'} (Compra)</th>
          <th className="sticky top-0 z-10 bg-gray-50 dark:bg-[#2C2C2E] px-2.5 py-2 text-right border-r border-gray-150 dark:border-gray-800">Demanda {mesesProyeccionTransferencia} {mesesProyeccionTransferencia === 1 ? 'Mes' : 'Meses'} (Transf.)</th>
          <th onClick={() => solicitarOrdenPropios('criticidad')} className="sticky top-0 z-10 bg-gray-50 dark:bg-[#2C2C2E] px-2.5 py-2 border-r border-gray-150 dark:border-gray-800 cursor-pointer hover:bg-gray-100 dark:hover:bg-[#3A3A3C]">Criticidad{getIndP('criticidad')}</th>
          <th className="sticky top-0 z-10 bg-gray-50 dark:bg-[#2C2C2E] px-2.5 py-2 border-r border-gray-150 dark:border-gray-800">Código</th>
          <th className="sticky top-0 z-10 bg-gray-50 dark:bg-[#2C2C2E] px-2.5 py-2 border-r border-gray-150 dark:border-gray-800">Productos en los que se usa</th>
          <th className="sticky top-0 z-10 bg-gray-50 dark:bg-[#2C2C2E] px-2.5 py-2 border-r border-gray-150 dark:border-gray-800">Línea</th>
          <th className="sticky top-0 z-10 bg-gray-50 dark:bg-[#2C2C2E] px-2.5 py-2 border-r border-gray-150 dark:border-gray-800">Planta</th>
          <th className="sticky top-0 z-10 bg-gray-50 dark:bg-[#2C2C2E] px-2.5 py-2 text-right border-r border-gray-150 dark:border-gray-800">Stock PT E.R.</th>
          <th className="sticky top-0 z-10 bg-gray-50 dark:bg-[#2C2C2E] px-2.5 py-2 text-right border-r border-gray-150 dark:border-gray-800">Stock PT CABA</th>
          <th className="sticky top-0 z-10 bg-gray-50 dark:bg-[#2C2C2E] px-2.5 py-2 text-right border-r border-gray-150 dark:border-gray-800">Producir CABA</th>
          <th className="sticky top-0 z-10 bg-gray-50 dark:bg-[#2C2C2E] px-2.5 py-2 text-right border-r border-gray-150 dark:border-gray-800">Producir E.R.</th>
          <th className="sticky top-0 z-10 bg-gray-50 dark:bg-[#2C2C2E] px-2.5 py-2 text-right border-r border-gray-150 dark:border-gray-800">Transferir PT</th>
          <th className="sticky top-0 z-10 bg-gray-50 dark:bg-[#2C2C2E] pl-2.5 pr-8 py-2 text-right">Cant (rotación)</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-[#1C1C1E] text-gray-900 dark:text-gray-300">
        {resultadosFiltradosPropios.map((fila, idx) => (
          <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-[#2C2C2E]/40 transition-colors divide-x divide-gray-100 dark:divide-gray-850 text-xs text-left">
            <td className="px-2.5 py-2 font-mono font-semibold">{fila.codigoMP}</td>
            <td className="px-2.5 py-2 group relative cursor-help">
              <div className="truncate max-w-[150px] text-ellipsis">{fila.descripcionMP}</div>
              <Tooltip texto={fila.descripcionMP} />
            </td>
            <td className="px-2.5 py-2">{fila.unidadMedida}</td>
            <td className="px-2.5 py-2 text-right font-mono text-gray-700 dark:text-gray-300">{(fila.stockMPEntreRios ?? 0).toFixed(1)}</td>
            <td className="px-2.5 py-2 text-right font-mono text-gray-700 dark:text-gray-300">{(fila.stockMPCABA ?? 0).toFixed(1)}</td>
            <td className="px-2.5 py-2 text-right font-semibold font-mono text-gray-900 dark:text-white">{(fila.cantidadSugerida ?? 0).toFixed(1)}</td>
            <td className="px-2.5 py-2 text-right font-mono text-gray-700 dark:text-gray-300">{(fila.movimientoSugerido.compra ?? 0).toFixed(1)}</td>
            <td className="px-2.5 py-2 text-right font-mono text-gray-700 dark:text-gray-300">{(fila.movimientoSugerido.transferencia ?? 0).toFixed(1)}</td>
            <td className="px-2.5 py-2 text-center"><BadgeCriticidad criticidad={fila.criticidad} /></td>
            <td className="px-2.5 py-2">
              <div className="space-y-0.5 text-left">
                {fila.productosUsados?.map((p, i) => (
                  <div key={i} className="text-[10px] text-gray-600 dark:text-gray-400 truncate max-w-[100px]" title={p.codigoProducto}>
                    {p.codigoProducto}
                  </div>
                ))}
              </div>
            </td>
            <td className="px-2.5 py-2">
              <div className="space-y-0.5 text-left">
                {fila.productosUsados?.map((p, i) => (
                  <div key={i} className="text-[10px] text-gray-600 dark:text-gray-400 truncate max-w-[200px]" title={p.descripcion}>
                    {p.descripcion}
                  </div>
                ))}
              </div>
            </td>
            <td className="px-2.5 py-2">
              <div className="space-y-0.5 text-left">
                {fila.productosUsados?.map((p, i) => (
                  <div key={i} className="text-[10px] font-semibold text-gray-600 dark:text-gray-400 truncate max-w-[150px]" title={p.linea || '-'}>
                    {p.linea || '-'}
                  </div>
                ))}
              </div>
            </td>
            <td className="px-2.5 py-2">
              <div className="space-y-1 text-center">
                {fila.productosUsados?.map((p, i) => (
                  <div key={i} className="text-[9px] font-bold">
                    {p.sitioFabricacion ? (
                      <span className={`px-1.5 py-0.5 rounded-md ${
                        p.sitioFabricacion === 'CABA'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400'
                          : p.sitioFabricacion === 'ENTRE RIOS'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400'
                          : p.sitioFabricacion === 'TERC. CABA'
                          ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-400'
                          : p.sitioFabricacion === 'TERC. ENTRE RIOS'
                          ? 'bg-pink-100 text-pink-800 dark:bg-pink-950/40 dark:text-pink-400'
                          : p.sitioFabricacion === 'TERC. CON PROV. MP'
                          ? 'bg-teal-100 text-teal-800 dark:bg-teal-950/40 dark:text-teal-400'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400'
                      }`}>
                        {p.sitioFabricacion}
                      </span>
                    ) : '-'}
                  </div>
                ))}
              </div>
            </td>
            <td className="px-2.5 py-2 text-right font-mono text-gray-700 dark:text-gray-300">
              <div className="space-y-0.5">
                {fila.productosUsados?.map((p, i) => <div key={i} className="text-[10px]">{(p.stockPTEntreRios ?? 0).toFixed(1)}</div>)}
              </div>
            </td>
            <td className="px-2.5 py-2 text-right font-mono text-gray-700 dark:text-gray-300">
              <div className="space-y-0.5">
                {fila.productosUsados?.map((p, i) => <div key={i} className="text-[10px]">{(p.stockPTCABA ?? 0).toFixed(1)}</div>)}
              </div>
            </td>
            <td className="px-2.5 py-2 text-right font-mono font-semibold text-gray-900 dark:text-white">
              <div className="space-y-0.5">
                {fila.productosUsados?.map((p, i) => <div key={i} className="text-[10px]">{(p.cantidadFabricarCABA ?? 0).toFixed(1)}</div>)}
              </div>
            </td>
            <td className="px-2.5 py-2 text-right font-mono font-semibold text-gray-900 dark:text-white">
              <div className="space-y-0.5">
                {fila.productosUsados?.map((p, i) => <div key={i} className="text-[10px]">{(p.cantidadFabricarER ?? 0).toFixed(1)}</div>)}
              </div>
            </td>
            <td className="px-2.5 py-2 text-right font-mono text-gray-700 dark:text-gray-300">
              <div className="space-y-0.5">
                {fila.productosUsados?.map((p, i) => <div key={i} className="text-[10px]">{(p.transferirPT ?? 0).toFixed(1)}</div>)}
              </div>
            </td>
            <td className="pl-2.5 pr-8 py-2 text-right font-mono text-gray-700 dark:text-gray-300">
              <div className="space-y-0.5">
                {fila.productosUsados?.map((p, i) => <div key={i} className="text-[10px]">{(p.rotacion ?? 0).toFixed(1)}</div>)}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
