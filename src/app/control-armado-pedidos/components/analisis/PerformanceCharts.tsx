// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import React, { useState } from 'react';
import { RendimientoEmpleado, RegistroArmadoDocumento } from '../../types/armado';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ReferenceLine,
  LabelList,
} from 'recharts';
import { ModalDetallePlanillasBarra } from './ModalDetallePlanillasBarra';
import { AlertTriangle } from 'lucide-react';

interface PerformanceChartsProps {
  rendimiento: RendimientoEmpleado[];
  promedioEquipo: number;
  registros: RegistroArmadoDocumento[];
  onVerIrregularidades?: (empleado?: string) => void;
  onActualizado?: () => void;
}

export function PerformanceCharts({
  rendimiento,
  promedioEquipo,
  registros,
  onVerIrregularidades,
  onActualizado,
}: PerformanceChartsProps) {
  const [modalDetalle, setModalDetalle] = useState<{
    abierta: boolean;
    titulo: string;
    subtitulo: string;
    planillas: RegistroArmadoDocumento[];
  } | null>(null);

  const dataChart = rendimiento.map((r) => ({
    empleado: r.empleado.split(' ')[0],
    empleadoCompleto: r.empleado,
    velocidad: r.velocidadArtHs,
    pedidos: r.totalPedidos,
    irregularidades: r.totalIrregularidades,
  }));

  const totalIrregularidades = rendimiento.reduce((acc, r) => acc + r.totalIrregularidades, 0);

  const abrirModalEmpleado = (empNombre: string) => {
    const planillasEmp = registros.filter(
      (p) => p.empleadoHeader === empNombre || p.filas?.some((f) => (f.empleadoAsignado || f.nuevoEmpleado) === empNombre)
    );
    setModalDetalle({
      abierta: true,
      titulo: `Planillas de ${empNombre}`,
      subtitulo: `Detalle de planillas verificadas para este armador`,
      planillas: planillasEmp,
    });
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Gráfico 1: Efectividad Individual vs Promedio del Equipo */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-800 dark:bg-[#1C1C1E]">
        <h3 className="mb-4 text-sm font-bold text-gray-900 dark:text-gray-100">
          Efectividad Individual vs Promedio del Equipo (Art / hs)
        </h3>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dataChart} margin={{ top: 20, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="empleado" stroke="#888888" fontSize={11} />
              <YAxis stroke="#888888" fontSize={11} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1C1C1E',
                  borderColor: '#374151',
                  borderRadius: '0.75rem',
                  color: '#fff',
                  fontSize: '11px',
                }}
                formatter={() => ['Haz clic en la barra para obtener más información', '']}
              />
              <ReferenceLine
                y={promedioEquipo}
                label={{ value: `Prom: ${promedioEquipo} Art/hs`, fill: '#3B82F6', fontSize: 11 }}
                stroke="#3B82F6"
                strokeDasharray="4 4"
              />
              <Bar
                dataKey="velocidad"
                name="Artículos / hora"
                fill="#3B82F6"
                radius={[6, 6, 0, 0]}
                className="cursor-pointer hover:opacity-80 transition-opacity"
                onClick={(entry: any) => abrirModalEmpleado(entry.empleadoCompleto || entry.empleado)}
              >
                <LabelList dataKey="velocidad" position="top" formatter={(v: any) => (Number(v) > 0 ? `${v} Art/h` : '')} fill="#3B82F6" fontSize={10} fontWeight="bold" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gráfico 2: Tasa de Irregularidades y Traspasos por Empleado */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-800 dark:bg-[#1C1C1E]">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
            Pedidos Armados e Irregularidades Registradas
          </h3>
          {onVerIrregularidades && totalIrregularidades > 0 && (
            <button
              onClick={() => onVerIrregularidades()}
              className="flex items-center space-x-1 rounded-lg bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-700 hover:bg-amber-500/20 dark:text-amber-300 transition-all"
              title="Ver y re-etiquetar todas las irregularidades"
            >
              <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
              <span>Ver Irregularidades ({totalIrregularidades})</span>
            </button>
          )}
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dataChart} margin={{ top: 20, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="empleado" stroke="#888888" fontSize={11} />
              <YAxis stroke="#888888" fontSize={11} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1C1C1E',
                  borderColor: '#374151',
                  borderRadius: '0.75rem',
                  color: '#fff',
                  fontSize: '11px',
                }}
                formatter={() => ['Haz clic en la barra para obtener más información', '']}
              />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Bar
                dataKey="pedidos"
                name="Total Pedidos"
                fill="#10B981"
                radius={[6, 6, 0, 0]}
                className="cursor-pointer hover:opacity-80 transition-opacity"
                onClick={(entry: any) => abrirModalEmpleado(entry.empleadoCompleto || entry.empleado)}
              >
                <LabelList dataKey="pedidos" position="top" formatter={(v: any) => (Number(v) > 0 ? `${v} ped` : '')} fill="#10B981" fontSize={10} fontWeight="bold" />
              </Bar>
              <Bar
                dataKey="irregularidades"
                name="Irregularidades (Click para revisar)"
                fill="#F59E0B"
                radius={[6, 6, 0, 0]}
                className="cursor-pointer hover:opacity-80 transition-opacity"
                onClick={(entry: any) => {
                  if (entry && onVerIrregularidades) {
                    onVerIrregularidades(entry.empleadoCompleto || entry.empleado);
                  }
                }}
              >
                <LabelList dataKey="irregularidades" position="top" formatter={(v: any) => (Number(v) > 0 ? `${v} irreg` : '')} fill="#F59E0B" fontSize={10} fontWeight="bold" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {modalDetalle?.abierta && (
        <ModalDetallePlanillasBarra
          titulo={modalDetalle.titulo}
          subtitulo={modalDetalle.subtitulo}
          planillas={modalDetalle.planillas}
          onCerrar={() => setModalDetalle(null)}
          onActualizado={onActualizado}
        />
      )}
    </div>
  );
}
