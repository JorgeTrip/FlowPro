// &#169; 2025 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts';
import { CameraIcon } from '@heroicons/react/24/outline';
import { exportChartAsPNG } from '../lib/exportUtils';
import { ReporteResultados } from '@/app/lib/reportGenerator';
import { ControlPanel, ControlGroup, SelectControl, ButtonControl } from './shared/ControlPanel';

// --- Helper Functions ---
const formatCurrency = (value: number, compacto: boolean = false) => {
    if (compacto) {
        if (value >= 1000000) {
            const valorFormateado = (value / 1000000).toLocaleString('es-AR', {
                minimumFractionDigits: 1,
                maximumFractionDigits: 1
            });
            return `$${valorFormateado} mill.`;
        } else if (value >= 1000) {
            return `$${value.toLocaleString('es-AR', { maximumFractionDigits: 0 })}`;
        } else {
            return `$${value.toLocaleString('es-AR', { maximumFractionDigits: 0 })}`;
        }
    } else {
        return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(value);
    }
};
const formatQuantity = (value: number, compacto: boolean = false) => {
    if (compacto) {
        if (value >= 1000000) {
            const valorFormateado = (value / 1000000).toLocaleString('es-AR', {
                minimumFractionDigits: 1,
                maximumFractionDigits: 1
            });
            return `${valorFormateado} mill.`;
        } else {
            return value.toLocaleString('es-AR', { maximumFractionDigits: 0 });
        }
    } else {
        return new Intl.NumberFormat('es-AR').format(value);
    }
};
const formatName = (name: string) => name.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');

// --- Componente de label para las barras (mismo estilo que Top 10 Vendedores) ---
interface CustomizedLabelProps {
    x?: string | number;
    y?: string | number;
    width?: string | number;
    height?: string | number;
    value?: string | number;
    metric?: 'importe' | 'cantidad';
}

