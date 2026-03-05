// 2025 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LabelList } from 'recharts';
import { CameraIcon } from '@heroicons/react/24/outline';
import { exportChartAsPNG } from '../lib/exportUtils';
import { ControlPanel, ControlGroup, SwitchControl, SelectControl, ButtonControl, MultiSelectDropdown, RangeControl } from './shared/ControlPanel';

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

interface VentasMensualesProps {
    ventasPorMes: Record<string, { A: number; X: number; AX: number }>;
    cantidadesPorMes: Record<string, { A: number; X: number; AX: number }>;
}

export const VentasMensuales = ({ ventasPorMes, cantidadesPorMes }: VentasMensualesProps) => {
    const [metrica, setMetrica] = useState<'importe' | 'cantidad'>('importe');
    const [modoVista, setModoVista] = useState<'acumulado' | 'comparativo'>('acumulado');
    const [mesesSeleccionados, setMesesSeleccionados] = useState<string[]>([]);
    const [mesesConDatos, setMesesConDatos] = useState<string[]>([]);
    const [mostrarVariacion, setMostrarVariacion] = useState<boolean>(false);
    const chartRef = useRef<HTMLDivElement>(null);

    const meses = useMemo(() => [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ], []);

    // Identificar meses que tienen datos
    useEffect(() => {
        const mesesDisponibles = meses.filter(mes => {
            const mesData = ventasPorMes[mes];
            return mesData && (mesData.A > 0 || mesData.X > 0 || mesData.AX > 0);
        });
        setMesesConDatos(mesesDisponibles);
        if (mesesSeleccionados.length === 0 && mesesDisponibles.length > 0) {
            setMesesSeleccionados(mesesDisponibles);
        }
    }, [ventasPorMes, meses, mesesSeleccionados.length]);

    const data = useMemo(() => {
        const mesesAMostrar = mesesSeleccionados.length > 0 ? mesesSeleccionados : mesesConDatos;

        return mesesAMostrar.map((mes, index) => {
            const mesData = ventasPorMes[mes] || { A: 0, X: 0, AX: 0 };
            const cantidadData = cantidadesPorMes[mes] || { A: 0, X: 0, AX: 0 };
            
            // Calcular variaciones
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
                ghostValue: 0
            };
        });
    }, [ventasPorMes, mesesSeleccionados, mesesConDatos, cantidadesPorMes, mostrarVariacion]);

    const defaultBarSize = useMemo(() => {
        const n = (mesesSeleccionados.length || mesesConDatos.length || 12);
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
        const n = (mesesSeleccionados.length || mesesConDatos.length || 12);
        if (n <= 2) return 520;
        if (n <= 4) return 560;
        if (n <= 8) return 620;
        return 700;
    }, [mesesSeleccionados.length, mesesConDatos.length]);

    const _maxTotal = useMemo(() => {
        if (data.length === 0) return 0;
        return Math.max(
            ...data.map(item =>
                metrica === 'importe'
                    ? (item.A || 0) + (item.X || 0)
                    : (item.cantidadA || 0) + (item.cantidadX || 0)
            )
        );
    }, [data, metrica]);

    interface TooltipProps {
        active?: boolean;
        payload?: Array<{ name: string; value: number; color: string; dataKey?: string }>;
        label?: string;
    }

    const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
        if (active && payload && payload.length) {
            const dataPoint = data.find(d => d.mes === label);
            
            return (
                <div className="p-3 bg-white border border-gray-300 rounded-md shadow-lg dark:bg-gray-800 dark:border-gray-600">
                    <p className="font-bold text-sm mb-2">{label}</p>
                    {payload.map((entry, index) => {
                        const isQuantity = entry.dataKey?.includes('cantidad');
                        const value = entry.value;
                        let variacion = 0;
                        
                        if (mostrarVariacion && dataPoint?.tieneVariacion) {
                            if (entry.dataKey === 'A') variacion = dataPoint.varA;
                            else if (entry.dataKey === 'X') variacion = dataPoint.varX;
                            else if (entry.dataKey === 'AX') variacion = dataPoint.varAX;
                            else if (entry.dataKey === 'cantidadA') variacion = dataPoint.varCantA;
                            else if (entry.dataKey === 'cantidadX') variacion = dataPoint.varCantX;
                            else if (entry.dataKey === 'cantidadAX') variacion = dataPoint.varCantAX;
                        }

                        return (
                            <div key={index} className="text-sm mb-1">
                                <p style={{ color: entry.color }}>
                                    <span>{entry.name}: </span>
                                    <span className="font-bold">
                                        {isQuantity ? formatQuantity(value) : formatCurrency(value)}
                                    </span>
                                </p>
                                {mostrarVariacion && dataPoint?.tieneVariacion && (
                                    <p className="text-xs ml-4">
                                        <span className={variacion > 0 ? 'text-green-600' : variacion < 0 ? 'text-red-600' : 'text-gray-500'}>
                                            Var: {variacion > 0 ? '+' : ''}{variacion.toFixed(1)}%
                                        </span>
                                    </p>
                                )}
                            </div>
                        );
                    })}
                </div>
            );
        }
        return null;
    };

    const handleExport = () => {
        exportChartAsPNG(chartRef, 'ventas-mensuales');
    };

    // Etiquetas personalizadas
    interface ChartData {
        mes: string;
        A: number;
        X: number;
        AX: number;
        cantidadA: number;
        cantidadX: number;
        cantidadAX: number;
        varA: number;
        varX: number;
        varAX: number;
        varCantA: number;
        varCantX: number;
        varCantAX: number;
        tieneVariacion: boolean;
        ghostValue: number;
    }

    type LabelProps = {
        x?: number | string;
        y?: number | string;
        width?: number | string;
        height?: number | string;
        value?: number | string;
        index?: number;
        dataKey?: string;
        payload?: ChartData;
    };

    const SegmentLabel = (props: LabelProps & { serie: 'A' | 'X' | 'cantidadA' | 'cantidadX' }) => {
        const { x, y, width, height = 0, value = 0, index, serie } = props;
        
        // Ensure values are numbers
        const numX = Number(x) || 0;
        const numY = Number(y) || 0;
        const numWidth = Number(width) || 0;
        const numHeight = Number(height) || 0;
        const numValue = Number(value) || 0;

        if (numValue <= 0 || numHeight < 20) return null;

        const labelX = numX + numWidth / 2;
        const labelY = numY + numHeight / 2;
        const formattedValue = metrica === 'importe' ? formatCurrency(numValue, true) : formatQuantity(numValue, true);

        let variationText = null;
        let variationVal = 0;
        if (modoVista === 'comparativo' && mostrarVariacion && typeof index === 'number' && index > 0) {
            const item = data[index];
            if (serie === 'A' || serie === 'cantidadA') {
                variationVal = metrica === 'importe' ? item.varA : item.varCantA;
            } else if (serie === 'X' || serie === 'cantidadX') {
                variationVal = metrica === 'importe' ? item.varX : item.varCantX;
            }

            if (item.tieneVariacion) {
                const sign = variationVal > 0 ? '+' : '';
                const colorClass = variationVal > 0 ? 'fill-green-600 dark:fill-green-500' : variationVal < 0 ? 'fill-red-600 dark:fill-red-500' : 'fill-gray-500';
                variationText = (
                    <tspan x={labelX} dy="1.2em" className={`text-[13px] font-bold ${colorClass}`}>
                        {`(${sign}${variationVal.toFixed(1)}%)`}
                    </tspan>
                );
            }
        }

        const mainLen = formattedValue.length;
        const varLen = variationText ? (`(${variationVal.toFixed(1)}%)`).length + 2 : 0;
        const rectWidth = Math.max(mainLen * 7.5, varLen * 8.0) + 16;
        const rectHeight = variationText ? 34 : 22;
        const rectX = labelX - rectWidth / 2;
        const rectY = labelY - (variationText ? 20 : 12);

        return (
            <g>
                <rect x={rectX} y={rectY} rx={4} ry={4} width={rectWidth} height={rectHeight} style={{ fill: 'rgba(17, 24, 39, 0.72)' }} />
                <text x={labelX} y={labelY} textAnchor="middle" className="fill-white text-[12px] font-semibold">
                    <tspan x={labelX} dy={variationText ? "-0.5em" : "0.3em"}>{formattedValue}</tspan>
                    {variationText}
                </text>
            </g>
        );
    };

    const TotalLabel = (props: LabelProps) => {
        const { x, y, width, index, payload } = props;
        
        // Ensure values are numbers
        const numX = Number(x) || 0;
        const numY = Number(y) || 0;
        const numWidth = Number(width) || 0;
        
        // Use data[index] as fallback or primary source
        const dataItem = (typeof index === 'number' && data[index]) ? data[index] : payload;
        
        const total = metrica === 'importe' ? (dataItem?.AX || 0) : (dataItem?.cantidadAX || 0);
        
        if (!total || total <= 0) return null;
        
        const formattedValue = metrica === 'importe' ? formatCurrency(total, true) : formatQuantity(total, true);

        let delta = 0;
        let variationText: React.ReactNode | null = null;
        if (modoVista === 'comparativo' && mostrarVariacion && typeof index === 'number' && index > 0) {
            const prev = data[index - 1];
            const prevTotal = metrica === 'importe' ? prev.AX : prev.cantidadAX;
            if (prevTotal > 0) {
                delta = ((total - prevTotal) / prevTotal) * 100;
                const sign = delta > 0 ? '+' : '';
                const colorClass = delta > 0 ? 'fill-green-600 dark:fill-green-500' : delta < 0 ? 'fill-red-600 dark:fill-red-500' : 'fill-gray-500';
                variationText = (
                    <tspan x={numX + numWidth / 2} dy="1.2em" className={`text-[13px] font-bold ${colorClass}`}>
                        {`${sign}${delta.toFixed(1)}%`}
                    </tspan>
                );
            }
        }

        const labelX = numX + numWidth / 2;
        const labelY = numY - 30; // Movido más arriba (antes -10)
        const mainLen = formattedValue.length;
        const varLen = variationText ? (`${delta.toFixed(1)}%`).length + 1 : 0;
        const rectWidth = Math.max(mainLen * 8.0, varLen * 8.0) + 18;
        const rectHeight = variationText ? 36 : 24;
        const rectX = labelX - rectWidth / 2;
        const rectY = labelY - (variationText ? 22 : 14);

        return (
            <g>
                <rect x={rectX} y={rectY} rx={4} ry={4} width={rectWidth} height={rectHeight} style={{ fill: 'rgba(17, 24, 39, 0.72)' }} />
                <text x={labelX} y={labelY} textAnchor="middle" className="fill-white text-[13px] font-semibold">
                    <tspan x={labelX} dy={variationText ? "-0.5em" : "0.3em"}>{formattedValue}</tspan>
                    {variationText}
                </text>
            </g>
        );
    };

    const colSpanClass = (mesesSeleccionados.length || mesesConDatos.length) > 4 ? 'lg:col-span-2' : '';

    return (
        <div ref={chartRef} className={`rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800 ${colSpanClass}`}>
            <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Ventas Mensuales</h4>
            </div>

            <ControlPanel title="Controles de Visualización" className="mb-2">
                <ControlGroup label="Exportar">
                    <ButtonControl onClick={handleExport} variant="icon" title="Exportar como PNG">
                        <CameraIcon className="w-4 h-4" />
                    </ButtonControl>
                </ControlGroup>

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
                        value={metrica}
                        onChange={(value) => setMetrica(value as 'importe' | 'cantidad')}
                        options={[
                            { value: 'importe', label: 'Importe' },
                            { value: 'cantidad', label: 'Cantidad' }
                        ]}
                        className="w-32"
                    />
                </ControlGroup>

                <RangeControl
                    value={barSize}
                    onChange={(v) => { setBarSizeTouched(true); setBarSize(v); }}
                    min={10}
                    max={70}
                    step={1}
                    label="Ancho barra"
                />

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

                {modoVista === 'comparativo' && (
                    <SwitchControl
                        checked={mostrarVariacion}
                        onChange={setMostrarVariacion}
                        label="Variación %"
                        disabled={data.length < 2}
                    />
                )}
            </ControlPanel>

            <ResponsiveContainer width="100%" height={chartHeight}>
                <BarChart
                    data={data}
                    margin={{ top: 80, right: 30, left: 20, bottom: 0 }}
                    barCategoryGap={modoVista === 'comparativo' ? 12 : 6}
                    barGap={modoVista === 'comparativo' ? 12 : 6}
                >
                    <defs>
                        <linearGradient id="colorBarA" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#8884d8" stopOpacity={0.9} />
                            <stop offset="100%" stopColor="#6c5ce7" stopOpacity={0.8} />
                        </linearGradient>
                        <linearGradient id="colorBarX" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#82ca9d" stopOpacity={0.9} />
                            <stop offset="100%" stopColor="#6eb58a" stopOpacity={0.8} />
                        </linearGradient>
                        <filter id="shadowVentasMensuales" x="-10%" y="-10%" width="120%" height="130%">
                            <feOffset result="offOut" in="SourceGraphic" dx="3" dy="3" />
                            <feColorMatrix result="matrixOut" in="offOut" type="matrix"
                                values="0.2 0 0 0 0 0 0.2 0 0 0 0 0 0.2 0 0 0 0 0 1 0" />
                            <feGaussianBlur result="blurOut" in="matrixOut" stdDeviation="3" />
                            <feBlend in="SourceGraphic" in2="blurOut" mode="normal" />
                        </filter>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                        dataKey="mes"
                        angle={-45}
                        textAnchor="end"
                        height={60}
                        interval={0}
                    />
                    <YAxis
                        tickFormatter={(value) => metrica === 'importe' ? formatCurrency(value, true) : formatQuantity(value, true)}
                        domain={[0, dataMax => Math.round(dataMax * 1.4)]}
                        padding={{ top: 70 }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />

                    {metrica === 'importe' ? (
                        <>
                            <Bar
                                dataKey="A"
                                stackId="ventas"
                                barSize={barSize}
                                fill="url(#colorBarA)"
                                name="Facturas"
                                stroke="#6c5ce7"
                                strokeWidth={1}
                                filter="url(#shadowVentasMensuales)"
                            >
                                <LabelList dataKey="A" content={(props) => <SegmentLabel {...props} serie="A" />} />
                            </Bar>
                            <Bar
                                dataKey="X"
                                stackId="ventas"
                                barSize={barSize}
                                fill="url(#colorBarX)"
                                name="Remitos"
                                stroke="#6eb58a"
                                strokeWidth={1}
                                filter="url(#shadowVentasMensuales)"
                            >
                                <LabelList dataKey="X" content={(props) => <SegmentLabel {...props} serie="X" />} />
                                <LabelList dataKey="X" position="top" content={(p) => <TotalLabel {...p} />} />
                            </Bar>
                            
                        </>
                    ) : (
                        <>
                            <Bar
                                dataKey="cantidadA"
                                stackId="ventas"
                                barSize={barSize}
                                fill="url(#colorBarA)"
                                name="Facturas (cantidad)"
                                stroke="#6c5ce7"
                                strokeWidth={1}
                                filter="url(#shadowVentasMensuales)"
                            >
                                <LabelList dataKey="cantidadA" content={(props) => <SegmentLabel {...props} serie="cantidadA" />} />
                            </Bar>
                            <Bar
                                dataKey="cantidadX"
                                stackId="ventas"
                                barSize={barSize}
                                fill="url(#colorBarX)"
                                name="Remitos (cantidad)"
                                stroke="#6eb58a"
                                strokeWidth={1}
                                filter="url(#shadowVentasMensuales)"
                            >
                                <LabelList dataKey="cantidadX" content={(props) => <SegmentLabel {...props} serie="cantidadX" />} />
                                <LabelList dataKey="cantidadX" position="top" content={(p) => <TotalLabel {...p} />} />
                            </Bar>
                            
                        </>
                    )}
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};
