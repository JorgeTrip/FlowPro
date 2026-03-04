// 2025 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LabelList } from 'recharts';
import { CameraIcon } from '@heroicons/react/24/outline';
import { exportChartAsPNG } from '../lib/exportUtils';
import { ReporteResultados } from '@/app/lib/reportGenerator';

// --- Helper Functions ---
const formatCurrency = (value: number) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(value);
const formatQuantity = (value: number) => new Intl.NumberFormat('es-AR').format(value);
const formatName = (name: string) => name.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');

// Paleta de colores para los diferentes meses en el gráfico comparativo
const monthColors = [
  '#9F9AE3', '#6F6BB8', '#5A57A6', '#4B88A2', '#D34E24', '#C59B76', '#78A1BB', '#283D3B', '#197278', '#EDDDD4', '#C44536', '#772E25'
];

interface VendedorData {
  name: string;
  value?: number;
  importe?: number;
  cantidad?: number;
  porcentaje?: string;
  total?: number;
  // Valores dinámicos por mes (clave = nombre del mes)
  [key: string]: string | number | undefined;
}

interface CustomizedLabelProps {
  x?: string | number;
  y?: string | number;
  width?: string | number;
  height?: string | number;
  index?: number;
  data: VendedorData[];
  dataKey?: string;
  metric?: 'importe' | 'cantidad';
}

const CustomizedLabel = (props: CustomizedLabelProps) => {
  const { x = 0, y = 0, width = 0, height = 0, index, data, dataKey, metric } = props;

  if (index === undefined || !data || !data[index] || !dataKey) {
    return null;
  }

  const numX = typeof x === 'string' ? parseFloat(x) : x;
  const numY = typeof y === 'string' ? parseFloat(y) : y;
  const numWidth = typeof width === 'string' ? parseFloat(width) : width;
  const numHeight = typeof height === 'string' ? parseFloat(height) : height;
  const item = data[index];

  // Solo mostramos labels si el ancho de la barra es suficientemente grande
  if (numWidth < 20) return null;

  const value = item[dataKey] as number | undefined;
  if (!value) return null;

  const formattedValue = metric === 'importe' ? formatCurrency(value) : formatQuantity(value);

  return (
    <text x={numX + numWidth + 5} y={numY + numHeight / 2} textAnchor="start" dominantBaseline="middle" className="fill-gray-600 dark:fill-gray-400 text-xs font-medium">
      {formattedValue}
    </text>
  );
};

