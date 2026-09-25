// 2025 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { exportChartAsPNG } from '../lib/exportUtils';
import { CategoriaData, DatoGraficoCategoria } from './categoria/types';
import { ControlesTopProductosCategoria } from './categoria/ControlesTopProductosCategoria';
import { GraficoTopProductosCategoria } from './categoria/GraficoTopProductosCategoria';

interface TopProductosPorCategoriaProps {
  topProductosPorCategoria: CategoriaData[];
  topProductosPorCategoriaImporte: CategoriaData[];
}

export const TopProductosPorCategoria: React.FC<TopProductosPorCategoriaProps> = ({
  topProductosPorCategoria,
  topProductosPorCategoriaImporte,
}) => {
  const [mostrarCantidad, setMostrarCantidad] = useState<boolean>(false);
  const [topPorCategoria, setTopPorCategoria] = useState<number>(3);
  const [filtroMeses, setFiltroMeses] = useState<'todos' | 'conDatos' | 'individual'>('conDatos');
  const [mesSeleccionado, setMesSeleccionado] = useState<string | null>(null);
  const [mesesConDatos, setMesesConDatos] = useState<string[]>([]);
  const [categoriasSeleccionadas, setCategoriasSeleccionadas] = useState<string[]>([]);
  const [ordenAscendente, setOrdenAscendente] = useState<boolean>(false);
  const [popoverVisible, setPopoverVisible] = useState<boolean>(false);
  const chartRef = useRef<HTMLDivElement>(null);

  const meses = useMemo(
    () => [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
    ],
    []
  );

  useEffect(() => {
    setMesesConDatos(meses);
    if (filtroMeses === 'individual' && !mesSeleccionado && meses.length > 0) {
      setMesSeleccionado(meses[0]);
    }
  }, [filtroMeses, mesSeleccionado, meses]);

  useEffect(() => {
    const dataActual = mostrarCantidad ? topProductosPorCategoria : topProductosPorCategoriaImporte;
    if (dataActual && Array.isArray(dataActual) && dataActual.length > 0 && categoriasSeleccionadas.length === 0) {
      const todasLasCategorias = [...new Set(dataActual.map((item) => item.categoria))];
      setCategoriasSeleccionadas(todasLasCategorias);
    }
  }, [topProductosPorCategoria, topProductosPorCategoriaImporte, mostrarCantidad, categoriasSeleccionadas.length]);

  const data = mostrarCantidad ? topProductosPorCategoria : topProductosPorCategoriaImporte;

  const chartData: DatoGraficoCategoria[] = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];

    let dataFiltrada =
      categoriasSeleccionadas.length > 0
        ? data.filter((item) => categoriasSeleccionadas.includes(item.categoria))
        : data;

    dataFiltrada = [...dataFiltrada].sort((a, b) => {
      const valorA = mostrarCantidad ? a.cantidadCategoria : a.totalCategoria;
      const valorB = mostrarCantidad ? b.cantidadCategoria : b.totalCategoria;
      return ordenAscendente ? valorA - valorB : valorB - valorA;
    });

    const resultado: DatoGraficoCategoria[] = [];

    dataFiltrada.forEach((categoria) => {
      resultado.push({
        name: `${categoria.categoria} (Total)`,
        value: mostrarCantidad ? categoria.cantidadCategoria : categoria.totalCategoria,
        isCategory: true,
        categoria: categoria.categoria,
        articulo: '',
        descripcion: `Total ${categoria.categoria}`,
      });

      const productosAMostrar =
        topPorCategoria === -1
          ? categoria.productos
          : categoria.productos.slice(0, topPorCategoria);

      productosAMostrar.forEach((producto) => {
        resultado.push({
          name: `  ${producto.descripcion}`,
          value: mostrarCantidad ? producto.cantidad : producto.total,
          isCategory: false,
          categoria: categoria.categoria,
          articulo: producto.articulo,
          descripcion: producto.descripcion,
        });
      });
    });

    return resultado;
  }, [data, categoriasSeleccionadas, ordenAscendente, mostrarCantidad, topPorCategoria]);

  if (!data || !Array.isArray(data)) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
          Top Productos por Categoría
        </h4>
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">No hay datos disponibles para mostrar</p>
        </div>
      </div>
    );
  }

  const handleExport = () => {
    exportChartAsPNG(chartRef, 'top-productos-por-categoria');
  };

  return (
    <div
      ref={chartRef}
      className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800"
    >
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          Top Productos por Categoría
        </h4>
      </div>

      <ControlesTopProductosCategoria
        onExport={handleExport}
        filtroMeses={filtroMeses}
        setFiltroMeses={setFiltroMeses}
        meses={meses}
        mesesConDatos={mesesConDatos}
        mesSeleccionado={mesSeleccionado}
        setMesSeleccionado={setMesSeleccionado}
        topPorCategoria={topPorCategoria}
        setTopPorCategoria={setTopPorCategoria}
        mostrarCantidad={mostrarCantidad}
        setMostrarCantidad={setMostrarCantidad}
        ordenAscendente={ordenAscendente}
        setOrdenAscendente={setOrdenAscendente}
        categoriasSeleccionadas={categoriasSeleccionadas}
        setCategoriasSeleccionadas={setCategoriasSeleccionadas}
        popoverVisible={popoverVisible}
        setPopoverVisible={setPopoverVisible}
        data={data}
      />

      <GraficoTopProductosCategoria
        chartData={chartData}
        mostrarCantidad={mostrarCantidad}
        topPorCategoria={topPorCategoria}
      />
    </div>
  );
};
