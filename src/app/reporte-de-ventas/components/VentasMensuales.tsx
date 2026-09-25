// 2025 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { exportChartAsPNG } from '../lib/exportUtils';
import { ControlesVentasMensuales } from './mensuales/ControlesVentasMensuales';
import { GraficoVentasMensuales, DatoGraficoMensual } from './mensuales/GraficoVentasMensuales';

interface VentasMensualesProps {
  ventasPorMes: Record<string, { A: number; X: number; AX: number }>;
  cantidadesPorMes: Record<string, { A: number; X: number; AX: number }>;
}

export const VentasMensuales: React.FC<VentasMensualesProps> = ({
  ventasPorMes,
  cantidadesPorMes,
}) => {
  const [metrica, setMetrica] = useState<'importe' | 'cantidad'>('importe');
  const [modoVista, setModoVista] = useState<'acumulado' | 'comparativo'>('acumulado');
  const [mesesSeleccionados, setMesesSeleccionados] = useState<string[]>([]);
  const [mesesConDatos, setMesesConDatos] = useState<string[]>([]);
  const [mostrarVariacion, setMostrarVariacion] = useState<boolean>(false);
  const chartRef = useRef<HTMLDivElement>(null);

  const meses = useMemo(
    () => [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
    ],
    []
  );

  useEffect(() => {
    const mesesDisponibles = meses.filter((mes) => {
      const mesData = ventasPorMes[mes];
      return mesData && (mesData.A > 0 || mesData.X > 0 || mesData.AX > 0);
    });
    setMesesConDatos(mesesDisponibles);
    if (mesesSeleccionados.length === 0 && mesesDisponibles.length > 0) {
      setMesesSeleccionados(mesesDisponibles);
    }
  }, [ventasPorMes, meses, mesesSeleccionados.length]);

  const data: DatoGraficoMensual[] = useMemo(() => {
    const mesesAMostrar = mesesSeleccionados.length > 0 ? mesesSeleccionados : mesesConDatos;

    return mesesAMostrar.map((mes, index) => {
      const mesData = ventasPorMes[mes] || { A: 0, X: 0, AX: 0 };
      const cantidadData = cantidadesPorMes[mes] || { A: 0, X: 0, AX: 0 };

      let varA = 0, varX = 0, varAX = 0;
      let varCantA = 0, varCantX = 0, varCantAX = 0;
      let tieneVariacion = false;

      if (mostrarVariacion && index > 0) {
        const mesAnterior = mesesAMostrar[index - 1];
        const mesDataAnt = ventasPorMes[mesAnterior] || { A: 0, X: 0, AX: 0 };
        const cantidadDataAnt = cantidadesPorMes[mesAnterior] || { A: 0, X: 0, AX: 0 };

        if (mesDataAnt.A > 0) varA = ((mesData.A - mesDataAnt.A) / mesDataAnt.A) * 100;
        if (mesDataAnt.X > 0) varX = ((mesData.X - mesDataAnt.X) / mesDataAnt.X) * 100;
        if (mesDataAnt.AX > 0) varAX = ((mesData.AX - mesDataAnt.AX) / mesDataAnt.AX) * 100;
        if (cantidadDataAnt.A > 0) varCantA = ((cantidadData.A - cantidadDataAnt.A) / cantidadDataAnt.A) * 100;
        if (cantidadDataAnt.X > 0) varCantX = ((cantidadData.X - cantidadDataAnt.X) / cantidadDataAnt.X) * 100;
        if (cantidadDataAnt.AX > 0) varCantAX = ((cantidadData.AX - cantidadDataAnt.AX) / cantidadDataAnt.AX) * 100;
        tieneVariacion = true;
      }

      return {
        mes,
        A: mesData.A,
        X: mesData.X,
        AX: mesData.AX,
        cantidadA: cantidadData.A,
        cantidadX: cantidadData.X,
        cantidadAX: cantidadData.AX,
        varA,
        varX,
        varAX,
        varCantA,
        varCantX,
        varCantAX,
        tieneVariacion,
        ghostValue: 0,
      };
    });
  }, [ventasPorMes, mesesSeleccionados, mesesConDatos, cantidadesPorMes, mostrarVariacion]);

  const defaultBarSize = useMemo(() => {
    const n = mesesSeleccionados.length || mesesConDatos.length || 12;
    if (n <= 2) return 32;
    if (n <= 4) return 28;
    if (n <= 7) return 20;
    return 14;
  }, [mesesSeleccionados.length, mesesConDatos.length]);

  const [barSize, setBarSize] = useState<number>(defaultBarSize);
  const [barSizeTouched, setBarSizeTouched] = useState<boolean>(false);

  useEffect(() => {
    if (!barSizeTouched) {
      setBarSize(defaultBarSize);
    }
  }, [defaultBarSize, barSizeTouched]);

  const chartHeight = useMemo(() => {
    const n = mesesSeleccionados.length || mesesConDatos.length || 12;
    if (n <= 2) return 520;
    if (n <= 4) return 560;
    if (n <= 8) return 620;
    return 700;
  }, [mesesSeleccionados.length, mesesConDatos.length]);

  const handleExport = () => {
    exportChartAsPNG(chartRef, 'ventas-mensuales');
  };

  const colSpanClass =
    (mesesSeleccionados.length || mesesConDatos.length) > 4 ? 'lg:col-span-2' : '';

  return (
    <div
      ref={chartRef}
      className={`rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800 ${colSpanClass}`}
    >
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          Ventas Mensuales
        </h4>
      </div>

      <ControlesVentasMensuales
        handleExport={handleExport}
        meses={meses}
        mesesSeleccionados={mesesSeleccionados}
        setMesesSeleccionados={setMesesSeleccionados}
        mesesConDatos={mesesConDatos}
        metrica={metrica}
        setMetrica={setMetrica}
        barSize={barSize}
        setBarSize={setBarSize}
        setBarSizeTouched={setBarSizeTouched}
        modoVista={modoVista}
        setModoVista={setModoVista}
        mostrarVariacion={mostrarVariacion}
        setMostrarVariacion={setMostrarVariacion}
        dataLength={data.length}
      />

      <GraficoVentasMensuales
        data={data}
        metrica={metrica}
        modoVista={modoVista}
        mostrarVariacion={mostrarVariacion}
        barSize={barSize}
        chartHeight={chartHeight}
      />
    </div>
  );
};
