// 2025 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend, Cell, LabelList, Sector } from 'recharts';
import { CameraIcon } from '@heroicons/react/24/outline';
import { exportChartAsPNG } from '../lib/exportUtils';
import { ReporteResultados } from '@/app/lib/reportGenerator';
import { ControlPanel, ControlGroup, SwitchControl, SelectControl, ButtonControl, RangeControl, MultiSelectDropdown } from './shared/ControlPanel';

// --- Helper Functions ---
const formatCurrency = (value: number) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(value);
const formatQuantity = (value: number) => new Intl.NumberFormat('es-AR').format(value);

interface CustomizedLabelProps {
  x?: string | number;
  y?: string | number;
  width?: string | number;
  height?: string | number;
  index?: number;
  value?: string | number;
  metric?: 'importe' | 'cantidad';
}

const CustomizedLabel = (props: CustomizedLabelProps) => {
  const { x = 0, y = 0, width = 0, height = 0, value, metric } = props;

  if (!value) return null;

  const numX = typeof x === 'string' ? parseFloat(x) : x;
  const numY = typeof y === 'string' ? parseFloat(y) : y;
  const numWidth = typeof width === 'string' ? parseFloat(width) : width;
  const numHeight = typeof height === 'string' ? parseFloat(height) : height;

  // Solo mostramos labels si el ancho de la barra es suficientemente grande
  if (numWidth < 20) return null;

  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  const formattedValue = metric === 'importe' ? formatCurrency(numValue) : formatQuantity(numValue);

  return (
    <text x={numX + numWidth + 5} y={numY + numHeight / 2} textAnchor="start" dominantBaseline="middle" className="fill-gray-600 dark:fill-gray-400 text-xs font-medium">
      {formattedValue}
    </text>
  );
};

const COLORS = ['#3b82f6', '#10b981', '#ef4444', '#f97316', '#8b5cf6', '#06b6d4', '#84cc16', '#f59e0b'];

// Paleta de colores para meses en modo comparativo
const monthColors = [
  '#9F9AE3', '#6F6BB8', '#5A57A6', '#4B88A2', '#D34E24', '#C59B76', '#78A1BB', '#283D3B', '#197278', '#EDDDD4', '#C44536', '#772E25'
];

