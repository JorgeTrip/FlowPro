'use client';

import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { exportarExcelVendedor } from './vendedor/exportadorExcelVendedor';
import {
  procesarDatosTablaVendedor,
  calcularTotalesVendedorComparativo,
} from './vendedor/procesadorDatosVendedor';
import { ControlesTablaVendedor } from './vendedor/ControlesTablaVendedor';
import { CuerpoTablaVendedorAcumulado } from './vendedor/CuerpoTablaVendedorAcumulado';
import { CuerpoTablaVendedorComparativo } from './vendedor/CuerpoTablaVendedorComparativo';
import { FilaVendedorAcumulado, FilaVendedorComparativo } from './vendedor/types';

interface VentasPorVendedorTableProps {
  ventasPorVendedor: { resultado: Record<string, Record<string, { A: number; X: number; AX: number }>> };
  cantidadesPorVendedor: { resultado: Record<string, Record<string, { A: number; X: number; AX: number }>> };
  vendedorDebugLog?: string[];
}

export const VentasPorVendedorTable: React.FC<VentasPorVendedorTableProps> = ({
  ventasPorVendedor,
  cantidadesPorVendedor,
  vendedorDebugLog,
}) => {
  const [mostrarCantidad, setMostrarCantidad] = useState<boolean>(false);
  const [mostrarTotales, setMostrarTotales] = useState<boolean>(true);
  const [ordenAscendente, setOrdenAscendente] = useState<boolean>(false);
  const [vendedoresSeleccionados, setVendedoresSeleccionados] = useState<string[]>([]);
  const [mesesSeleccionados, setMesesSeleccionados] = useState<string[]>([]);
  const [modoVista, setModoVista] = useState<'acumulado' | 'comparativo'>('acumulado');
  const [mostrarVariacion, setMostrarVariacion] = useState<boolean>(true);
  const [copied, setCopied] = useState(false);

  const meses = useMemo(
    () => [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
    ],
    []
  );

  const mesesConDatos = useMemo(() => {
    const months = new Set<string>();
    Object.entries(ventasPorVendedor.resultado).forEach(([mes, vendedores]) => {
      if (Object.values(vendedores).some((v) => v.AX !== 0)) months.add(mes);
    });
    Object.entries(cantidadesPorVendedor.resultado).forEach(([mes, vendedores]) => {
      if (Object.values(vendedores).some((v) => v.AX !== 0)) months.add(mes);
    });
    return Array.from(months);
  }, [ventasPorVendedor, cantidadesPorVendedor]);

  const todosLosVendedores = useMemo(() => {
    const vendedores = new Set<string>();
    Object.entries(ventasPorVendedor.resultado).forEach(([, subvendedores]) => {
      Object.keys(subvendedores).forEach((subvendedor) => {
        vendedores.add(subvendedor || 'Sin vendedor');
      });
    });
    return Array.from(vendedores);
  }, [ventasPorVendedor]);

  const vendedoresInicializados = useRef(false);
  const mesesInicializados = useRef(false);

  useEffect(() => {
    if (!vendedoresInicializados.current && todosLosVendedores.length > 0) {
      setVendedoresSeleccionados(todosLosVendedores);
      vendedoresInicializados.current = true;
    }
  }, [todosLosVendedores]);

  useEffect(() => {
    if (!mesesInicializados.current && mesesConDatos.length > 0) {
      setMesesSeleccionados(mesesConDatos);
      mesesInicializados.current = true;
    }
  }, [mesesConDatos]);

  const handleCopyLog = useCallback(async () => {
    if (!vendedorDebugLog?.length) return;
    try {
      await navigator.clipboard.writeText(vendedorDebugLog.join('\n'));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      console.error('Error al copiar al portapapeles');
    }
  }, [vendedorDebugLog]);

  const datosProcesados = useMemo(() => {
    return procesarDatosTablaVendedor(
      modoVista,
      ventasPorVendedor,
      cantidadesPorVendedor,
      vendedoresSeleccionados,
      mesesSeleccionados,
      mostrarCantidad,
      ordenAscendente
    );
  }, [modoVista, ventasPorVendedor, cantidadesPorVendedor, vendedoresSeleccionados, mesesSeleccionados, mostrarCantidad, ordenAscendente]);

  const totalesAcumulados = useMemo(() => {
    if (modoVista !== 'acumulado') return null;
    return (datosProcesados as FilaVendedorAcumulado[]).reduce(
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
  }, [datosProcesados, modoVista]);

  const totalesComparativos = useMemo(() => {
    if (modoVista !== 'comparativo') return null;
    return calcularTotalesVendedorComparativo(
      datosProcesados as FilaVendedorComparativo[],
      mesesSeleccionados
    );
  }, [datosProcesados, modoVista, mesesSeleccionados]);

  const formatCurrency = (value: number) =>
    value.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });
  const formatQuantity = (value: number) => value.toLocaleString('es-AR');

  const handleExportar = () => {
    exportarExcelVendedor(
      modoVista,
      datosProcesados,
      totalesAcumulados,
      totalesComparativos,
      mesesSeleccionados,
      mostrarCantidad,
      mostrarTotales,
      mostrarVariacion
    );
  };

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
      <ControlesTablaVendedor
        vendedorDebugLog={vendedorDebugLog}
        copied={copied}
        onCopyLog={handleCopyLog}
        meses={meses}
        mesesSeleccionados={mesesSeleccionados}
        setMesesSeleccionados={setMesesSeleccionados}
        mesesConDatos={mesesConDatos}
        todosLosVendedores={todosLosVendedores}
        vendedoresSeleccionados={vendedoresSeleccionados}
        setVendedoresSeleccionados={setVendedoresSeleccionados}
        ordenAscendente={ordenAscendente}
        setOrdenAscendente={setOrdenAscendente}
        mostrarCantidad={mostrarCantidad}
        setMostrarCantidad={setMostrarCantidad}
        mostrarTotales={mostrarTotales}
        setMostrarTotales={setMostrarTotales}
        mostrarVariacion={mostrarVariacion}
        setMostrarVariacion={setMostrarVariacion}
        modoVista={modoVista}
        setModoVista={setModoVista}
        onExportar={handleExportar}
      />

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          {modoVista === 'acumulado' ? (
            <CuerpoTablaVendedorAcumulado
              datos={datosProcesados as FilaVendedorAcumulado[]}
              totales={totalesAcumulados}
              mostrarCantidad={mostrarCantidad}
              mostrarTotales={mostrarTotales}
              formatCurrency={formatCurrency}
              formatQuantity={formatQuantity}
            />
          ) : (
            <CuerpoTablaVendedorComparativo
              datos={datosProcesados as FilaVendedorComparativo[]}
              totales={totalesComparativos}
              mesesSeleccionados={mesesSeleccionados}
              mostrarCantidad={mostrarCantidad}
              mostrarTotales={mostrarTotales}
              mostrarVariacion={mostrarVariacion}
              formatCurrency={formatCurrency}
              formatQuantity={formatQuantity}
            />
          )}
        </table>
      </div>
    </div>
  );
};
