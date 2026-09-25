// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import React, { useState, useMemo } from 'react';
import type { RegistroArmadoDocumento } from '../../types/armado';
import {
  calcularDistribucionTareasPorEmpleado,
  calcularConsolidadoEquipo,
} from '../../utils/calcularDistribucionTareas';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { PieChart as PieIcon, Users, User } from 'lucide-react';
import { TarjetasDesgloseTareas } from './TarjetasDesgloseTareas';

interface GraficoDistribucionTareasProps {
  registros: RegistroArmadoDocumento[];
}

export function GraficoDistribucionTareas({ registros }: GraficoDistribucionTareasProps) {
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState<string>('todos');

  const distribuciones = useMemo(() => {
    return calcularDistribucionTareasPorEmpleado(registros);
  }, [registros]);

  const empleadosDisponibles = useMemo(() => {
    return distribuciones.map((d) => d.empleado);
  }, [distribuciones]);

  const datosDistribucion = useMemo(() => {
    if (distribuciones.length === 0) return null;
    if (empleadoSeleccionado !== 'todos') {
      return distribuciones.find((d) => d.empleado === empleadoSeleccionado) || null;
    }
    return calcularConsolidadoEquipo(distribuciones);
  }, [distribuciones, empleadoSeleccionado]);

  if (!datosDistribucion || datosDistribucion.horasTotales === 0) return null;

  const itemsConHoras = datosDistribucion.itemsGrafico.filter((it) => it.value > 0);

  const renderEtiquetaPorcentaje = (props: any) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, payload } = props;
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    const textoP = payload?.porcentajeTexto;
    if (!textoP || textoP === '0%') return null;
    return (
      <text
        x={x}
        y={y}
        fill="#FFFFFF"
        textAnchor="middle"
        dominantBaseline="central"
        className="text-[11px] font-extrabold select-none"
        style={{ filter: 'drop-shadow(0px 1px 2px rgba(0,0,0,0.85))' }}
      >
        {textoP}
      </text>
    );
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-800 dark:bg-[#1C1C1E] space-y-4">
      {/* Encabezado y Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 pb-4 dark:border-gray-800">
        <div className="flex items-center space-x-3">
          <div className="rounded-xl bg-blue-500/10 p-2.5 text-blue-600 dark:bg-blue-400/10 dark:text-blue-400">
            <PieIcon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
              Distribución del Tiempo por Tarea
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Proporción y porcentaje de horas dedicadas a cada tarea
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {empleadoSeleccionado === 'todos' ? <Users className="h-4 w-4 text-blue-500" /> : <User className="h-4 w-4 text-blue-500" />}
          <select
            value={empleadoSeleccionado}
            onChange={(e) => setEmpleadoSeleccionado(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-800 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 cursor-pointer shadow-2xs"
          >
            <option value="todos">Equipo Completo (Consolidado)</option>
            {empleadosDisponibles.map((emp) => (
              <option key={emp} value={emp}>{emp}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Contenido: Donut con Etiquetas y Tarjetas */}
      <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-12">
        <div className="relative h-64 w-full lg:col-span-5 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart key={`pie-chart-${empleadoSeleccionado}`}>
              <Pie
                key={`pie-${empleadoSeleccionado}`}
                data={itemsConHoras}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
                dataKey="value"
                label={renderEtiquetaPorcentaje}
                labelLine={false}
                animationDuration={600}
              >
                {itemsConHoras.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="#1C1C1E" strokeWidth={1.5} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="rounded-xl border border-gray-700 bg-[#1C1C1E] p-3 text-xs text-white shadow-xl">
                        <p className="font-bold flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: data.color }} />
                          {data.name}
                        </p>
                        <p className="text-gray-300 mt-1">{data.value} horas ({data.porcentajeTexto || `${data.porcentaje}%`})</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          <div className="absolute pointer-events-none flex flex-col items-center justify-center text-center">
            <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">Total</span>
            <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{datosDistribucion.horasTotales} hs</span>
          </div>
        </div>

        <TarjetasDesgloseTareas
          horasTotales={datosDistribucion.horasTotales}
          items={datosDistribucion.itemsGrafico}
        />
      </div>
    </div>
  );
}