export const VentasPorVendedor = ({ ventasPorVendedor, cantidadesPorVendedor }: {
  ventasPorVendedor: ReporteResultados['ventasPorVendedor'];
  cantidadesPorVendedor: ReporteResultados['cantidadesPorVendedor'];
}) => {
  const [metric, setMetric] = useState<'importe' | 'cantidad'>('importe');
  const [mesesSeleccionados, setMesesSeleccionados] = useState<string[]>([]);
  const [modoVista, setModoVista] = useState<'acumulado' | 'comparativo'>('acumulado');
  const chartRef = useRef<HTMLDivElement>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const mesesConDatos = useMemo(() => {
    const meses = new Set<string>();
    Object.keys(ventasPorVendedor.resultado).forEach(mes => meses.add(mes));
    Object.keys(cantidadesPorVendedor.resultado).forEach(mes => meses.add(mes));
    return Array.from(meses);
  }, [ventasPorVendedor, cantidadesPorVendedor]);

  useEffect(() => {
    if (mesesSeleccionados.length === 0 && mesesConDatos.length > 0) {
      setMesesSeleccionados(mesesConDatos);
    }
  }, [mesesConDatos, mesesSeleccionados.length]);

  const toggleMes = (mes: string) => {
    setMesesSeleccionados(prev =>
      prev.includes(mes) ? prev.filter(m => m !== mes) : [...prev, mes]
    );
  };

  const data: VendedorData[] = useMemo(() => {
    if (mesesSeleccionados.length === 0) return [];

    const vendorsSet = new Set<string>();
    mesesSeleccionados.forEach(mes => {
      Object.keys(ventasPorVendedor.resultado[mes] || {}).forEach(v => vendorsSet.add(v));
      Object.keys(cantidadesPorVendedor.resultado[mes] || {}).forEach(v => vendorsSet.add(v));
    });

    const allVendors = Array.from(vendorsSet);

    if (modoVista === 'acumulado') {
      const totalsByVendor: Record<string, { importe: number; cantidad: number }> = {};

      allVendors.forEach(vendor => {
        totalsByVendor[vendor] = { importe: 0, cantidad: 0 };
        mesesSeleccionados.forEach(mes => {
          totalsByVendor[vendor].importe += ventasPorVendedor.resultado[mes]?.[vendor]?.AX || 0;
          totalsByVendor[vendor].cantidad += cantidadesPorVendedor.resultado[mes]?.[vendor]?.AX || 0;
        });
      });

      const totalGeneral = Object.values(totalsByVendor).reduce((sum, data) => sum + (metric === 'importe' ? data.importe : data.cantidad), 0);

      const result: VendedorData[] = Object.entries(totalsByVendor)
        .map(([name, data]) => {
          const value = metric === 'importe' ? data.importe : data.cantidad;
          const item: VendedorData = {
            name: formatName(name),
            value,
            importe: data.importe,
            cantidad: data.cantidad,
            porcentaje: totalGeneral > 0 ? `${((value / totalGeneral) * 100).toFixed(1)}%` : '0%',
          };
          return item;
        })
        .filter(item => (item.value || 0) > 0)
        .sort((a, b) => (b.value || 0) - (a.value || 0))
        .slice(0, 10);
      return result;
    } else {
      // Modo Comparativo
      const comparativeData: VendedorData[] = allVendors.map(vendor => {
        const vendorData: VendedorData = { name: formatName(vendor), total: 0 };
        let totalVal = 0;

        mesesSeleccionados.forEach(mes => {
          const importe = ventasPorVendedor.resultado[mes]?.[vendor]?.AX || 0;
          const cantidad = cantidadesPorVendedor.resultado[mes]?.[vendor]?.AX || 0;
          const val = metric === 'importe' ? importe : cantidad;
          vendorData[mes] = val;
          totalVal += val;
        });

        vendorData.total = totalVal;
        return vendorData;
      });

      return comparativeData
        .filter(item => (item.total || 0) > 0)
        .sort((a, b) => (b.total || 0) - (a.total || 0))
        .slice(0, 10);
    }
  }, [metric, mesesSeleccionados, modoVista, ventasPorVendedor, cantidadesPorVendedor]);

  const maxValue = useMemo(() => {
    if (data.length === 0) return 0;
    if (modoVista === 'acumulado') {
      return Math.max(...data.map(item => item.value || 0)) * 1.3;
    } else {
      let max = 0;
      data.forEach(item => {
        mesesSeleccionados.forEach(mes => {
          const val = item[mes] as number | undefined;
          if (val && val > max) max = val;
        });
      });
      return max * 1.3;
    }
  }, [data, modoVista, mesesSeleccionados]);

  // Calcular altura dinámica basada en la cantidad de elementos
  const chartHeight = useMemo(() => {
    const minHeight = 400;
    const itemHeight = modoVista === 'comparativo' ? 45 : 35; // Más espacio en modo comparativo
    const calculatedHeight = data.length * itemHeight + 150; // +150 para márgenes, ejes y leyenda
    return Math.max(minHeight, calculatedHeight);
  }, [data.length, modoVista]);

  interface TooltipPayloadEntry {
    color: string;
    name: string;
    value: number;
    payload: VendedorData;
  }

  interface CustomTooltipProps {
    active?: boolean;
    payload?: TooltipPayloadEntry[];
    label?: string;
  }

  const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      if (modoVista === 'acumulado') {
        const item = payload[0].payload;
        return (
          <div className="p-3 bg-gray-800 text-white rounded-lg shadow-xl border border-gray-700">
            <p className="font-bold mb-1 text-blue-300">{label}</p>
            <p className="text-sm">{`Porcentaje: ${item.porcentaje}`}</p>
            <p className="text-sm">{`Importe: ${formatCurrency(item.importe ?? 0)}`}</p>
            <p className="text-sm">{`Cantidad: ${formatQuantity(item.cantidad ?? 0)} u.`}</p>
          </div>
        );
      } else {
        return (
          <div className="p-3 bg-gray-800 text-white rounded-lg shadow-xl border border-gray-700">
            <p className="font-bold mb-2 text-blue-300">{label}</p>
            {payload.map((entry, index) => (
              <p key={index} className="text-sm flex items-center gap-2 mb-1">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></span>
                <span className="font-medium">{entry.name}:</span>
                {metric === 'importe' ? formatCurrency(entry.value) : formatQuantity(entry.value)}
              </p>
            ))}
          </div>
        );
      }
    }
    return null;
  };

  const handleExport = () => {
    exportChartAsPNG(chartRef, 'ventas-por-vendedor');
  };

  return (
    <div ref={chartRef} className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4 gap-4">
        <div className="flex-shrink-0">
          <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Top 10 Vendedores
          </h4>
        </div>
        <div className="flex items-center gap-2 flex-wrap chart-controls w-full lg:w-auto justify-end">
          <button
            onClick={handleExport}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
            title="Exportar como PNG"
          >
            <CameraIcon className="w-4 h-4" />
          </button>

          {/* Selector Múltiple de Meses */}
          <div className="relative">
            <button
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-40 p-2.5 text-left dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              Meses ({mesesSeleccionados.length})
            </button>

            {dropdownOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)}></div>
                <div className="absolute top-full right-0 mt-1 w-56 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto">
                  <div className="p-3">
                    <div className="flex gap-2 mb-3">
                      <button
                        onClick={() => setMesesSeleccionados(mesesConDatos)}
                        className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                      >
                        Todos
                      </button>
                      <button
                        onClick={() => setMesesSeleccionados([])}
                        className="text-xs bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600"
                      >
                        Ninguno
                      </button>
                    </div>

                    {mesesConDatos.map(mes => (
                      <label key={mes} className="flex items-center mb-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={mesesSeleccionados.includes(mes)}
                          onChange={() => toggleMes(mes)}
                          className="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-900 dark:text-white">
                          {mes}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          <select
            value={metric}
            onChange={(e) => setMetric(e.target.value as 'importe' | 'cantidad')}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-32 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          >
            <option value="importe">Importe</option>
            <option value="cantidad">Cantidad</option>
          </select>

          <select
            value={modoVista}
            onChange={(e) => setModoVista(e.target.value as 'acumulado' | 'comparativo')}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          >
            <option value="acumulado">Acumulado</option>
            <option value="comparativo" disabled={mesesSeleccionados.length < 2}>Comparativo</option>
          </select>
        </div>
      </div>

      <div className="w-full">
        <ResponsiveContainer width="100%" height={chartHeight}>
          <BarChart data={data} layout="vertical" margin={{ top: 5, right: 120, left: 20, bottom: 5 }} barGap={2} barCategoryGap={modoVista === 'comparativo' ? "10%" : "20%"}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
            <XAxis type="number" domain={[0, maxValue]} tickFormatter={(value) => metric === 'importe' ? formatCurrency(value as number) : formatQuantity(value as number)} tickLine={false} axisLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
            <YAxis type="category" dataKey="name" width={110} tickLine={false} axisLine={false} tick={{ fill: '#4B5563', fontSize: 12, fontWeight: 500 }} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(156, 163, 175, 0.1)' }} />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />

            {modoVista === 'acumulado' ? (
              <Bar dataKey="value" name={metric === 'importe' ? 'Ventas' : 'Cantidad'} fill="#6F6BB8" radius={[0, 4, 4, 0]}>
                <LabelList dataKey="value" content={(props) => <CustomizedLabel {...props} data={data} dataKey="value" metric={metric} />} />
              </Bar>
            ) : (
              mesesSeleccionados.map((mes, index) => (
                <Bar key={mes} dataKey={mes} name={mes} fill={monthColors[index % monthColors.length]} radius={[0, 4, 4, 0]}>
                  <LabelList dataKey={mes} content={(props) => <CustomizedLabel {...props} data={data} dataKey={mes} metric={metric} />} />
                </Bar>
              ))
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