export const VentasPorZona = ({ ventasPorZona, cantidadesPorZona }: {
  ventasPorZona: ReporteResultados['ventasPorZona'];
  cantidadesPorZona: ReporteResultados['cantidadesPorZona'];
}) => {
  const [metric, setMetric] = useState<'importe' | 'cantidad'>('importe');
  const [_activeIndex, setActiveIndex] = useState<number | undefined>(undefined);
  const [distanciaEtiquetas, setDistanciaEtiquetas] = useState<number>(1.8);
  const [modoVista, setModoVista] = useState<'acumulado' | 'comparativo'>('acumulado');
  const [mesesSeleccionados, setMesesSeleccionados] = useState<string[]>([]);
  const [mostrarVariacion, setMostrarVariacion] = useState<boolean>(true);
  const chartRef = useRef<HTMLDivElement>(null);

  const meses = useMemo(() => [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ], []);

  // Obtener meses con datos reales
  const mesesConDatos = useMemo(() => {
    const mesesSet = new Set<string>();

    Object.entries(ventasPorZona).forEach(([mes, zonas]) => {
      const hasData = Object.values(zonas).some(z => z.AX !== 0);
      if (hasData) mesesSet.add(mes);
    });

    Object.entries(cantidadesPorZona).forEach(([mes, zonas]) => {
      const hasData = Object.values(zonas).some(z => z.AX !== 0);
      if (hasData) mesesSet.add(mes);
    });

    return Array.from(mesesSet);
  }, [ventasPorZona, cantidadesPorZona]);

  // Flag para evitar reinicializar tras "Ninguno" — solo se ejecuta la primera vez
  const mesesInicializados = useRef(false);
  useEffect(() => {
    if (!mesesInicializados.current && mesesConDatos.length > 0) {
      setMesesSeleccionados(mesesConDatos);
      mesesInicializados.current = true;
    }
  }, [mesesConDatos]);

  const data = useMemo(() => {
    const sourceData = metric === 'importe' ? ventasPorZona : cantidadesPorZona;

    if (modoVista === 'acumulado') {
      const totalsByZone: Record<string, number> = {};

      // Sumar los valores de AX para cada zona a través de los meses seleccionados
      mesesSeleccionados.forEach(mes => {
        const monthlyData = sourceData[mes];
        if (monthlyData) {
          Object.entries(monthlyData).forEach(([zone, zoneData]) => {
            if (!totalsByZone[zone]) {
              totalsByZone[zone] = 0;
            }
            totalsByZone[zone] += zoneData.AX;
          });
        }
      });

      return Object.entries(totalsByZone)
        .map(([name, value]) => ({ name, value }))
        .filter(item => item.value > 0)
        .sort((a, b) => b.value - a.value)
        .slice(0, 10);
    } else {
      // Modo Comparativo
      const zonasSet = new Set<string>();
      mesesSeleccionados.forEach(mes => {
        const monthlyData = sourceData[mes];
        if (monthlyData) {
          Object.keys(monthlyData).forEach(zona => zonasSet.add(zona));
        }
      });

      const comparativeData = Array.from(zonasSet).map(zona => {
        const zonaData: Record<string, number | string> = { name: zona, total: 0 };

        mesesSeleccionados.forEach(mes => {
          const monthlyData = sourceData[mes];
          const val = monthlyData?.[zona]?.AX || 0;
          zonaData[mes] = val;
          zonaData.total = (zonaData.total as number) + val;
        });

        return zonaData;
      });

      return comparativeData
        .filter(item => (item.total as number) > 0)
        .sort((a, b) => (b.total as number) - (a.total as number))
        .slice(0, 10);
    }
  }, [metric, ventasPorZona, cantidadesPorZona, modoVista, mesesSeleccionados]);

  interface _PieLabelRenderProps {
    cx: number;
    cy: number;
    midAngle?: number;
    innerRadius: number;
    outerRadius: number;
    percent?: number;
  }

  interface CustomTooltipProps {
    active?: boolean;
    payload?: Array<{
      payload?: { name: string; value: number };
      name: string;
      value: number;
      color: string;
    }>;
    label?: string;
  }

  const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      if (modoVista === 'acumulado') {
        const { name, value } = payload[0].payload || { name: '', value: 0 };
        const total = (data as Array<{ name: string; value: number }>).reduce((sum, item) => sum + item.value, 0);
        const percentage = total > 0 ? (value / total * 100).toFixed(2) : '0.00';

        return (
          <div className="p-3 bg-white border border-gray-300 rounded-lg shadow-lg max-w-xs dark:bg-gray-800 dark:border-gray-600">
            <p className="font-bold text-gray-800 dark:text-white mb-2">{name}</p>
            <p className="text-gray-600 dark:text-gray-400">
              {metric === 'importe' ? 'Importe: ' : 'Cantidad: '}
              <strong className="text-gray-800 dark:text-white">{metric === 'importe' ? formatCurrency(value) : formatQuantity(value)}</strong>
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              Porcentaje: <strong className="text-gray-800 dark:text-white">{percentage}%</strong>
            </p>
          </div>
        );
      } else {
        // Modo comparativo
        return (
          <div className="p-3 bg-white border border-gray-300 rounded-lg shadow-lg dark:bg-gray-800 dark:border-gray-600">
            <p className="font-bold text-gray-800 dark:text-white mb-2">{label}</p>
            {payload.map((entry, index) => (
              <p key={index} className="text-sm flex items-center gap-2 mb-1">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></span>
                <span className="font-medium text-gray-700 dark:text-gray-300">{entry.name}:</span>
                <span className="text-gray-800 dark:text-white">{metric === 'importe' ? formatCurrency(entry.value) : formatQuantity(entry.value)}</span>
              </p>
            ))}
          </div>
        );
      }
    }
    return null;
  };

  const onPieEnter = (_: unknown, index: number) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(undefined);
  };

  interface ActiveShapeProps {
    cx: number;
    cy: number;
    innerRadius: number;
    outerRadius: number;
    startAngle: number;
    endAngle: number;
    fill: string;
    payload: { name: string; value: number };
    percent: number;
  }

  const _renderActiveShape = (props: ActiveShapeProps) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent } = props;

    return (
      <g>
        <text x={cx} y={cy} dy={-20} textAnchor="middle" fill={fill} className="font-bold text-sm">
          {payload.name}
        </text>
        <text x={cx} y={cy} dy={0} textAnchor="middle" fill="#333" className="text-sm">
          {metric === 'importe' ? formatCurrency(payload.value) : formatQuantity(payload.value)}
        </text>
        <text x={cx} y={cy} dy={20} textAnchor="middle" fill="#666" className="text-xs">
          {`${(percent * 100).toFixed(2)}%`}
        </text>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 10}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
      </g>
    );
  };

  const formatearNumeroCompacto = (num: number, esMoneda: boolean) => {
    const formatearConSeparadores = (valor: number, decimales: number = 1): string => {
      return valor.toLocaleString('es-AR', {
        minimumFractionDigits: decimales,
        maximumFractionDigits: decimales
      });
    };

    if (num >= 1000000) {
      const valorFormateado = formatearConSeparadores(num / 1000000);
      return esMoneda
        ? `$${valorFormateado} mill.`
        : `${valorFormateado} mill.`;
    } else if (num >= 1000) {
      const valorFormateado = formatearConSeparadores(num, 0);
      return esMoneda
        ? `$${valorFormateado}`
        : `${valorFormateado}`;
    } else {
      const valorFormateado = formatearConSeparadores(num, 0);
      return esMoneda
        ? `$${valorFormateado}`
        : `${valorFormateado}`;
    }
  };

  const handleExport = () => {
    exportChartAsPNG(chartRef, 'ventas-por-zona');
  };

  const chartHeight = useMemo(() => {
    if (modoVista === 'comparativo') {
      const minHeight = 400;
      const itemHeight = 45;
      const calculatedHeight = data.length * itemHeight + 150;
      return Math.max(minHeight, calculatedHeight);
    }
    return 400;
  }, [data.length, modoVista]);

  const maxValue = useMemo(() => {
    if (modoVista === 'acumulado' || data.length === 0) return 0;

    let max = 0;
    data.forEach(item => {
      mesesSeleccionados.forEach(mes => {
        const val = item[mes] as number | undefined;
        if (val && val > max) max = val;
      });
    });
    return max * 1.3;
  }, [data, modoVista, mesesSeleccionados]);

  return (
    <div ref={chartRef} className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Ventas por Zona</h4>
      </div>

      <ControlPanel title="Controles de Visualización">
        <ControlGroup label="Exportar">
          <ButtonControl onClick={handleExport} variant="icon" title="Exportar como PNG">
            <CameraIcon className="w-4 h-4" />
          </ButtonControl>
        </ControlGroup>

        {/* Selector Múltiple de Meses */}
        <ControlGroup label="Meses">
          <MultiSelectDropdown
            label="Meses"
            options={meses}
            selected={mesesSeleccionados}
            onChange={setMesesSeleccionados}
            optionsWithData={mesesConDatos}
          />
        </ControlGroup>

        <div className="border-l border-gray-300 dark:border-gray-600 h-8"></div>

        <ControlGroup label="Métrica">
          <SelectControl
            value={metric}
            onChange={(value) => setMetric(value as 'importe' | 'cantidad')}
            options={[
              { value: 'importe', label: 'Importe' },
              { value: 'cantidad', label: 'Cantidad' }
            ]}
            className="w-32"
          />
        </ControlGroup>

        <ControlGroup label="Vista">
          <SelectControl
            value={modoVista}
            onChange={(value) => setModoVista(value as 'acumulado' | 'comparativo')}
            options={[
              { value: 'acumulado', label: 'Acumulado' },
              { value: 'comparativo', label: 'Comparativo', disabled: mesesSeleccionados.length < 2 }
            ]}
          />
        </ControlGroup>

        {modoVista === 'acumulado' && (
          <RangeControl
            value={distanciaEtiquetas}
            onChange={setDistanciaEtiquetas}
            min={1}
            max={6}
            step={0.5}
            label="Distancia etiquetas"
          />
        )}

        {modoVista === 'comparativo' && (
          <SwitchControl
            checked={mostrarVariacion}
            onChange={setMostrarVariacion}
            label="Variación %"
          />
        )}
      </ControlPanel>
      <div className="w-full">
        <ResponsiveContainer width="100%" height={modoVista === 'acumulado' ? 400 : chartHeight}>
          {modoVista === 'acumulado' ? (
            <PieChart>
              <defs>
                <filter id="shadow3DZona" x="-10%" y="-10%" width="120%" height="130%">
                  <feOffset result="offOut" in="SourceGraphic" dx="0" dy="3" />
                  <feColorMatrix result="matrixOut" in="offOut" type="matrix"
                    values="0.2 0 0 0 0 0 0.2 0 0 0 0 0 0.2 0 0 0 0 0 1 0" />
                  <feGaussianBlur result="blurOut" in="matrixOut" stdDeviation="3" />
                  <feBlend in="SourceGraphic" in2="blurOut" mode="normal" />
                </filter>
              </defs>
              <Pie
                data={data as Array<{ name: string; value: number }>}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                onMouseEnter={onPieEnter}
                onMouseLeave={onPieLeave}
                startAngle={90}
                endAngle={-270}
                filter="url(#shadow3DZona)"
                label={(props) => {
                  const { cx, cy, midAngle, _innerRadius, outerRadius, name, value, index } = props;

                  if (!cx || !cy || midAngle === undefined || !outerRadius || !name || value === undefined || index === undefined) {
                    return null;
                  }

                  const dataArray = data as Array<{ name: string; value: number }>;
                  const total = dataArray.reduce((sum, item) => sum + item.value, 0);
                  const percentage = total > 0 ? (value / total * 100).toFixed(2) : '0.00';

                  const RADIAN = Math.PI / 180;
                  const radius = outerRadius + (20 * distanciaEtiquetas);
                  const x = cx + radius * Math.cos(-midAngle * RADIAN);
                  const y = cy + radius * Math.sin(-midAngle * RADIAN);

                  const textAnchor = x > cx ? 'start' : 'end';
                  const valorFormateado = formatearNumeroCompacto(value, metric === 'importe');

                  return (
                    <g>
                      <line
                        x1={cx + (outerRadius + 5) * Math.cos(-midAngle * RADIAN)}
                        y1={cy + (outerRadius + 5) * Math.sin(-midAngle * RADIAN)}
                        x2={x - (textAnchor === 'start' ? 5 : -5)}
                        y2={y}
                        stroke={COLORS[index % COLORS.length]}
                        strokeWidth={1}
                      />

                      <text
                        x={x}
                        y={y - 10}
                        fill={COLORS[index % COLORS.length]}
                        textAnchor={textAnchor}
                        dominantBaseline="central"
                        className="font-bold text-sm"
                      >
                        {name}: {percentage}%
                      </text>

                      <text
                        x={x}
                        y={y + 10}
                        fill="#666"
                        textAnchor={textAnchor}
                        dominantBaseline="central"
                        className="text-xs"
                      >
                        {metric === 'importe' ? '$: ' : 'Cant: '}{valorFormateado}
                      </text>
                    </g>
                  );
                }}
                labelLine={{
                  stroke: "#666",
                  strokeWidth: 1
                }}
              >
                {(data as Array<{ name: string; value: number }>).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          ) : (
            <BarChart data={data} layout="vertical" margin={{ top: 5, right: 120, left: 20, bottom: 5 }} barGap={2} barCategoryGap="10%">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
              <XAxis type="number" domain={[0, maxValue]} tickFormatter={(value) => metric === 'importe' ? formatCurrency(value as number) : formatQuantity(value as number)} tickLine={false} axisLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
              <YAxis type="category" dataKey="name" width={110} tickLine={false} axisLine={false} tick={{ fill: '#4B5563', fontSize: 12, fontWeight: 500 }} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(156, 163, 175, 0.1)' }} />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />

              {mesesSeleccionados.map((mes, index) => (
                <Bar key={mes} dataKey={mes} name={mes} fill={monthColors[index % monthColors.length]} radius={[0, 4, 4, 0]}>
                  <LabelList dataKey={mes} content={(props) => <CustomizedLabel {...props} metric={metric} />} />
                </Bar>
              ))}
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};
