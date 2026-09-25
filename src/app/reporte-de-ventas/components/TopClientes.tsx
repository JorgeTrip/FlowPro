// © 2025 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from 'recharts';
import { exportChartAsPNG } from '../lib/exportUtils';
import { ReporteResultados } from '@/app/lib/reportGenerator';
import {
  formatCurrency,
  formatQuantity,
  formatName,
  CustomizedBarLabel,
} from './shared/GraficosUtils';
import { ControlesTopClientes } from './tops/ControlesTopClientes';

interface TopClientesProps {
  topClientesMinoristas: ReporteResultados['topClientesMinoristas'];
  topClientesDistribuidores: ReporteResultados['topClientesDistribuidores'];
  topClientesMinoristasPorCantidad: ReporteResultados['topClientesMinoristasPorCantidad'];
  topClientesDistribuidoresPorCantidad: ReporteResultados['topClientesDistribuidoresPorCantidad'];
}

export const TopClientes = ({
  topClientesMinoristas,
  topClientesDistribuidores,
  topClientesMinoristasPorCantidad,
  topClientesDistribuidoresPorCantidad,
}: TopClientesProps) => {
  const [tipoCliente, setTipoCliente] = useState<'Minoristas' | 'Distribuidores'>('Distribuidores');
  const [metric, setMetric] = useState<'importe' | 'cantidad'>('importe');
  const [numClientes, setNumClientes] = useState<number>(10);
  const [orden, setOrden] = useState<'mas' | 'menos'>('mas');
  const [filtroMeses, setFiltroMeses] = useState<'todos' | 'conDatos' | 'individual'>('todos');
  const [mesSeleccionado, setMesSeleccionado] = useState<string | null>(null);
  const [mesesConDatos, setMesesConDatos] = useState<string[]>([]);
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
    if (filtroMeses === 'individual' && !mesSeleccionado) {
      setMesSeleccionado(meses[0]);
    }
  }, [filtroMeses, mesSeleccionado, meses]);

  const data = useMemo(() => {
    let sourceData;
    if (tipoCliente === 'Distribuidores') {
      sourceData = metric === 'importe' ? topClientesDistribuidores : topClientesDistribuidoresPorCantidad;
    } else {
      sourceData = metric === 'importe' ? topClientesMinoristas : topClientesMinoristasPorCantidad;
    }

    let processedData = sourceData.map((item: { cliente: string; total: number }) => ({
      name: formatName(item.cliente),
      value: item.total,
    }));

    if (orden === 'menos') {
      processedData = processedData.sort((a, b) => a.value - b.value);
    } else {
      processedData = processedData.sort((a, b) => b.value - a.value);
    }

    return processedData.slice(0, numClientes);
  }, [
    tipoCliente,
    metric,
    numClientes,
    orden,
    topClientesDistribuidores,
    topClientesDistribuidoresPorCantidad,
    topClientesMinoristas,
    topClientesMinoristasPorCantidad,
  ]);

  const maxValue = useMemo(() => {
    if (data.length === 0) return 0;
    return Math.max(...data.map((item: { value: number }) => item.value)) * 1.2;
  }, [data]);

  const chartHeight = useMemo(() => {
    const minHeight = 400;
    const itemHeight = 35;
    const calculatedHeight = data.length * itemHeight + 100;
    return Math.max(minHeight, calculatedHeight);
  }, [data.length]);

  const handleExport = () => {
    exportChartAsPNG(chartRef, 'top-clientes');
  };

  return (
    <div
      ref={chartRef}
      className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800"
    >
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Top Clientes</h4>
      </div>

      <ControlesTopClientes
        tipoCliente={tipoCliente}
        setTipoCliente={setTipoCliente}
        numClientes={numClientes}
        setNumClientes={setNumClientes}
        metric={metric}
        setMetric={setMetric}
        orden={orden}
        setOrden={setOrden}
        filtroMeses={filtroMeses}
        setFiltroMeses={setFiltroMeses}
        mesSeleccionado={mesSeleccionado}
        setMesSeleccionado={setMesSeleccionado}
        mesesConDatos={mesesConDatos}
        meses={meses}
        handleExport={handleExport}
      />

      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 100, left: 20, bottom: 5 }}>
          <defs>
            <linearGradient id="colorBarCliente" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#82ca9d" stopOpacity={0.8} />
              <stop offset="100%" stopColor="#8884d8" stopOpacity={0.9} />
            </linearGradient>
            <filter id="shadowClientes" x="-10%" y="-10%" width="120%" height="130%">
              <feOffset result="offOut" in="SourceGraphic" dx="3" dy="3" />
              <feColorMatrix
                result="matrixOut"
                in="offOut"
                type="matrix"
                values="0.2 0 0 0 0 0 0.2 0 0 0 0 0 0.2 0 0 0 0 0 1 0"
              />
              <feGaussianBlur result="blurOut" in="matrixOut" stdDeviation="3" />
              <feBlend in="SourceGraphic" in2="blurOut" mode="normal" />
            </filter>
          </defs>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            type="number"
            domain={[0, maxValue]}
            tickFormatter={(value) =>
              metric === 'importe' ? formatCurrency(value as number, true) : formatQuantity(value as number, true)
            }
          />
          <YAxis type="category" dataKey="name" width={150} tick={{ fontSize: 12 }} />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="p-2 bg-gray-700 text-white rounded-md border border-gray-600 shadow-lg">
                    <p className="font-bold">{label}</p>
                    <p>{`${metric === 'importe' ? 'Importe' : 'Cantidad'}: ${
                      metric === 'importe' ? formatCurrency(payload[0].value as number) : formatQuantity(payload[0].value as number)
                    }`}</p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar
            dataKey="value"
            name={metric === 'importe' ? 'Ventas' : 'Cantidad'}
            fill="url(#colorBarCliente)"
            radius={[0, 4, 4, 0]}
            stroke="#6eb58a"
            strokeWidth={1}
            filter="url(#shadowClientes)"
          >
            <LabelList
              dataKey="value"
              content={(props) => <CustomizedBarLabel {...props} metric={metric} />}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
