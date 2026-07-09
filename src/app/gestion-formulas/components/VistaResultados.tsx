// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import { useVistaResultados } from '../hooks/useVistaResultados';
import { exportarExcelMRP } from '../lib/exportarExcel';
import { Tooltip, SkeletonTabla } from './ComponentesAuxiliares';
import { BadgeMovimiento } from './BadgeMovimiento';

export default function VistaResultados() {
  const {
    busqueda, setBusqueda, scrollSuperiorRef, scrollInferiorRef, anchoScroll,
    resultadosFiltradosPropios, resultadosFiltradosTercerizados,
    cargandoCalculo, resultadosMRP, pestañaActiva, setPestañaActiva, setStep,
  } = useVistaResultados();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Buscador y Acciones */}
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
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800 text-left text-[11px]">
                <thead className="bg-gray-50 dark:bg-[#2C2C2E] text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider">
                  <tr className="divide-x divide-gray-100 dark:divide-gray-800">
                    <th className="sticky top-0 z-10 bg-gray-50 dark:bg-[#2C2C2E] px-2.5 py-2 border-r border-gray-150 dark:border-gray-800">Código MP</th>
                    <th className="sticky top-0 z-10 bg-gray-50 dark:bg-[#2C2C2E] px-2.5 py-2 border-r border-gray-150 dark:border-gray-800">Descripción MP</th>
                    <th className="sticky top-0 z-10 bg-gray-50 dark:bg-[#2C2C2E] px-2.5 py-2 border-r border-gray-150 dark:border-gray-800">UM</th>
                    <th className="sticky top-0 z-10 bg-gray-50 dark:bg-[#2C2C2E] px-2.5 py-2 text-right border-r border-gray-150 dark:border-gray-800">Stock MP ER</th>
                    <th className="sticky top-0 z-10 bg-gray-50 dark:bg-[#2C2C2E] px-2.5 py-2 text-right border-r border-gray-150 dark:border-gray-800">Stock MP CABA</th>
                    <th className="sticky top-0 z-10 bg-gray-50 dark:bg-[#2C2C2E] px-2.5 py-2 text-right border-r border-gray-150 dark:border-gray-800">Cant. Sugerida</th>
                    <th className="sticky top-0 z-10 bg-gray-50 dark:bg-[#2C2C2E] px-2.5 py-2 border-r border-gray-150 dark:border-gray-800">Movimiento Sugerido</th>
                    <th className="sticky top-0 z-10 bg-gray-50 dark:bg-[#2C2C2E] px-2.5 py-2 border-r border-gray-150 dark:border-gray-800">Productos en los que se usa</th>
                    <th className="sticky top-0 z-10 bg-gray-50 dark:bg-[#2C2C2E] px-2.5 py-2 text-right">Cant (rotación)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-[#1C1C1E] text-gray-900 dark:text-gray-300">
                  {resultadosFiltradosPropios.map((fila, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-[#2C2C2E]/40 transition-colors divide-x divide-gray-100 dark:divide-gray-850 text-xs">
                      <td className="px-2.5 py-2 font-mono font-semibold">{fila.codigoMP}</td>
                      <td className="px-2.5 py-2 group relative cursor-help">
                        <div className="truncate max-w-[150px] text-ellipsis">{fila.descripcionMP}</div>
                        <Tooltip texto={fila.descripcionMP} />
                      </td>
                      <td className="px-2.5 py-2">{fila.unidadMedida}</td>
                      <td className="px-2.5 py-2 text-right font-mono text-gray-700 dark:text-gray-300">{(fila.stockMPEntreRios ?? 0).toFixed(1)}</td>
                      <td className="px-2.5 py-2 text-right font-mono text-gray-700 dark:text-gray-300">{(fila.stockMPCABA ?? 0).toFixed(1)}</td>
                      <td className="px-2.5 py-2 text-right font-semibold font-mono text-gray-900 dark:text-white">{(fila.cantidadSugerida ?? 0).toFixed(1)}</td>
                      <td className="px-2.5 py-2"><BadgeMovimiento movimiento={fila.movimientoSugerido} /></td>
                      <td className="px-2.5 py-2">
                        <div className="space-y-0.5">
                          {fila.productosUsados?.map((p, i) => (
                            <div key={i} className="text-[10px] text-gray-600 dark:text-gray-400 truncate max-w-[200px]" title={p.descripcion}>
                              {p.descripcion}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-2.5 py-2 text-right font-mono text-gray-700 dark:text-gray-300">
                        <div className="space-y-0.5">
                          {fila.productosUsados?.map((p, i) => <div key={i} className="text-[10px]">{(p.rotacion ?? 0).toFixed(1)}</div>)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800 text-left text-[11px]">
                <thead className="bg-gray-50 dark:bg-[#2C2C2E] text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider">
                  <tr className="divide-x divide-gray-100 dark:divide-gray-800">
                    <th className="sticky top-0 z-10 bg-gray-50 dark:bg-[#2C2C2E] px-2.5 py-2 border-r border-gray-150 dark:border-gray-800">Código PT</th>
                    <th className="sticky top-0 z-10 bg-gray-50 dark:bg-[#2C2C2E] px-2.5 py-2 border-r border-gray-150 dark:border-gray-800">Descripción PT</th>
                    <th className="sticky top-0 z-10 bg-gray-50 dark:bg-[#2C2C2E] px-2.5 py-2 text-right border-r border-gray-150 dark:border-gray-800">Stock PT ER</th>
                    <th className="sticky top-0 z-10 bg-gray-50 dark:bg-[#2C2C2E] px-2.5 py-2 text-right border-r border-gray-150 dark:border-gray-800">Stock PT CABA</th>
                    <th className="sticky top-0 z-10 bg-gray-50 dark:bg-[#2C2C2E] px-2.5 py-2 text-right border-r border-gray-150 dark:border-gray-800">Rotación</th>
                    <th className="sticky top-0 z-10 bg-gray-50 dark:bg-[#2C2C2E] px-2.5 py-2">Movimiento Sugerido</th>
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
                      <td className="px-2.5 py-2"><BadgeMovimiento movimiento={fila.movimientoSugerido} /></td>
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
