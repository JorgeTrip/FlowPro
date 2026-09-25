'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { exportarDatosTablaRubro } from './rubro/exportadorTablaRubro';
import { procesarDatosTablaRubro } from './rubro/procesadorDatosRubro';
import { ControlesTablaRubro } from './rubro/ControlesTablaRubro';
import { CuerpoTablaRubroAcumulado } from './rubro/CuerpoTablaRubroAcumulado';
import { CuerpoTablaRubroComparativo } from './rubro/CuerpoTablaRubroComparativo';
import { FilaTablaRubroAcumulado } from './rubro/types';

interface VentasPorRubroTableProps {
  ventasPorRubro: Record<string, Record<string, { A: number; X: number }>>;
  cantidadesPorRubro: Record<string, Record<string, { A: number; X: number }>>;
}

export const VentasPorRubroTable: React.FC<VentasPorRubroTableProps> = ({
  ventasPorRubro,
  cantidadesPorRubro,
}) => {
  const [mostrarCantidad, setMostrarCantidad] = useState<boolean>(false);
  const [mostrarTotales, setMostrarTotales] = useState<boolean>(true);
  const [ordenAscendente, setOrdenAscendente] = useState<boolean>(false);
  const [rubrosSeleccionados, setRubrosSeleccionados] = useState<string[]>([]);
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

  const todosLosRubros = useMemo(() => {
    const rubros = new Set<string>();
    Object.entries(ventasPorRubro).forEach(([, subrubros]) => {
      Object.keys(subrubros).forEach((subrubro) => {
        rubros.add(subrubro || 'Sin rubro');
      });
    });
    return Array.from(rubros);
  }, [ventasPorRubro]);

  const mesesConDatos = useMemo(() => {
    const mesesSet = new Set<string>();
    Object.entries(ventasPorRubro).forEach(([mes, rubros]) => {
      if (Object.values(rubros).some((r) => (r.A || 0) > 0 || (r.X || 0) > 0)) mesesSet.add(mes);
    });
    Object.entries(cantidadesPorRubro).forEach(([mes, rubros]) => {
      if (Object.values(rubros).some((r) => (r.A || 0) > 0 || (r.X || 0) > 0)) mesesSet.add(mes);
    });
    const ordenMeses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return Array.from(mesesSet).sort((a, b) => ordenMeses.indexOf(a) - ordenMeses.indexOf(b));
  }, [ventasPorRubro, cantidadesPorRubro]);

  useEffect(() => {
    if (rubrosSeleccionados.length === 0) setRubrosSeleccionados(todosLosRubros);
  }, [todosLosRubros, rubrosSeleccionados.length]);

  useEffect(() => {
    if (mesesSeleccionados.length === 0 && mesesConDatos.length > 0) setMesesSeleccionados(mesesConDatos);
  }, [mesesConDatos, mesesSeleccionados.length]);

  const datosProcesados = useMemo(() => {
    return procesarDatosTablaRubro(
      modoVista,
      ventasPorRubro,
      cantidadesPorRubro,
      rubrosSeleccionados,
      mesesSeleccionados,
      mostrarCantidad,
      ordenAscendente,
      mostrarVariacion
    );
  }, [modoVista, ventasPorRubro, cantidadesPorRubro, rubrosSeleccionados, mesesSeleccionados, mostrarCantidad, ordenAscendente, mostrarVariacion]);

  const totales = useMemo(() => {
    if (modoVista === 'acumulado') {
      return (datosProcesados as FilaTablaRubroAcumulado[]).reduce(
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

  const handleRubroToggle = (rubro: string) => {
    setRubrosSeleccionados((prev) =>
      prev.includes(rubro) ? prev.filter((r) => r !== rubro) : [...prev, rubro]
    );
  };

  const handleExportar = () => {
    exportarDatosTablaRubro(
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
      <ControlesTablaRubro
        modoVista={modoVista}
        setModoVista={setModoVista}
        meses={meses}
        mesesSeleccionados={mesesSeleccionados}
        setMesesSeleccionados={setMesesSeleccionados}
        mesesConDatos={mesesConDatos}
        rubrosSeleccionados={rubrosSeleccionados}
        handleRubroToggle={handleRubroToggle}
        seleccionarTodosRubros={() => setRubrosSeleccionados(todosLosRubros)}
        limpiarRubros={() => setRubrosSeleccionados([])}
        todosLosRubros={todosLosRubros}
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
            <CuerpoTablaRubroAcumulado
              datos={datosProcesados as FilaTablaRubroAcumulado[]}
              totales={totales as any}
              mostrarCantidad={mostrarCantidad}
              mostrarTotales={mostrarTotales}
              formatCurrency={formatCurrency}
              formatQuantity={formatQuantity}
            />
          ) : (
            <CuerpoTablaRubroComparativo
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