const CustomizedLabel = (props: CustomizedLabelProps) => {
    const { x = 0, y = 0, width = 0, height = 0, value, metric } = props;

    if (value === undefined || value === null || value === 0) return null;

    const numX = typeof x === 'string' ? parseFloat(x) : x;
    const numY = typeof y === 'string' ? parseFloat(y) : y;
    const numWidth = typeof width === 'string' ? parseFloat(width) : width;
    const numHeight = typeof height === 'string' ? parseFloat(height) : height;
    const numValue = typeof value === 'string' ? parseFloat(value) : value;

    const formattedValue = metric === 'importe' ? formatCurrency(numValue) : formatQuantity(numValue);

    return (
        <text x={numX + numWidth + 5} y={numY + numHeight / 2} textAnchor="start" dominantBaseline="middle" className="fill-gray-600 dark:fill-gray-400 text-xs font-medium">
            {formattedValue}
        </text>
    );
};


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

    const meses = useMemo(() => [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ], []);

    // Simular meses con datos (en una implementación real esto vendría de los datos)
    useEffect(() => {
        // Por ahora simulamos que todos los meses tienen datos
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

        let processedData = sourceData
            .map((item: { cliente: string; total: number }) => ({
                name: formatName(item.cliente),
                value: item.total,
            }));

        // Aplicar ordenamiento
        if (orden === 'menos') {
            processedData = processedData.sort((a, b) => a.value - b.value);
        } else {
            processedData = processedData.sort((a, b) => b.value - a.value);
        }

        return processedData.slice(0, numClientes);

    }, [tipoCliente, metric, numClientes, orden, topClientesDistribuidores, topClientesDistribuidoresPorCantidad, topClientesMinoristas, topClientesMinoristasPorCantidad]);

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
        exportChartAsPNG(chartRef, 'top-clientes');
    };

    return (
        <div ref={chartRef} className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Top Clientes</h4>
            </div>

            <ControlPanel title="Controles de Visualización">
                <ControlGroup label="Exportar">
                    <ButtonControl onClick={handleExport} variant="icon" title="Exportar como PNG">
                        <CameraIcon className="w-4 h-4" />
                    </ButtonControl>
                </ControlGroup>

                <ControlGroup label="Tipo">
                    <SelectControl
                        value={tipoCliente}
                        onChange={(value) => setTipoCliente(value as 'Minoristas' | 'Distribuidores')}
                        options={[
                            { value: 'Distribuidores', label: 'Distribuidores' },
                            { value: 'Minoristas', label: 'Minoristas' }
                        ]}
                        className="w-40"
                    />
                </ControlGroup>

                <ControlGroup label="Cantidad">
                    <SelectControl
                        value={String(numClientes)}
                        onChange={(value) => setNumClientes(Number(value))}
                        options={[
                            { value: '5', label: 'Top 5' },
                            { value: '10', label: 'Top 10' },
                            { value: '15', label: 'Top 15' },
                            { value: '20', label: 'Top 20' }
                        ]}
                        className="w-28"
                    />
                </ControlGroup>

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

                <ControlGroup label="Orden">
                    <SelectControl
                        value={orden}
                        onChange={(value) => setOrden(value as 'mas' | 'menos')}
                        options={[
                            { value: 'mas', label: 'Más vendidos' },
                            { value: 'menos', label: 'Menos vendidos' }
                        ]}
                        className="w-36"
                    />
                </ControlGroup>

                <div className="border-l border-gray-300 dark:border-gray-600 h-8"></div>

                <ControlGroup label="Filtro Meses">
                    <SelectControl
                        value={filtroMeses}
                        onChange={(value) => {
                            setFiltroMeses(value as 'todos' | 'conDatos' | 'individual');
                            if (value === 'individual' && mesesConDatos.length > 0 && !mesSeleccionado) {
                                setMesSeleccionado(mesesConDatos[0]);
                            }
                        }}
                        options={[
                            { value: 'todos', label: 'Todos los meses' },
                            { value: 'conDatos', label: 'Solo meses con datos' },
                            { value: 'individual', label: 'Seleccionar mes' }
                        ]}
                        className="w-44"
                    />
                    {filtroMeses === 'individual' && (
                        <SelectControl
                            value={mesSeleccionado || meses[0]}
                            onChange={(value) => setMesSeleccionado(value)}
                            options={meses.map(mes => ({
                                value: mes,
                                label: mes
                            }))}
                            className="w-36"
                        />
                    )}
                </ControlGroup>
            </ControlPanel>
            <ResponsiveContainer width="100%" height={chartHeight}>
                <BarChart data={data} layout="vertical" margin={{ top: 5, right: 100, left: 20, bottom: 5 }}>
                    <defs>
                        <linearGradient id="colorBarCliente" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#82ca9d" stopOpacity={0.8} />
                            <stop offset="100%" stopColor="#8884d8" stopOpacity={0.9} />
                        </linearGradient>
                        <filter id="shadowClientes" x="-10%" y="-10%" width="120%" height="130%">
                            <feOffset result="offOut" in="SourceGraphic" dx="3" dy="3" />
                            <feColorMatrix result="matrixOut" in="offOut" type="matrix"
                                values="0.2 0 0 0 0 0 0.2 0 0 0 0 0 0.2 0 0 0 0 0 1 0" />
                            <feGaussianBlur result="blurOut" in="matrixOut" stdDeviation="3" />
                            <feBlend in="SourceGraphic" in2="blurOut" mode="normal" />
                        </filter>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                        type="number"
                        domain={[0, maxValue]}
                        tickFormatter={(value) => metric === 'importe' ? formatCurrency(value as number, true) : formatQuantity(value as number, true)}
                    />
                    <YAxis type="category" dataKey="name" width={150} tick={{ fontSize: 12 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                        dataKey="value"
                        name={metric === 'importe' ? 'Ventas' : 'Cantidad'}
                        fill="url(#colorBarCliente)"
                        radius={[0, 4, 4, 0]}
                        stroke="#6eb58a"
                        strokeWidth={1}
                        filter="url(#shadowClientes)"
                    >
                        <LabelList dataKey="value" content={(props) => <CustomizedLabel {...props} metric={metric} />} />
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};
