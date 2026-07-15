// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import { useVistaResultados } from '../hooks/useVistaResultados';
import { exportarExcelMRP } from '../lib/exportarExcel';
import { SkeletonTabla } from './ComponentesAuxiliares';
import DropdownFiltrosPedidos from './DropdownFiltrosPedidos';
import DropdownCriticidad from './DropdownCriticidad';
import DropdownMovimientos from './DropdownMovimientos';
import DropdownPlanta from './DropdownPlanta';
import DropdownLinea from './DropdownLinea';
import * as Select from '@radix-ui/react-select';
import { TablaProductosPropios } from './TablaProductosPropios';
import { TablaProductosTercerizados } from './TablaProductosTercerizados';

export default function VistaResultados() {
  const {
    busqueda, setBusqueda, filtrosActivos, setFiltrosActivos, criticidades, setCriticidades,
    movimientosFiltrados, setMovimientosFiltrados, plantasFiltradas, setPlantasFiltradas,
    lineasFiltradas, setLineasFiltradas, lineasDisponibles,
    mesesProyeccionTransferencia, mesesProyeccionCompra, setMesesProyeccionTransferencia, setMesesProyeccionCompra,
    scrollSuperiorRef, scrollInferiorRef, anchoScroll,
    resultadosFiltradosPropios, resultadosFiltradosTercerizados,
    cargandoCalculo, resultadosMRP, pestañaActiva, setPestañaActiva, setStep,
    sortPropios, solicitarOrdenPropios, sortTercerizados, solicitarOrdenTercerizados,
  } = useVistaResultados();

  const getIndP = (k: any) => (sortPropios && sortPropios.key === k) ? (sortPropios.direction === 'asc' ? ' ▲' : ' ▼') : '';
  const getIndT = (k: any) => (sortTercerizados && sortTercerizados.key === k) ? (sortTercerizados.direction === 'asc' ? ' ▲' : ' ▼') : '';

  const renderSelectorMeses = (titulo: string, valor: number, setValor: (v: number) => void) => (
    <div className="flex flex-col">
      <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">
        {titulo}
      </span>
      <Select.Root value={String(valor)} onValueChange={(val) => setValor(Number(val))}>
        <Select.Trigger className="flex items-center justify-between h-9 w-36 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#2C2C2E] text-xs text-gray-700 dark:text-gray-300 px-3 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer shadow-sm hover:border-gray-400 transition-all">
          <Select.Value />
          <Select.Icon className="text-gray-400 text-[10px]">▼</Select.Icon>
        </Select.Trigger>
        <Select.Portal>
          <Select.Content className="overflow-hidden bg-white dark:bg-[#2C2C2E] rounded-lg shadow-lg border border-gray-200 dark:border-gray-800 z-50">
            <Select.Viewport className="p-1">
              {[1, 2, 3, 4, 5, 6].map((mes) => (
                <Select.Item
                  key={mes}
                  value={String(mes)}
                  className="relative flex items-center h-8 pl-8 pr-4 text-xs text-gray-700 dark:text-gray-300 rounded-md select-none focus:bg-blue-600 focus:text-white dark:focus:bg-blue-500 cursor-pointer outline-none transition-colors"
                >
                  <span className="absolute left-2.5 flex items-center justify-center">
                    <Select.ItemIndicator>✓</Select.ItemIndicator>
                  </span>
                  <Select.ItemText>
                    {mes} {mes === 1 ? 'Mes' : 'Meses'}
                  </Select.ItemText>
                </Select.Item>
              ))}
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    </div>
  );

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
          <div className="flex flex-wrap gap-2.5 items-end">
            <DropdownFiltrosPedidos 
              filtrosActivos={filtrosActivos} 
              setFiltrosActivos={setFiltrosActivos}
            />
            <DropdownCriticidad 
              criticidades={criticidades}
              setCriticidades={setCriticidades}
            />
            <DropdownMovimientos 
              movimientosFiltrados={movimientosFiltrados}
              setMovimientosFiltrados={setMovimientosFiltrados}
            />
            {pestañaActiva === 'propios' && (
              <DropdownPlanta 
                plantasFiltradas={plantasFiltradas}
                setPlantasFiltradas={setPlantasFiltradas}
              />
            )}
            <DropdownLinea 
              lineasFiltradas={lineasFiltradas}
              setLineasFiltradas={setLineasFiltradas}
              lineasDisponibles={lineasDisponibles}
            />
          </div>
          <div className="flex items-center gap-2.5">
            {renderSelectorMeses("Meses de Transferencia", mesesProyeccionTransferencia, setMesesProyeccionTransferencia)}
            {renderSelectorMeses("Meses de Compra", mesesProyeccionCompra, setMesesProyeccionCompra)}
          </div>
        </div>
        <div className="flex space-x-2 w-full md:w-auto justify-end">
          <button onClick={() => setStep(1)} className="px-4 h-9 rounded-lg border border-gray-300 dark:border-gray-700 text-xs font-bold hover:bg-gray-50 dark:hover:bg-[#2C2C2E]/50 text-gray-700 dark:text-gray-300 transition-all cursor-pointer shadow-sm">
            Re-importar Excel
          </button>
          <button
            onClick={() => resultadosMRP && exportarExcelMRP(resultadosMRP, mesesProyeccionTransferencia, mesesProyeccionCompra)}
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
        <div className="space-y-3">
          {/* Referencia de Colores */}
          <div className="flex flex-wrap items-center gap-5 px-3 py-2 bg-gray-50/50 dark:bg-[#2C2C2E]/20 border border-gray-150 dark:border-gray-800/30 rounded-lg text-[10px] font-bold text-gray-500 dark:text-gray-400 select-none">
            <span className="flex items-center space-x-1.5">
              <span className="w-3.5 h-3.5 rounded bg-[#E6F4EA] dark:bg-[#193220] border border-emerald-200/50 dark:border-emerald-900/30" />
              <span>Verde: Datos extraídos (planillas)</span>
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

          <div ref={scrollSuperiorRef} className="overflow-x-auto w-full border border-gray-200 dark:border-gray-800 rounded-t-xl bg-white dark:bg-[#1C1C1E] md:block hidden h-3 overflow-y-hidden">
            <div style={{ width: `${anchoScroll}px`, height: '1px' }} />
          </div>

          <div ref={scrollInferiorRef} className="overflow-x-auto max-h-[580px] overflow-y-auto rounded-b-xl md:rounded-t-none border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1C1C1E] shadow-sm">
            {pestañaActiva === 'propios' ? (
              <TablaProductosPropios
                resultadosFiltradosPropios={resultadosFiltradosPropios}
                solicitarOrdenPropios={solicitarOrdenPropios}
                getIndP={getIndP}
                mesesProyeccionTransferencia={mesesProyeccionTransferencia}
                mesesProyeccionCompra={mesesProyeccionCompra}
              />
            ) : (
              <TablaProductosTercerizados
                resultadosFiltradosTercerizados={resultadosFiltradosTercerizados}
                solicitarOrdenTercerizados={solicitarOrdenTercerizados}
                getIndT={getIndT}
                mesesProyeccionTransferencia={mesesProyeccionTransferencia}
                mesesProyeccionCompra={mesesProyeccionCompra}
              />
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
