// 2025 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import React, { useState, useMemo, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CameraIcon } from '@heroicons/react/24/outline';
import { exportChartAsPNG } from '../lib/exportUtils';
import { LabelList as RechartsLabelList } from 'recharts';
import { ReporteResultados } from '@/app/lib/reportGenerator';
import { ControlPanel, ControlGroup, SelectControl, SwitchControl, ButtonControl } from './shared/ControlPanel';

// --- Helper Functions ---
const formatCurrency = (value: number) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(value);
const formatQuantity = (value: number) => new Intl.NumberFormat('es-AR').format(value);
const formatName = (name: string) => name.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');

interface CustomizedLabelProps {
    x?: string | number;
    y?: string | number;
    width?: string | number;
    value?: string | number;
    metric: 'importe' | 'cantidad';
}

const CustomizedLabel = (props: CustomizedLabelProps) => {
    const { x = 0, y = 0, width = 0, value = 0, metric } = props;

    const numX = typeof x === 'string' ? parseFloat(x) : x;
    const numY = typeof y === 'string' ? parseFloat(y) : y;
    const numWidth = typeof width === 'string' ? parseFloat(width) : width;
    const numValue = typeof value === 'string' ? parseFloat(value) : value;

    if (numValue === undefined) return null;

    // Formatear números de forma compacta
    const formatearNumeroCompacto = (num: number, esMoneda: boolean) => {
        if (num >= 1000000) {
            const valorFormateado = (num / 1000000).toLocaleString('es-AR', {
                minimumFractionDigits: 1,
                maximumFractionDigits: 1
            });
            return esMoneda ? `$${valorFormateado} mill.` : `${valorFormateado} mill.`;
        } else if (num >= 1000) {
            const valorFormateado = num.toLocaleString('es-AR', { maximumFractionDigits: 0 });
            return esMoneda ? `$${valorFormateado}` : `${valorFormateado}`;
        } else {
            const valorFormateado = num.toLocaleString('es-AR', { maximumFractionDigits: 0 });
            return esMoneda ? `$${valorFormateado}` : `${valorFormateado}`;
        }
    };

    const formattedValue = formatearNumeroCompacto(numValue, metric === 'importe');

    return (
        <text x={numX + numWidth + 8} y={numY + 12} textAnchor="start" dominantBaseline="middle" className="fill-gray-600 dark:fill-gray-400 text-xs font-medium">
            {formattedValue}
        </text>
    );
};


interface TopProductosComponentProps {
    topProductosMasVendidos: ReporteResultados['topProductosMasVendidos'];
    topProductosMasVendidosPorImporte: ReporteResultados['topProductosMasVendidosPorImporte'];
    topProductosMenosVendidos: ReporteResultados['topProductosMenosVendidos'];
}

