// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import { useVistaResultados } from '../hooks/useVistaResultados';
import { exportarExcelMRP } from '../lib/exportarExcel';
import { Tooltip, SkeletonTabla } from './ComponentesAuxiliares';
import DropdownFiltrosPedidos from './DropdownFiltrosPedidos';
import SelectorMesesRotacion from './SelectorMesesRotacion';

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

export default function VistaResultados() {
  const {
    busqueda, setBusqueda, filtrosActivos, setFiltrosActivos, criticidades, setCriticidades, mesesRotacion, setMesesRotacion,
    scrollSuperiorRef, scrollInferiorRef, anchoScroll,
    resultadosFiltradosPropios, resultadosFiltradosTercerizados,
    cargandoCalculo, resultadosMRP, pestañaActiva, setPestañaActiva, setStep,
    sortPropios, solicitarOrdenPropios, sortTercerizados, solicitarOrdenTercerizados,
  } = useVistaResultados();

  const getIndP = (k: any) => (sortPropios && sortPropios.key === k) ? (sortPropios.direction === 'asc' ? ' ▲' : ' ▼') : '';
  const getIndT = (k: any) => (sortTercerizados && sortTercerizados.key === k) ? (sortTercerizados.direction === 'asc' ? ' ▲' : ' ▼') : '';

  return (
    <div className="space-y-6 w-full">
      {/* Buscador, Filtros y Acciones */}
      <div className="flex flex-col md:flex-row items-end justify-between p-4 rounded-xl bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-gray-800 gap-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          <div className="flex flex-col w-full sm:w-auto">
            <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Buscar MP o PT</span>
            <div className="relative">
              <input
                type="text" placeholder="Código o descripción..." value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="pl-8 pr-3 h-9 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#2C2C2E] dark:text-white text-xs placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 w-full sm:w-60 transition-all shadow-sm"
              />
              <span className="absolute left-2.5 top-2.5 text-gray-400 text-xs">🔍</span>
            </div>
          </div>
          <div className="flex flex-col justify-end h-full pt-4">
            <DropdownFiltrosPedidos 
              filtrosActivos={filtrosActivos} 
              setFiltrosActivos={setFiltrosActivos}
              criticidades={criticidades}
              setCriticidades={setCriticidades}
            />
          </div>
          <div className="flex flex-col">
            <SelectorMesesRotacion 
              mesesRotacion={mesesRotacion}
              setMesesRotacion={setMesesRotacion}
            />
          </div>
        </div>
        <div className="flex space-x-2 w-full md:w-auto justify-end">
          <button onClick={() => setStep(1)} className="px-4 h-9 rounded-lg border border-gray-300 dark:border-gray-700 text-xs font-bold hover:bg-gray-50 dark:hover:bg-[#2C2C2E]/50 text-gray-700 dark:text-gray-300 transition-all cursor-pointer shadow-sm">
            Re-importar Excel
          </button>
          <button
            onClick={() => resultadosMRP && exportarExcelMRP(resultadosMRP)}
            disabled={cargandoCalculo || !resultadosMRP}
            className="px-4 h-9 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-800 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            Exportar Resultados 📥
          </button>
        </div>
      </div>

      {/* Pestañas */}
      <div className="flex border-b border-gray-200 dark:border-gray-800">
        <button
          onClick={() => setPestañaActiva('propios')}
          className={`px-4 py-2 text-xs font-bold border-b-2 cursor-pointer transition-all ${pestañaActiva === 'propios' ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
        >
          Productos Propios (Materia Prima)
        </button>
        <button
          onClick={() => setPestañaActiva('tercerizados')}
          className={`px-4 py-2 text-xs font-bold border-b-2 cursor-pointer transition-all ${pestañaActiva === 'tercerizados' ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
        >
          Productos Tercerizados (PT Directo)
        </button>
      </div>

      {cargandoCalculo ? (
        <SkeletonTabla />
      ) : resultadosMRP ? (
        <div className="space-y-1">
          <div ref={scrollSuperiorRef} className="overflow-x-auto w-full border border-gray-200 dark:border-gray-800 rounded-t-xl bg-white dark:bg-[#1C1C1E] md:block hidden h-3 overflow-y-hidden">
            <div style={{ width: `${anchoScroll}px`, height: '1px' }} />
          </div>

          <div ref={scrollInferiorRef} className="overflow-x-auto max-h-[580px] overflow-y-auto rounded-b-xl md:rounded-t-none border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1C1C1E] shadow-sm">
            {pestañaActiva === 'propios' ? (
              <table className="min-w-[1650px] divide-y divide-gray-200 dark:divide-gray-800 text-left text-[11px]">
                <thead className="bg-gray-50 dark:bg-[#2C2C2E] text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider select-none">
                  <tr className="divide-x divide-gray-100 dark:divide-gray-800">
                    <th onClick={() => solicitarOrdenPropios('codigoMP')} className="sticky top-0 z-10 bg-gray-50 dark:bg-[#2C2C2E] px-2.5 py-2 border-r border-gray-150 dark:border-gray-800 cursor-pointer hover:bg-gray-100 dark:hover:bg-[#3A3A3C]">Código MP{getIndP('codigoMP')}</th>
                    <th onClick={() => solicitarOrdenPropios('descripcionMP')} className="sticky top-0 z-10 bg-gray-50 dark:bg-[#2C2C2E] px-2.5 py-2 border-r border-gray-150 dark:border-gray-800 cursor-pointer hover:bg-gray-100 dark:hover:bg-[#3A3A3C]">Descripción MP{getIndP('descripcionMP')}</th>
                    <th onClick={() => solicitarOrdenPropios('unidadMedida')} className="sticky top-0 z-10 bg-gray-50 dark:bg-[#2C2C2E] px-2.5 py-2 border-r border-gray-150 dark:border-gray-800 cursor-pointer hover:bg-gray-100 dark:hover:bg-[#3A3A3C]">UM{getIndP('unidadMedida')}</th>
                    <th onClick={() => solicitarOrdenPropios('stockMPEntreRios')} className="sticky top-0 z-10 bg-gray-50 dark:bg-[#2C2C2E] px-2.5 py-2 text-right border-r border-gray-150 dark:border-gray-800 cursor-pointer hover:bg-gray-100 dark:hover:bg-[#3A3A3C]">Stock MP E.R.{getIndP('stockMPEntreRios')}</th>
                    <th onClick={() => solicitarOrdenPropios('stockMPCABA')} className="sticky top-0 z-10 bg-gray-50 dark:bg-[#2C2C2E] px-2.5 py-2 text-right border-r border-gray-150 dark:border-gray-800 cursor-pointer hover:bg-gray-100 dark:hover:bg-[#3A3A3C]">Stock MP CABA{getIndP('stockMPCABA')}</th>
                    <th onClick={() => solicitarOrdenPropios('cantidadSugerida')} className="sticky top-0 z-10 bg-gray-50 dark:bg-[#2C2C2E] px-2.5 py-2 text-right border-r border-gray-150 dark:border-gray-800 cursor-pointer hover:bg-gray-100 dark:hover:bg-[#3A3A3C]">Cant. Sugerida{getIndP('cantidadSugerida')}</th>
                    <th className="sticky top-0 z-10 bg-gray-50 dark:bg-[#2C2C2E] px-2.5 py-2 text-right border-r border-gray-150 dark:border-gray-800">Comprar MP</th>
                    <th className="sticky top-0 z-10 bg-gray-50 dark:bg-[#2C2C2E] px-2.5 py-2 text-right border-r border-gray-150 dark:border-gray-800">Transferir MP</th>
                    <th onClick={() => solicitarOrdenPropios('criticidad')} className="sticky top-0 z-10 bg-gray-50 dark:bg-[#2C2C2E] px-2.5 py-2 border-r border-gray-150 dark:border-gray-800 cursor-pointer hover:bg-gray-100 dark:hover:bg-[#3A3A3C]">Criticidad{getIndP('criticidad')}</th>
                    <th className="sticky top-0 z-10 bg-gray-50 dark:bg-[#2C2C2E] px-2.5 py-2 border-r border-gray-150 dark:border-gray-800">Código</th>
                    <th className="sticky top-0 z-10 bg-gray-50 dark:bg-[#2C2C2E] px-2.5 py-2 border-r border-gray-150 dark:border-gray-800">Productos en los que se usa</th>
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
            ) : (
              <table className="min-w-[1000px] divide-y divide-gray-200 dark:divide-gray-800 text-left text-[11px]">
                <thead className="bg-gray-50 dark:bg-[#2C2C2E] text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider select-none">
                  <tr className="divide-x divide-gray-100 dark:divide-gray-800">
                    <th onClick={() => solicitarOrdenTercerizados('codigoPT')} className="sticky top-0 z-10 bg-gray-50 dark:bg-[#2C2C2E] px-2.5 py-2 border-r border-gray-150 dark:border-gray-800 cursor-pointer hover:bg-gray-100 dark:hover:bg-[#3A3A3C]">Código PT{getIndT('codigoPT')}</th>
                    <th onClick={() => solicitarOrdenTercerizados('descripcionPT')} className="sticky top-0 z-10 bg-gray-50 dark:bg-[#2C2C2E] px-2.5 py-2 border-r border-gray-150 dark:border-gray-800 cursor-pointer hover:bg-gray-100 dark:hover:bg-[#3A3A3C]">Descripción PT{getIndT('descripcionPT')}</th>
                    <th onClick={() => solicitarOrdenTercerizados('stockPTEntreRios')} className="sticky top-0 z-10 bg-gray-50 dark:bg-[#2C2C2E] px-2.5 py-2 text-right border-r border-gray-150 dark:border-gray-800 cursor-pointer hover:bg-gray-100 dark:hover:bg-[#3A3A3C]">Stock PT E.R.{getIndT('stockPTEntreRios')}</th>
                    <th onClick={() => solicitarOrdenTercerizados('stockPTCABA')} className="sticky top-0 z-10 bg-gray-50 dark:bg-[#2C2C2E] px-2.5 py-2 text-right border-r border-gray-150 dark:border-gray-800 cursor-pointer hover:bg-gray-100 dark:hover:bg-[#3A3A3C]">Stock PT CABA{getIndT('stockPTCABA')}</th>
                    <th onClick={() => solicitarOrdenTercerizados('rotacion')} className="sticky top-0 z-10 bg-gray-50 dark:bg-[#2C2C2E] text-right border-r border-gray-150 dark:border-gray-800 cursor-pointer hover:bg-gray-100 dark:hover:bg-[#3A3A3C]">Rotación{getIndT('rotacion')}</th>
                    <th className="sticky top-0 z-10 bg-gray-50 dark:bg-[#2C2C2E] px-2.5 py-2 text-right border-r border-gray-150 dark:border-gray-800">Comprar</th>
                    <th className="sticky top-0 z-10 bg-gray-50 dark:bg-[#2C2C2E] px-2.5 py-2 text-right border-r border-gray-150 dark:border-gray-800">Transferir</th>
                    <th onClick={() => solicitarOrdenTercerizados('criticidad')} className="sticky top-0 z-10 bg-gray-50 dark:bg-[#2C2C2E] pl-2.5 pr-8 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-[#3A3A3C]">Criticidad{getIndT('criticidad')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-[#1C1C1E] text-gray-900 dark:text-gray-300">
                  {resultadosFiltradosTercerizados.map((fila, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-[#2C2C2E]/40 transition-colors divide-x divide-gray-100 dark:divide-gray-850 text-xs">
                      <td className="px-2.5 py-2 font-mono font-semibold">{fila.codigoPT}</td>
                      <td className="px-2.5 py-2 group relative cursor-help">
                        <div className="truncate max-w-[250px] text-ellipsis">{fila.descripcionPT}</div>
                        <Tooltip texto={fila.descripcionPT} />
                      </td>
                      <td className="px-2.5 py-2 text-right font-mono text-gray-700 dark:text-gray-300">{(fila.stockPTEntreRios ?? 0).toFixed(1)}</td>
                      <td className="px-2.5 py-2 text-right font-mono text-gray-700 dark:text-gray-300">{(fila.stockPTCABA ?? 0).toFixed(1)}</td>
                      <td className="px-2.5 py-2 text-right font-mono text-gray-700 dark:text-gray-300">{(fila.rotacion ?? 0).toFixed(1)}</td>
                      <td className="px-2.5 py-2 text-right font-mono text-gray-700 dark:text-gray-300">{(fila.movimientoSugerido.compra ?? 0).toFixed(1)}</td>
                      <td className="px-2.5 py-2 text-right font-mono text-gray-700 dark:text-gray-300">{(fila.movimientoSugerido.transferencia ?? 0).toFixed(1)}</td>
                      <td className="pl-2.5 pr-8 py-2 text-center"><BadgeCriticidad criticidad={fila.criticidad} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
