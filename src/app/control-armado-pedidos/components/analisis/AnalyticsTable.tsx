import React, { useState, useMemo } from 'react';
import { RendimientoEmpleado, RegistroArmadoDocumento } from '../../types/armado';
import { exportarAXLSX } from '../../utils/metricsCalculator';
import { User, FileSpreadsheet, Search, Filter, ArrowUpDown } from 'lucide-react';

interface AnalyticsTableProps {
  rendimiento: RendimientoEmpleado[];
  registros: RegistroArmadoDocumento[];
}

export function AnalyticsTable({ rendimiento, registros }: AnalyticsTableProps) {
  const [busqueda, setBusqueda] = useState('');
  const [filtroArmador, setFiltroArmador] = useState('');
  const [criterioOrden, setCriterioOrden] = useState<'velocidad' | 'pedidos' | 'articulos' | 'irregularidades'>('velocidad');

  const armadoresDisponibles = useMemo(() => {
    return Array.from(new Set(rendimiento.map((r) => r.empleado))).sort();
  }, [rendimiento]);

  const rendimientoFiltrado = useMemo(() => {
    return rendimiento
      .filter((r) => {
        const coincideBusqueda = !busqueda.trim() || r.empleado.toUpperCase().includes(busqueda.trim().toUpperCase());
        const coincideArmador = !filtroArmador || r.empleado === filtroArmador;
        return coincideBusqueda && coincideArmador;
      })
      .sort((a, b) => {
        if (criterioOrden === 'velocidad') return b.velocidadArtHs - a.velocidadArtHs;
        if (criterioOrden === 'pedidos') return b.totalPedidos - a.totalPedidos;
        if (criterioOrden === 'articulos') return b.totalArticulos - a.totalArticulos;
        if (criterioOrden === 'irregularidades') return b.totalIrregularidades - a.totalIrregularidades;
        return 0;
      });
  }, [rendimiento, busqueda, filtroArmador, criterioOrden]);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-800 dark:bg-[#1C1C1E] space-y-4">
      {/* Cabecera y Exportación */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 pb-4 dark:border-gray-800">
        <div>
          <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
            Detalle de Rendimiento por Armador
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Resumen consolidado de efectividad, tiempos y volumen de artículos ({rendimientoFiltrado.length} armadores)
          </p>
        </div>

        <button
          onClick={() => exportarAXLSX(registros)}
          className="flex items-center space-x-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-emerald-700 transition-all"
        >
          <FileSpreadsheet className="h-4 w-4" />
          <span>Exportar a Excel (.xlsx)</span>
        </button>
      </div>

      {/* Panel de Filtros Dedicado e Independiente de la Tabla */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 bg-gray-50/80 p-3 dark:border-gray-800 dark:bg-gray-900/50 text-xs">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* Buscador de Armador */}
          <div className="relative min-w-[200px] flex-1 sm:flex-none">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar armador..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value.toUpperCase())}
              className="w-full rounded-lg border border-gray-300 bg-white pl-8 pr-3 py-1.5 text-xs text-gray-900 focus:outline-none uppercase dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>

          {/* Selector de Armador */}
          <div className="flex items-center space-x-1">
            <Filter className="h-3.5 w-3.5 text-gray-400" />
            <select
              value={filtroArmador}
              onChange={(e) => setFiltroArmador(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs text-gray-900 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <option value="">Todos los armadores</option>
              {armadoresDisponibles.map((emp) => (
                <option key={emp} value={emp}>
                  {emp}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Criterio de Ordenamiento */}
        <div className="flex items-center space-x-2">
          <ArrowUpDown className="h-3.5 w-3.5 text-gray-400" />
          <span className="text-gray-500 dark:text-gray-400 font-medium">Ordenar por:</span>
          <select
            value={criterioOrden}
            onChange={(e) => setCriterioOrden(e.target.value as any)}
            className="rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-blue-600 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-blue-400"
          >
            <option value="velocidad">Mayor Velocidad (Art/hs)</option>
            <option value="pedidos">Más Pedidos Armados</option>
            <option value="articulos">Más Artículos Procesados</option>
            <option value="irregularidades">Más Irregularidades</option>
          </select>
        </div>
      </div>

      {/* Tabla de Rendimiento */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-gray-700 dark:text-gray-300">
          <thead className="border-b bg-gray-50 text-[11px] uppercase tracking-wider text-gray-500 dark:bg-gray-800 dark:text-gray-400">
            <tr>
              <th className="px-4 py-3">Armador</th>
              <th className="px-4 py-3 text-center">Pedidos</th>
              <th className="px-4 py-3 text-center">Artículos</th>
              <th className="px-4 py-3 text-center">Horas Trab.</th>
              <th className="px-4 py-3 text-center">Velocidad (Art/hs)</th>
              <th className="px-4 py-3 text-center">Min / Pedido</th>
              <th className="px-4 py-3 text-center">Irregularidades</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            {rendimientoFiltrado.length > 0 ? (
              rendimientoFiltrado.map((r, idx) => (
                <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                  <td className="flex items-center space-x-2 px-4 py-3 font-semibold text-gray-900 dark:text-gray-100">
                    <User className="h-4 w-4 text-blue-500" />
                    <span>{r.empleado}</span>
                  </td>
                  <td className="px-4 py-3 text-center">{r.totalPedidos}</td>
                  <td className="px-4 py-3 text-center font-medium">{r.totalArticulos}</td>
                  <td className="px-4 py-3 text-center">{r.horasTrabajadas} hs</td>
                  <td className="px-4 py-3 text-center font-bold text-blue-600 dark:text-blue-400">
                    {r.velocidadArtHs} Art/hs
                  </td>
                  <td className="px-4 py-3 text-center">{r.tiempoMedioMin} min</td>
                  <td className="px-4 py-3 text-center">
                    {r.totalIrregularidades > 0 ? (
                      <span className="rounded bg-amber-100 px-2 py-0.5 font-bold text-amber-800 dark:bg-amber-900/50 dark:text-amber-300">
                        {r.totalIrregularidades}
                      </span>
                    ) : (
                      <span className="text-gray-400">0</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                  No se encontraron armadores con los filtros seleccionados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
