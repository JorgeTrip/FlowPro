'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { exportarDatosTablaZona } from './zona/exportadorTablaZona';
import { procesarDatosTablaZona } from './zona/procesadorDatosZona';
import { ControlesTablaZona } from './zona/ControlesTablaZona';
import { CuerpoTablaZonaAcumulado } from './zona/CuerpoTablaZonaAcumulado';
import { CuerpoTablaZonaComparativo } from './zona/CuerpoTablaZonaComparativo';
import { FilaTablaZonaAcumulado } from './zona/types';

interface VentasPorZonaTableProps {
  ventasPorZona: Record<string, Record<string, { A: number; X: number }>>;
  cantidadesPorZona: Record<string, Record<string, { A: number; X: number }>>;
}

export const VentasPorZonaTable: React.FC<VentasPorZonaTableProps> = ({
  ventasPorZona,
  cantidadesPorZona,
}) => {
  const [mostrarCantidad, setMostrarCantidad] = useState<boolean>(false);
  const [mostrarTotales, setMostrarTotales] = useState<boolean>(true);
  const [ordenAscendente, setOrdenAscendente] = useState<boolean>(false);
  const [zonasSeleccionadas, setZonasSeleccionadas] = useState<string[]>([]);
  const [modoVista, setModoVista] = useState<'acumulado' | 'comparativo'>('acumulado');
  const [mostrarVariacion, setMostrarVariacion] = useState<boolean>(true);
  const [mesesSeleccionados, setMesesSeleccionados] = useState<string[]>([]);

  const meses = useMemo(
    () => [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
    ],
    []
  );

  const todasLasZonas = useMemo(() => {
    const zonas = new Set<string>();
    Object.entries(ventasPorZona).forEach(([, subzonas]) => {
      Object.keys(subzonas).forEach((subzona) => {
        zonas.add(subzona || 'Sin zona');
      });
    });
    return Array.from(zonas);
  }, [ventasPorZona]);

  const mesesConDatos = useMemo(() => {
    const mesesSet = new Set<string>();
    Object.entries(ventasPorZona).forEach(([mes, zonas]) => {
      if (Object.values(zonas).some((r) => (r.A || 0) > 0 || (r.X || 0) > 0)) mesesSet.add(mes);
    });
    Object.entries(cantidadesPorZona).forEach(([mes, zonas]) => {
      if (Object.values(zonas).some((r) => (r.A || 0) > 0 || (r.X || 0) > 0)) mesesSet.add(mes);
    });
    const ordenMeses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return Array.from(mesesSet).sort((a, b) => ordenMeses.indexOf(a) - ordenMeses.indexOf(b));
  }, [ventasPorZona, cantidadesPorZona]);

  useEffect(() => {
    if (zonasSeleccionadas.length === 0) setZonasSeleccionadas(todasLasZonas);
  }, [todasLasZonas, zonasSeleccionadas.length]);

  useEffect(() => {
    if (mesesSeleccionados.length === 0 && mesesConDatos.length > 0) setMesesSeleccionados(mesesConDatos);
  }, [mesesConDatos, mesesSeleccionados.length]);

  const datosProcesados = useMemo(() => {
    return procesarDatosTablaZona(
      modoVista,
      ventasPorZona,
      cantidadesPorZona,
      zonasSeleccionadas,
      mesesSeleccionados,
      mostrarCantidad,
      ordenAscendente,
      mostrarVariacion
    );
  }, [modoVista, ventasPorZona, cantidadesPorZona, zonasSeleccionadas, mesesSeleccionados, mostrarCantidad, ordenAscendente, mostrarVariacion]);

  const totales = useMemo(() => {
    if (modoVista === 'acumulado') {
      return (datosProcesados as FilaTablaZonaAcumulado[]).reduce(
        (acc, item) => ({
          importeA: acc.importeA + item.importeA,
          importeX: acc.importeX + item.importeX,
          cantidadA: acc.cantidadA + item.cantidadA,
          cantidadX: acc.cantidadX + item.cantidadX,
          total: acc.total + item.total,
          totalCantidad: acc.totalCantidad + item.totalCantidad,
        }),
        { importeA: 0, importeX: 0, cantidadA: 0, cantidadX: 0, total: 0, totalCantidad: 0 }
      );
    } else {
      const totalesMeses: Record<string, number> = {};
      let granTotal = 0;
      mesesSeleccionados.forEach((mes) => {
        totalesMeses[mes] = (datosProcesados as any[]).reduce(
          (sum, item) => sum + (item.meses[mes] || 0),
          0
        );
        granTotal += totalesMeses[mes];
      });
      return { totalesMeses, granTotal };
    }
  }, [datosProcesados, modoVista, mesesSeleccionados]);

  const formatCurrency = (value: number) =>
    value.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });
  const formatQuantity = (value: number) => value.toLocaleString('es-AR');

  const handleZonaToggle = (zona: string) => {
    setZonasSeleccionadas((prev) =>
      prev.includes(zona) ? prev.filter((z) => z !== zona) : [...prev, zona]
    );
  };

  const handleExportar = () => {
    exportarDatosTablaZona(
      modoVista,
      datosProcesados,
      totales,
      mesesSeleccionados,
      mostrarCantidad,
      mostrarTotales,
      mostrarVariacion
    );
  };

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
      <ControlesTablaZona
        modoVista={modoVista}
        setModoVista={setModoVista}
        meses={meses}
        mesesSeleccionados={mesesSeleccionados}
        setMesesSeleccionados={setMesesSeleccionados}
        mesesConDatos={mesesConDatos}
        zonasSeleccionadas={zonasSeleccionadas}
        handleZonaToggle={handleZonaToggle}
        seleccionarTodasZonas={() => setZonasSeleccionadas(todasLasZonas)}
        limpiarZonas={() => setZonasSeleccionadas([])}
        todasLasZonas={todasLasZonas}
        ordenAscendente={ordenAscendente}
        setOrdenAscendente={setOrdenAscendente}
        mostrarCantidad={mostrarCantidad}
        setMostrarCantidad={setMostrarCantidad}
        mostrarTotales={mostrarTotales}
        setMostrarTotales={setMostrarTotales}
        mostrarVariacion={mostrarVariacion}
        setMostrarVariacion={setMostrarVariacion}
        onExportar={handleExportar}
      />

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          {modoVista === 'acumulado' ? (
            <CuerpoTablaZonaAcumulado
              datos={datosProcesados as FilaTablaZonaAcumulado[]}
              totales={totales as any}
              mostrarCantidad={mostrarCantidad}
              mostrarTotales={mostrarTotales}
              formatCurrency={formatCurrency}
              formatQuantity={formatQuantity}
            />
          ) : (
            <CuerpoTablaZonaComparativo
              datos={datosProcesados as any[]}
              totales={totales as any}
              mesesSeleccionados={mesesSeleccionados}
              mostrarVariacion={mostrarVariacion}
              mostrarCantidad={mostrarCantidad}
              mostrarTotales={mostrarTotales}
              formatCurrency={formatCurrency}
              formatQuantity={formatQuantity}
            />
          )}
        </table>
      </div>
    </div>
  );
};
