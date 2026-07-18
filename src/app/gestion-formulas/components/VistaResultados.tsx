// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import { useVistaResultados } from '../hooks/useVistaResultados';
import { exportarExcelMRP } from '../lib/exportarExcel';
import { SkeletonTabla, ReferenciaColores, Tooltip } from './ComponentesAuxiliares';
import DropdownFiltrosPedidos from './DropdownFiltrosPedidos';
import DropdownCriticidad from './DropdownCriticidad';
import DropdownMovimientos from './DropdownMovimientos';
import DropdownLinea from './DropdownLinea';
import DropdownTipoAnalisis from './DropdownTipoAnalisis';
import SelectorMeses from './SelectorMeses';
import { TablaProductosPropios } from './TablaProductosPropios';
import { TablaProductosTercerizados } from './TablaProductosTercerizados';

export default function VistaResultados() {
  const {
    busqueda, setBusqueda, filtrosActivos, setFiltrosActivos, criticidades, setCriticidades,
    movimientosFiltrados, setMovimientosFiltrados, lineasFiltradas, setLineasFiltradas, lineasDisponibles,
    mesesProyeccionTransferencia, mesesProyeccionCompra, setMesesProyeccionTransferencia, setMesesProyeccionCompra,
    scrollSuperiorRef, scrollInferiorRef, anchoScroll, resultadosFiltradosPropios, resultadosFiltradosTercerizados,
    cargandoCalculo, resultadosMRP, pestañaActiva, setPestañaActiva, setStep, sortPropios, solicitarOrdenPropios,
    sortTercerizados, solicitarOrdenTercerizados, tipoAnalisis, setTipoAnalisis, modoMacro, toggleModoMacro
  } = useVistaResultados();

  const getIndP = (k: any) => (sortPropios && sortPropios.key === k) ? (sortPropios.direction === 'asc' ? ' ▲' : ' ▼') : '';
  const getIndT = (k: any) => (sortTercerizados && sortTercerizados.key === k) ? (sortTercerizados.direction === 'asc' ? ' ▲' : ' ▼') : '';

  // SelectorMeses se extrajo a su propio componente para modularidad y mantener el archivo < 200 líneas

  return (
    <div className="space-y-6 w-full">
      {/* Barra de Controles */}
      <div className="flex flex-col gap-3 p-4 rounded-xl bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-gray-800 shadow-sm">
        {/* Fila 1: Buscador + Botones de Acción */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">🔍</span>
            <input
              type="text" placeholder="Código o descripción..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-9 pr-3 h-9 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#2C2C2E] dark:text-white text-xs placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-sm"
            />
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <button onClick={() => setStep(1)} className="px-4 h-9 rounded-lg border border-gray-300 dark:border-gray-700 text-xs font-bold hover:bg-gray-50 dark:hover:bg-[#2C2C2E]/50 text-gray-700 dark:text-gray-300 transition-all cursor-pointer shadow-sm whitespace-nowrap">
              Re-importar Excel
            </button>
            <button
              onClick={() => exportarExcelMRP(
                { propios: resultadosFiltradosPropios, tercerizados: resultadosFiltradosTercerizados },
                mesesProyeccionTransferencia, mesesProyeccionCompra, modoMacro
              )}
              disabled={cargandoCalculo || !resultadosMRP}
              className="px-4 h-9 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-800 text-white text-xs font-bold transition-all shadow-md cursor-pointer whitespace-nowrap"
            >
              Exportar Resultados 📥
            </button>
          </div>
        </div>

        {/* Divisor sutil */}
        <div className="h-px bg-gray-100 dark:bg-gray-800" />

        {/* Fila 2: Filtros agrupados con separadores */}
        <div className="flex flex-wrap items-end gap-x-1 gap-y-2">
          {/* Grupo 1: Filtros principales */}
          <div className="flex items-center gap-1.5">
            <DropdownFiltrosPedidos filtrosActivos={filtrosActivos} setFiltrosActivos={setFiltrosActivos} />
            <DropdownCriticidad criticidades={criticidades} setCriticidades={setCriticidades} />
            <DropdownMovimientos movimientosFiltrados={movimientosFiltrados} setMovimientosFiltrados={setMovimientosFiltrados} />
            <DropdownLinea lineasFiltradas={lineasFiltradas} setLineasFiltradas={setLineasFiltradas} lineasDisponibles={lineasDisponibles} />
          </div>

          {/* Separador */}
          <div className="self-end h-9 w-px bg-gray-200 dark:bg-gray-700 mx-1.5" />

          {/* Grupo 2: Tipo de Análisis (solo en pestaña Propios) */}
          {pestañaActiva === 'propios' && (
            <>
              <DropdownTipoAnalisis tipoAnalisis={tipoAnalisis} setTipoAnalisis={setTipoAnalisis} />
              <div className="self-end h-9 w-px bg-gray-200 dark:bg-gray-700 mx-1.5" />
            </>
          )}

          {/* Grupo 3: Proyección de meses + Switch Modo Mayorista */}
          <div className="flex items-end gap-3.5">
            <SelectorMeses titulo="Meses de Transferencia" valor={mesesProyeccionTransferencia} setValor={setMesesProyeccionTransferencia} />
            <SelectorMeses titulo="Meses de Compra" valor={mesesProyeccionCompra} setValor={setMesesProyeccionCompra} />

            <div className="flex flex-col relative group select-none">
              <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Modo Mayorista (Kilos)</span>
              <div className="flex items-center h-9">
                <button
                  onClick={toggleModoMacro} type="button"
                  className={`relative flex h-8 w-20 shrink-0 cursor-pointer rounded-full transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:ring-offset-1 ${
                    modoMacro
                      ? 'bg-gradient-to-r from-blue-600 to-blue-500 dark:from-blue-500 dark:to-blue-400'
                      : 'bg-gray-200 dark:bg-[#3A3A3C]'
                  }`}
                >
                  {/* Etiqueta KG — visible con max opacidad cuando activo */}
                  <span className={`absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-black tracking-wider transition-all duration-250 pointer-events-none ${
                    modoMacro ? 'text-white opacity-90' : 'text-gray-400 dark:text-gray-500 opacity-40'
                  }`}>KG</span>
                  {/* Etiqueta UN — visible con max opacidad cuando inactivo */}
                  <span className={`absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-black tracking-wider transition-all duration-250 pointer-events-none ${
                    modoMacro ? 'text-white opacity-20' : 'text-gray-500 dark:text-gray-400 opacity-80'
                  }`}>UN</span>
                  {/* Thumb deslizante con letra activa de alto contraste */}
                  <span className={`absolute top-1 flex items-center justify-center h-6 w-6 rounded-full bg-white shadow-md transition-all duration-300 ease-in-out ${
                    modoMacro ? 'left-[calc(100%-28px)]' : 'left-1'
                  }`}>
                    <span className={`text-[11px] font-black leading-none select-none transition-colors duration-200 ${
                      modoMacro ? 'text-blue-600 dark:text-blue-500' : 'text-gray-400 dark:text-gray-500'
                    }`}>{modoMacro ? 'K' : 'U'}</span>
                  </span>
                </button>
              </div>
              <Tooltip texto="Filtra productos que no terminen en 'K' y asume una relación de producción simplificada 1:1 (1 kg MP = 1 kg PT)." />
            </div>
          </div>
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
        <div className="space-y-3">
          <ReferenciaColores />

          <div ref={scrollSuperiorRef} className="overflow-x-auto w-full border border-gray-200 dark:border-gray-800 rounded-t-xl bg-white dark:bg-[#1C1C1E] md:block hidden h-3 overflow-y-hidden">
            <div style={{ width: `${anchoScroll}px`, height: '1px' }} />
          </div>

          <div ref={scrollInferiorRef} className="overflow-x-auto max-h-[580px] overflow-y-auto rounded-b-xl md:rounded-t-none border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1C1C1E] shadow-sm">
            {pestañaActiva === 'propios' ? (
              <TablaProductosPropios
                resultadosFiltradosPropios={resultadosFiltradosPropios} solicitarOrdenPropios={solicitarOrdenPropios} getIndP={getIndP}
                mesesProyeccionTransferencia={mesesProyeccionTransferencia} mesesProyeccionCompra={mesesProyeccionCompra}
                modoMacro={modoMacro}
              />
            ) : (
              <TablaProductosTercerizados
                resultadosFiltradosTercerizados={resultadosFiltradosTercerizados} solicitarOrdenTercerizados={solicitarOrdenTercerizados} getIndT={getIndT}
                mesesProyeccionTransferencia={mesesProyeccionTransferencia} mesesProyeccionCompra={mesesProyeccionCompra}
              />
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
