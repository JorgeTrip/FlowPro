'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { CategoriaData } from './categoria/types';
import { exportarDatosTablaCategoria } from './categoria/exportadorTablaCategoria';
import { ControlesTablaCategoria } from './categoria/ControlesTablaCategoria';
import { CuerpoTablaCategoria } from './categoria/CuerpoTablaCategoria';

interface TopProductosPorCategoriaTableProps {
  topProductosPorCategoria: CategoriaData[];
  topProductosPorCategoriaImporte: CategoriaData[];
}

export const TopProductosPorCategoriaTable: React.FC<TopProductosPorCategoriaTableProps> = ({
  topProductosPorCategoria,
  topProductosPorCategoriaImporte,
}) => {
  const [filtroMeses, setFiltroMeses] = useState<'todos' | 'conDatos' | 'individual'>('conDatos');
  const [topN, setTopN] = useState<number>(3);
  const [categoriasSeleccionadas, setCategoriasSeleccionadas] = useState<string[]>([]);
  const [ordenAscendente, setOrdenAscendente] = useState<boolean>(false);
  const [mostrarCantidad, setMostrarCantidad] = useState<boolean>(true);
  const [mostrarPorcentajes, setMostrarPorcentajes] = useState<boolean>(true);

  const datosOriginales = mostrarCantidad
    ? topProductosPorCategoria
    : topProductosPorCategoriaImporte;

  const todasLasCategorias = useMemo(() => {
    return Array.from(new Set(datosOriginales.map((item) => item.categoria)));
  }, [datosOriginales]);

  useEffect(() => {
    if (categoriasSeleccionadas.length === 0) {
      setCategoriasSeleccionadas(todasLasCategorias);
    }
  }, [todasLasCategorias, categoriasSeleccionadas.length]);

  const datosProcesados = useMemo(() => {
    let datosFiltrados = datosOriginales.filter((item) =>
      categoriasSeleccionadas.includes(item.categoria)
    );

    datosFiltrados.sort((a, b) => {
      const valorA = mostrarCantidad ? a.cantidadCategoria : a.totalCategoria;
      const valorB = mostrarCantidad ? b.cantidadCategoria : b.totalCategoria;
      return ordenAscendente ? valorA - valorB : valorB - valorA;
    });

    datosFiltrados = datosFiltrados.map((categoria) => ({
      ...categoria,
      productos: categoria.productos.slice(0, topN),
    }));

    return datosFiltrados;
  }, [datosOriginales, categoriasSeleccionadas, ordenAscendente, topN, mostrarCantidad]);

  const totalesGenerales = useMemo(() => {
    return datosProcesados.reduce(
      (acc, categoria) => ({
        cantidad: acc.cantidad + categoria.cantidadCategoria,
        importe: acc.importe + categoria.totalCategoria,
      }),
      { cantidad: 0, importe: 0 }
    );
  }, [datosProcesados]);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0,
    });
  };

  const formatQuantity = (value: number) => {
    return value.toLocaleString('es-AR');
  };

  const calcularPorcentaje = (valor: number, total: number) => {
    return total > 0 ? ((valor / total) * 100).toFixed(1) + '%' : '0%';
  };

  const handleCategoriaToggle = (categoria: string) => {
    setCategoriasSeleccionadas((prev) =>
      prev.includes(categoria) ? prev.filter((c) => c !== categoria) : [...prev, categoria]
    );
  };

  const seleccionarTodasCategorias = () => {
    setCategoriasSeleccionadas(todasLasCategorias);
  };

  const limpiarCategorias = () => {
    setCategoriasSeleccionadas([]);
  };

  const exportarDatos = () => {
    exportarDatosTablaCategoria(
      datosProcesados,
      totalesGenerales,
      mostrarCantidad,
      mostrarPorcentajes
    );
  };

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
      <ControlesTablaCategoria
        filtroMeses={filtroMeses}
        setFiltroMeses={setFiltroMeses}
        topN={topN}
        setTopN={setTopN}
        categoriasSeleccionadas={categoriasSeleccionadas}
        handleCategoriaToggle={handleCategoriaToggle}
        seleccionarTodasCategorias={seleccionarTodasCategorias}
        limpiarCategorias={limpiarCategorias}
        todasLasCategorias={todasLasCategorias}
        ordenAscendente={ordenAscendente}
        setOrdenAscendente={setOrdenAscendente}
        mostrarCantidad={mostrarCantidad}
        setMostrarCantidad={setMostrarCantidad}
        mostrarPorcentajes={mostrarPorcentajes}
        setMostrarPorcentajes={setMostrarPorcentajes}
        onExportar={exportarDatos}
      />

      <CuerpoTablaCategoria
        datosProcesados={datosProcesados}
        totalesGenerales={totalesGenerales}
        mostrarCantidad={mostrarCantidad}
        mostrarPorcentajes={mostrarPorcentajes}
        formatCurrency={formatCurrency}
        formatQuantity={formatQuantity}
        calcularPorcentaje={calcularPorcentaje}
      />
    </div>
  );
};