export const TopProductos = ({
    topProductosMasVendidos,
    topProductosMasVendidosPorImporte,
    topProductosMenosVendidos,
}: TopProductosComponentProps) => {
    const [tipo, setTipo] = useState<'mas' | 'menos'>('mas');
    const [metric, setMetric] = useState<'importe' | 'cantidad'>('cantidad');
    const [numProductos, setNumProductos] = useState<number>(10);
    const [excluirAjustes, setExcluirAjustes] = useState<boolean>(false);
    const chartRef = useRef<HTMLDivElement>(null);

    // Función para determinar si un código de artículo debe excluirse
    const debeExcluirProducto = (articulo: string): boolean => {
        const cod = articulo.trim().toUpperCase();
        if (cod === '50AJU003') return true;
        if (cod.endsWith('G') || cod.endsWith('C') || cod.endsWith('M')) return true;
        return false;
    };

    const data = useMemo(() => {
        let sourceData;
        if (tipo === 'mas') {
            sourceData = metric === 'importe' ? topProductosMasVendidosPorImporte : topProductosMasVendidos;
        } else {
            sourceData = topProductosMenosVendidos;
        }

        console.log('🔍 TopProductos - sourceData:', sourceData);
        console.log('🔍 TopProductos - tipo:', tipo, 'metric:', metric);

        // Aplicar filtro de productos si está activo
        const filteredData = excluirAjustes
            ? sourceData.filter((item: { articulo: string }) => !debeExcluirProducto(item.articulo))
            : sourceData;

        // Ordenar datos si es necesario (para asegurar el top correcto)
        // Nota: sourceData ya viene ordenado, pero al filtrar podríamos querer re-validar
        // Para "menos vendidos", sourceData viene ordenado ascendente (menor a mayor)
        // Para "más vendidos", sourceData viene ordenado descendente (mayor a menor)
        
        return filteredData
            .slice(0, numProductos)
            .map((item: { articulo: string; descripcion: string; total?: number; cantidad?: number }) => {
                // Usar artículo como fallback si descripción está vacía
                const displayName = item.descripcion && item.descripcion.trim() ?
                    formatName(item.descripcion) :
                    item.articulo;

                return {
                    name: displayName,
                    value: metric === 'importe' ? (item.total || 0) : (item.cantidad || 0),
                };
            });

    }, [tipo, metric, numProductos, excluirAjustes, topProductosMasVendidos, topProductosMasVendidosPorImporte, topProductosMenosVendidos]);

    const maxValue = useMemo(() => {
        if (data.length === 0) return 0;
        return Math.max(...data.map((item: { value: number }) => item.value)) * 1.2;
    }, [data]);

    interface TooltipProps {
        active?: boolean;
        payload?: Array<{ value: number }>;
        label?: string;
    }

    const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
        if (active && payload && payload.length) {
            return (
                <div className="p-2 bg-gray-700 text-white rounded-md border border-gray-600 shadow-lg">
                    <p className="font-bold">{label}</p>
                    <p>{`${metric === 'importe' ? 'Importe' : 'Cantidad'}: ${metric === 'importe' ? formatCurrency(payload[0].value) : formatQuantity(payload[0].value)}`}</p>
                </div>
            );
        }
        return null;
    };

    // Calcular altura dinámica basada en la cantidad de elementos
    const chartHeight = useMemo(() => {
        const minHeight = 400;
        const itemHeight = 35; // Altura por cada barra
        const calculatedHeight = data.length * itemHeight + 100; // +100 para márgenes y ejes
        return Math.max(minHeight, calculatedHeight);
    }, [data.length]);

    const handleExport = () => {
        exportChartAsPNG(chartRef, 'top-productos');
    };

    return (
        <div ref={chartRef} className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Top Productos</h4>
            </div>

            <ControlPanel title="Controles de Visualización">
                <ControlGroup label="Exportar">
                    <ButtonControl onClick={handleExport} variant="icon" title="Exportar como PNG">
                        <CameraIcon className="w-4 h-4" />
                    </ButtonControl>
                </ControlGroup>

                <ControlGroup label="Tipo">
                    <SelectControl
                        value={tipo}
                        onChange={(value) => setTipo(value as 'mas' | 'menos')}
                        options={[
                            { value: 'mas', label: 'Más Vendidos' },
                            { value: 'menos', label: 'Menos Vendidos' }
                        ]}
                        className="w-40"
                    />
                </ControlGroup>

                <ControlGroup label="Métrica">
                    <SelectControl
                        value={metric}
                        onChange={(value) => setMetric(value as 'importe' | 'cantidad')}
                        options={[
                            { value: 'cantidad', label: 'Cantidad' },
                            { value: 'importe', label: 'Importe' }
                        ]}
                        className="w-32"
                    />
                </ControlGroup>

                <ControlGroup label="Cantidad">
                    <SelectControl
                        value={String(numProductos)}
                        onChange={(value) => setNumProductos(Number(value))}
                        options={[
                            { value: '5', label: 'Top 5' },
                            { value: '10', label: 'Top 10' },
                            { value: '15', label: 'Top 15' },
                            { value: '20', label: 'Top 20' }
                        ]}
                        className="w-28"
                    />
                </ControlGroup>

                <div className="border-l border-gray-300 dark:border-gray-600 h-8"></div>

                <SwitchControl
                    checked={excluirAjustes}
                    onChange={setExcluirAjustes}
                    label="Excluir ajustes"
                />
            </ControlPanel>
            <ResponsiveContainer width="100%" height={chartHeight}>
                <BarChart data={data} layout="vertical" margin={{ top: 5, right: 120, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                        type="number"
                        domain={[0, maxValue]}
                        tickFormatter={(value) => {
                            if (metric === 'importe') {
                                if (value >= 1000000) {
                                    const valorFormateado = (value / 1000000).toLocaleString('es-AR', {
                                        minimumFractionDigits: 1,
                                        maximumFractionDigits: 1
                                    });
                                    return `$${valorFormateado} mill.`;
                                } else {
                                    return `$${value.toLocaleString('es-AR', { maximumFractionDigits: 0 })}`;
                                }
                            } else {
                                return value.toLocaleString('es-AR', { maximumFractionDigits: 0 });
                            }
                        }}
                    />
                    <YAxis type="category" dataKey="name" width={150} tick={{ fontSize: 12 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <defs>
                        <linearGradient id="colorBarProducto" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#98e3b5" stopOpacity={1} />
                            <stop offset="75%" stopColor="#82ca9d" stopOpacity={1} />
                            <stop offset="100%" stopColor="#6eb58a" stopOpacity={1} />
                        </linearGradient>
                        <filter id="shadowProductos" x="-10%" y="-10%" width="120%" height="130%">
                            <feOffset result="offOut" in="SourceGraphic" dx="3" dy="3" />
                            <feColorMatrix result="matrixOut" in="offOut" type="matrix"
                                values="0.2 0 0 0 0 0 0.2 0 0 0 0 0 0.2 0 0 0 0 0 1 0" />
                            <feGaussianBlur result="blurOut" in="matrixOut" stdDeviation="3" />
                            <feBlend in="SourceGraphic" in2="blurOut" mode="normal" />
                        </filter>
                    </defs>
                    <Bar
                        dataKey="value"
                        name={metric === 'importe' ? 'Ventas' : 'Cantidad'}
                        fill="url(#colorBarProducto)"
                        stroke="#6eb58a"
                        strokeWidth={1}
                        radius={[0, 4, 4, 0]}
                        barSize={16}
                        filter="url(#shadowProductos)"
                    >
                        <RechartsLabelList dataKey="value" content={(props) => <CustomizedLabel {...props} metric={metric} />} />
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};
