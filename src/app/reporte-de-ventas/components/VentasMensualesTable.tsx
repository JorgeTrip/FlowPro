'use client';

import React, { useState, useMemo } from 'react';
import {
  exportarDatosTablaMensual,
  FilaTablaMensual,
  TotalesTablaMensual,
} from './mensuales/exportadorTablaMensual';
import { ControlesTablaMensual } from './mensuales/ControlesTablaMensual';
import { CuerpoTablaMensual } from './mensuales/CuerpoTablaMensual';

interface VentasMensualesTableProps {
  ventasPorMes: Record<string, { A: number; X: number }>;
  cantidadesPorMes: Record<string, { A: number; X: number }>;
}

export const VentasMensualesTable: React.FC<VentasMensualesTableProps> = ({
  ventasPorMes,
  cantidadesPorMes,
}) => {
  const [filtroMeses, setFiltroMeses] = useState<'todos' | 'conDatos' | 'seleccionados'>('conDatos');
  const [mesesSeleccionados, setMesesSeleccionados] = useState<string[]>([]);
  const [mostrarCantidad, setMostrarCantidad] = useState<boolean>(false);
  const [mostrarTotales, setMostrarTotales] = useState<boolean>(true);
  const [mostrarVariacion, setMostrarVariacion] = useState<boolean>(false);

  const meses = useMemo(
    () => [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
    ],
    []
  );

  const mesesConDatos = useMemo(() => {
    return meses.filter((mes) => {
      const ventas = ventasPorMes[mes];
      const cantidades = cantidadesPorMes[mes];
      return (
        (ventas?.A || 0) > 0 ||
        (ventas?.X || 0) > 0 ||
        (cantidades?.A || 0) > 0 ||
        (cantidades?.X || 0) > 0
      );
    });
  }, [ventasPorMes, cantidadesPorMes, meses]);

  const datosFiltrados: FilaTablaMensual[] = useMemo(() => {
    let mesesAMostrar: string[] = [];

    switch (filtroMeses) {
      case 'todos':
        mesesAMostrar = meses;
        break;
      case 'conDatos':
        mesesAMostrar = mesesConDatos;
        break;
      case 'seleccionados':
        mesesAMostrar = mesesSeleccionados.length > 0 ? mesesSeleccionados : mesesConDatos;
        break;
    }

    return mesesAMostrar.map((mes, index) => {
      const importeA = ventasPorMes[mes]?.A || 0;
      const importeX = ventasPorMes[mes]?.X || 0;
      const cantidadA = cantidadesPorMes[mes]?.A || 0;
      const cantidadX = cantidadesPorMes[mes]?.X || 0;
      const total = importeA + importeX;
      const totalCantidad = cantidadA + cantidadX;

      let varImporteA = 0, varImporteX = 0, varTotal = 0;
      let varCantidadA = 0, varCantidadX = 0, varTotalCantidad = 0;
      let tieneVariacion = false;

      if (index > 0) {
        const mesAnterior = mesesAMostrar[index - 1];
        const importeAAnt = ventasPorMes[mesAnterior]?.A || 0;
        const importeXAnt = ventasPorMes[mesAnterior]?.X || 0;
        const cantidadAAnt = cantidadesPorMes[mesAnterior]?.A || 0;
        const cantidadXAnt = cantidadesPorMes[mesAnterior]?.X || 0;
        const totalAnt = importeAAnt + importeXAnt;
        const totalCantidadAnt = cantidadAAnt + cantidadXAnt;

        if (importeAAnt > 0) varImporteA = ((importeA - importeAAnt) / importeAAnt) * 100;
        if (importeXAnt > 0) varImporteX = ((importeX - importeXAnt) / importeXAnt) * 100;
        if (totalAnt > 0) varTotal = ((total - totalAnt) / totalAnt) * 100;
        if (cantidadAAnt > 0) varCantidadA = ((cantidadA - cantidadAAnt) / cantidadAAnt) * 100;
        if (cantidadXAnt > 0) varCantidadX = ((cantidadX - cantidadXAnt) / cantidadXAnt) * 100;
        if (totalCantidadAnt > 0) varTotalCantidad = ((totalCantidad - totalCantidadAnt) / totalCantidadAnt) * 100;
        tieneVariacion = true;
      }

      return {
        mes,
        importeA,
        importeX,
        cantidadA,
        cantidadX,
        total,
        totalCantidad,
        varImporteA,
        varImporteX,
        varTotal,
        varCantidadA,
        varCantidadX,
        varTotalCantidad,
        tieneVariacion,
      };
    });
  }, [filtroMeses, mesesSeleccionados, mesesConDatos, ventasPorMes, cantidadesPorMes, meses]);

  const totales: TotalesTablaMensual = useMemo(() => {
    return datosFiltrados.reduce(
      (acc, item) => ({
        importeA: acc.importeA + item.importeA,
        importeX: acc.importeX + item.importeX,
        cantidadA: acc.cantidadA + item.cantidadA,
        cantidadX: acc.cantidadX + item.cantidadX,
        total: acc.total + item.total,
        totalCantidad: acc.totalCantidad + item.totalCantidad,
      }),
      {
        importeA: 0,
        importeX: 0,
        cantidadA: 0,
        cantidadX: 0,
        total: 0,
        totalCantidad: 0,
      }
    );
  }, [datosFiltrados]);

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

  const exportarDatos = () => {
    exportarDatosTablaMensual(
      datosFiltrados,
      totales,
      mostrarCantidad,
      mostrarVariacion,
      mostrarTotales
    );
  };

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
      <ControlesTablaMensual
        filtroMeses={filtroMeses}
        setFiltroMeses={setFiltroMeses}
        mesesSeleccionados={mesesSeleccionados}
        setMesesSeleccionados={setMesesSeleccionados}
        mesesConDatos={mesesConDatos}
        mostrarCantidad={mostrarCantidad}
        setMostrarCantidad={setMostrarCantidad}
        mostrarTotales={mostrarTotales}
        setMostrarTotales={setMostrarTotales}
        mostrarVariacion={mostrarVariacion}
        setMostrarVariacion={setMostrarVariacion}
        onExportar={exportarDatos}
      />

      <CuerpoTablaMensual
        datosFiltrados={datosFiltrados}
        totales={totales}
        mostrarCantidad={mostrarCantidad}
        mostrarVariacion={mostrarVariacion}
        mostrarTotales={mostrarTotales}
        formatCurrency={formatCurrency}
        formatQuantity={formatQuantity}
      />
    </div>
  );
};
