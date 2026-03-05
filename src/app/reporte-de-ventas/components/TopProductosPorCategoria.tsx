// 2025 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { CameraIcon } from '@heroicons/react/24/outline';
import { exportChartAsPNG } from '../lib/exportUtils';
import { ControlPanel, ControlGroup, SelectControl, SwitchControl, ButtonControl } from './shared/ControlPanel';

// --- Helper Functions ---
const formatCurrency = (value: number, compacto: boolean = false) => {
    if (compacto) {
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

// --- Componente de label para las barras (mismo estilo que Top 10 Vendedores) ---
interface CustomizedLabelProps {
    x?: string | number;
    y?: string | number;
    width?: string | number;
    height?: string | number;
    value?: string | number;
    mostrarCantidad?: boolean;
}

const CustomizedLabelBar = (props: CustomizedLabelProps) => {
    const { x = 0, y = 0, width = 0, height = 0, value, mostrarCantidad } = props;

    if (value === undefined || value === null || value === 0) return null;

    const numX = typeof x === 'string' ? parseFloat(x) : x;
    const numY = typeof y === 'string' ? parseFloat(y) : y;
    const numWidth = typeof width === 'string' ? parseFloat(width) : width;
    const numHeight = typeof height === 'string' ? parseFloat(height) : height;
    const numValue = typeof value === 'string' ? parseFloat(value) : value;

    const formattedValue = mostrarCantidad ? formatQuantity(numValue) : formatCurrency(numValue);

    return (
        <text x={numX + numWidth + 5} y={numY + numHeight / 2} textAnchor="start" dominantBaseline="middle" className="fill-gray-600 dark:fill-gray-400 text-xs font-medium">
            {formattedValue}
        </text>
    );
};


interface ProductoCategoria {
    categoria: string;
    productos: {
        articulo: string;
        descripcion: string;
        cantidad: number;
        total: number;
    }[];
    cantidadCategoria: number;
    totalCategoria: number;
}

interface TopProductosPorCategoriaProps {
    topProductosPorCategoria: ProductoCategoria[];
    topProductosPorCategoriaImporte: ProductoCategoria[];
}

export const TopProductosPorCategoria = ({
    topProductosPorCategoria,
    topProductosPorCategoriaImporte,
}: TopProductosPorCategoriaProps) => {
    const [mostrarCantidad, setMostrarCantidad] = useState<boolean>(false);
    const [topPorCategoria, setTopPorCategoria] = useState<number>(3);
    const [filtroMeses, setFiltroMeses] = useState<'todos' | 'conDatos' | 'individual'>('conDatos');
    const [mesSeleccionado, setMesSeleccionado] = useState<string | null>(null);
    const [mesesConDatos, setMesesConDatos] = useState<string[]>([]);
    const [categoriasSeleccionadas, setCategoriasSeleccionadas] = useState<string[]>([]);
    const [ordenAscendente, setOrdenAscendente] = useState<boolean>(false);
    const [popoverVisible, setPopoverVisible] = useState<boolean>(false);
    const chartRef = useRef<HTMLDivElement>(null);

    const meses = useMemo(() => [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ], []);

    // Identificar meses que tienen datos
    useEffect(() => {
        setMesesConDatos(meses);
        if (filtroMeses === 'individual' && !mesSeleccionado && meses.length > 0) {
            setMesSeleccionado(meses[0]);
        }
    }, [filtroMeses, mesSeleccionado, meses]);

    // Inicializar categorías seleccionadas con todas las categorías disponibles
    useEffect(() => {
        const data = mostrarCantidad ? topProductosPorCategoria : topProductosPorCategoriaImporte;
        if (data && Array.isArray(data) && data.length > 0 && categoriasSeleccionadas.length === 0) {
            const todasLasCategorias = [...new Set(data.map((item: ProductoCategoria) => item.categoria))];
            setCategoriasSeleccionadas(todasLasCategorias);
        }
    }, [topProductosPorCategoria, topProductosPorCategoriaImporte, mostrarCantidad, categoriasSeleccionadas.length]);

    // Obtener datos según el tipo de métrica (cantidad o importe)
    const data = mostrarCantidad
        ? topProductosPorCategoria
        : topProductosPorCategoriaImporte;

    console.log('🔍 TopProductosPorCategoria - data recibida:', data);
    console.log('🔍 TopProductosPorCategoria - mostrarCantidad:', mostrarCantidad);
    console.log('🔍 TopProductosPorCategoria - data.length:', data?.length);
    console.log('🔍 TopProductosPorCategoria - Array.isArray(data):', Array.isArray(data));

    // Preparar datos para el gráfico - ESTRUCTURA JERÁRQUICA
    const chartData = useMemo(() => {
        // Validar que data existe y es un array
        if (!data || !Array.isArray(data)) {
            return [];
        }

        // Si hay categorías seleccionadas, filtrar solo esas categorías
        let dataFiltrada = categoriasSeleccionadas.length > 0
            ? data.filter((item: ProductoCategoria) => categoriasSeleccionadas.includes(item.categoria))
            : data;

        // Aplicar ordenamiento de categorías según la selección del usuario
        // Ascendente: menor venta primero, Descendente: mayor venta primero
        dataFiltrada = [...dataFiltrada].sort((a: ProductoCategoria, b: ProductoCategoria) => {
            const valorA = mostrarCantidad ? a.cantidadCategoria : a.totalCategoria;
            const valorB = mostrarCantidad ? b.cantidadCategoria : b.totalCategoria;
            return ordenAscendente ? valorA - valorB : valorB - valorA;
        }); // Sin límite de categorías, controlado por filtro
        console.log('🔍 prepararDatosGrafico - dataFiltrada:', dataFiltrada);
        console.log('🔍 prepararDatosGrafico - dataFiltrada.length:', dataFiltrada.length);

        const resultado: Array<{ name: string; value: number; isCategory?: boolean; categoria?: string; porcentaje?: number; articulo?: string; descripcion?: string }> = [];

        dataFiltrada.forEach((categoria: ProductoCategoria) => {
            // Añadir el total de la categoría (destacado)
            resultado.push({
                name: `${categoria.categoria} (Total)`,
                value: mostrarCantidad ? categoria.cantidadCategoria : categoria.totalCategoria,
                isCategory: true,
                categoria: categoria.categoria,
                articulo: '',
                descripcion: `Total ${categoria.categoria}`
            });

            // Añadir productos de la categoría (indentados)
            const productosAMostrar = topPorCategoria === -1 ? categoria.productos : categoria.productos.slice(0, topPorCategoria);
            productosAMostrar.forEach((producto) => {
                resultado.push({
                    name: `  ${producto.descripcion}`,
                    value: mostrarCantidad ? producto.cantidad : producto.total,
                    isCategory: false,
                    categoria: categoria.categoria,
                    articulo: producto.articulo,
                    descripcion: producto.descripcion
                });
            });
        });

        console.log('🔍 prepararDatosGrafico - resultado final:', resultado);
        console.log('🔍 prepararDatosGrafico - resultado.length:', resultado.length);

        return resultado; // Sin límite artificial, controlado por filtro de categorías y topPorCategoria
    }, [data, categoriasSeleccionadas, ordenAscendente, mostrarCantidad, topPorCategoria]);

    // Calcular altura dinámica
    const calcularAltura = () => {
        const baseHeight = 400;
        const itemHeight = 35; // Aumentado de 25 a 35 para evitar solapamiento
        return Math.max(baseHeight, chartData.length * itemHeight + 150);
    };

    interface TooltipProps {
        active?: boolean;
        payload?: Array<{ payload: { isCategory?: boolean; categoria?: string; descripcion?: string; value: number; porcentaje?: number } }>;
        label?: string;
    }

    const CustomTooltip = ({ active, payload }: TooltipProps) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="p-2 bg-gray-700 text-white rounded-md border border-gray-600 shadow-lg">
                    <p className="font-bold">{data.isCategory ? data.categoria : data.descripcion}</p>
                    <p>{`Categoría: ${data.categoria}`}</p>
                    <p>{`${mostrarCantidad ? 'Cantidad' : 'Importe'}: ${mostrarCantidad ? formatQuantity(data.value) : formatCurrency(data.value)}`}</p>
                    <p>{`Porcentaje: ${data.porcentaje}% ${data.isCategory ? 'del total' : 'de la categoría'}`}</p>
                </div>
            );
        }
        return null;
    };

    // Validar que data existe y es un array para el render
    if (!data || !Array.isArray(data)) {
        console.log('❌ TopProductosPorCategoria_new - data no válido, renderizando mensaje');
        return (
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Top Productos por Categoría</h4>
                <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">No hay datos disponibles para mostrar</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                        Data: {data ? 'existe' : 'null'}, Array: {Array.isArray(data) ? 'sí' : 'no'}
                    </p>
                </div>
            </div>
        );
    }

    const handleExport = () => {
        exportChartAsPNG(chartRef, 'top-productos-por-categoria');
    };

    return (
        <div ref={chartRef} className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Top Productos por Categoría</h4>
            </div>

            <ControlPanel title="Controles de Visualización">
                <ControlGroup label="Exportar">
                    <ButtonControl onClick={handleExport} variant="icon" title="Exportar como PNG">
                        <CameraIcon className="w-4 h-4" />
                    </ButtonControl>
                </ControlGroup>

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

                <div className="border-l border-gray-300 dark:border-gray-600 h-8"></div>

                <ControlGroup label="Prod/Categoría">
                    <SelectControl
                        value={String(topPorCategoria)}
                        onChange={(value) => setTopPorCategoria(Number(value))}
                        options={[
                            { value: '-1', label: 'Todos/Categoría' },
                            { value: '1', label: '1 Prod/Categoría' },
                            { value: '2', label: '2 Prod/Categoría' },
                            { value: '3', label: '3 Prod/Categoría' },
                            { value: '4', label: '4 Prod/Categoría' },
                            { value: '5', label: '5 Prod/Categoría' },
                            { value: '6', label: '6 Prod/Categoría' },
                            { value: '7', label: '7 Prod/Categoría' },
                            { value: '8', label: '8 Prod/Categoría' },
                            { value: '9', label: '9 Prod/Categoría' },
                            { value: '10', label: '10 Prod/Categoría' }
                        ]}
                        className="w-44"
                    />
                </ControlGroup>

                <ControlGroup label="Métrica">
                    <SelectControl
                        value={mostrarCantidad ? 'cantidad' : 'importe'}
                        onChange={(value) => setMostrarCantidad(value === 'cantidad')}
                        options={[
                            { value: 'importe', label: 'Importe' },
                            { value: 'cantidad', label: 'Cantidad' }
                        ]}
                        className="w-32"
                    />
                </ControlGroup>

                <SwitchControl
                    checked={ordenAscendente}
                    onChange={setOrdenAscendente}
                    label={ordenAscendente ? 'Ascendente' : 'Descendente'}
                />

                {/* Selector de categorías con popover */}
                <ControlGroup label="Categorías">
                    <div className="relative">
                        <button
                            onClick={() => setPopoverVisible(!popoverVisible)}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-44 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        >
                            {categoriasSeleccionadas.length === 0 ? 'Todas las categorías' :
                                categoriasSeleccionadas.length === 1 ? categoriasSeleccionadas[0] :
                                    `${categoriasSeleccionadas.length} categorías`}
                        </button>

                        {popoverVisible && (
                            <div className="absolute top-full left-0 mt-1 w-96 bg-white border border-gray-300 rounded-lg shadow-lg z-10 dark:bg-gray-700 dark:border-gray-600">
                                <div className="p-4">
                                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                        Categorías ordenadas por {mostrarCantidad ? 'cantidad' : 'importe'} (mayor a menor)
                                    </div>
                                    <div className="space-y-2 max-h-60 overflow-y-auto">
                                        {data
                                            .slice()
                                            .sort((a: ProductoCategoria, b: ProductoCategoria) => {
                                                const valorA = mostrarCantidad ? a.cantidadCategoria : a.totalCategoria;
                                                const valorB = mostrarCantidad ? b.cantidadCategoria : b.totalCategoria;
                                                return valorB - valorA;
                                            })
                                            .map((cat: ProductoCategoria) => (
                                                <label key={cat.categoria} className="flex items-center space-x-2 text-sm cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={categoriasSeleccionadas.includes(cat.categoria)}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                setCategoriasSeleccionadas([...categoriasSeleccionadas, cat.categoria]);
                                                            } else {
                                                                setCategoriasSeleccionadas(
                                                                    categoriasSeleccionadas.filter(c => c !== cat.categoria)
                                                                );
                                                            }
                                                        }}
                                                        className="rounded"
                                                    />
                                                    <span className="flex-1 text-gray-900 dark:text-gray-100">
                                                        {cat.categoria}
                                                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                                                            {mostrarCantidad
                                                                ? `(${cat.cantidadCategoria?.toLocaleString('es-AR')} u.)`
                                                                : `(${cat.totalCategoria?.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })})`
                                                            }
                                                        </span>
                                                    </span>
                                                </label>
                                            ))
                                        }
                                    </div>
                                    <div className="flex justify-between mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                                        <button
                                            onClick={() => setCategoriasSeleccionadas([])}
                                            disabled={categoriasSeleccionadas.length === 0}
                                            className={`text-sm px-3 py-1 rounded transition-colors ${categoriasSeleccionadas.length === 0
                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
                                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500'
                                                }`}
                                        >
                                            Limpiar
                                        </button>
                                        <div className="space-x-2">
                                            <button
                                                onClick={() => setCategoriasSeleccionadas(data.map((cat: ProductoCategoria) => cat.categoria))}
                                                className="text-sm px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800"
                                            >
                                                Seleccionar todas
                                            </button>
                                            <button
                                                onClick={() => setPopoverVisible(false)}
                                                className="text-sm px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                                            >
                                                Aplicar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </ControlGroup>
            </ControlPanel>

            <div style={{ height: calcularAltura() }}>
                {(() => {
                    console.log('🔍 Renderizando BarChart con altura:', calcularAltura());
                    console.log('🔍 chartData para BarChart:', chartData);
                    console.log('🔍 chartData[0]:', chartData[0]);
                    return null;
                })()}
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={chartData}
                        layout="vertical"
                        margin={{ top: 5, right: 120, left: 20, bottom: 5 }}
                    >
                        <defs>
                            <linearGradient id="colorBarCategoriaTotal" x1="0" y1="0" x2="1" y2="0">
                                <stop offset="0%" stopColor="#8884d8" stopOpacity={1} />
                                <stop offset="75%" stopColor="#7570c0" stopOpacity={1} />
                                <stop offset="100%" stopColor="#6762a8" stopOpacity={1} />
                            </linearGradient>
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
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            type="number"
                            tickFormatter={(value) => {
                                // Formatear valores con separadores de miles y notación de millones
                                if (!mostrarCantidad) {
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
                        <YAxis
                            type="category"
                            dataKey="name"
                            width={200}
                            tick={({ y, payload }) => {
                                const isCategory = chartData[payload.index]?.isCategory;
                                const isDarkMode = document.documentElement.classList.contains('dark');
                                return (
                                    <text
                                        x={0}
                                        y={y}
                                        dy={4}
                                        textAnchor="start"
                                        fill={isCategory
                                            ? (isDarkMode ? "#f9fafb" : "#333")
                                            : (isDarkMode ? "#d1d5db" : "#666")
                                        }
                                        fontWeight={isCategory ? "bold" : "normal"}
                                        fontSize={isCategory ? 13 : 11}
                                    >
                                        {payload.value}
                                    </text>
                                );
                            }}
                            interval={0}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar
                            dataKey="value"
                            name={mostrarCantidad ? "Cantidad" : "Importe"}
                            fill="url(#colorBarProducto)"
                            stroke="#6eb58a"
                            strokeWidth={1}
                            radius={[0, 4, 4, 0]}
                            barSize={16}
                            filter="url(#shadowProductos)"
                        >
                            {chartData.map((entry, index: number) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry.isCategory ? "url(#colorBarCategoriaTotal)" : "url(#colorBarProducto)"}
                                    stroke={entry.isCategory ? "#6762a8" : "#6eb58a"}
                                />
                            ))}
                            <LabelList dataKey="value" content={(props) => <CustomizedLabelBar {...props} mostrarCantidad={mostrarCantidad} />} />
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="text-center mt-3">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                    {topPorCategoria === -1
                        ? `Todos los productos por categoría (por ${mostrarCantidad ? 'cantidad' : 'importe'})`
                        : `Top ${topPorCategoria} productos más vendidos por categoría (por ${mostrarCantidad ? 'cantidad' : 'importe'})`
                    }
                </span>
            </div>

            <style jsx>{`
                .categoria-row {
                    background-color: #f0f0ff;
                }
                .producto-row {
                    background-color: #ffffff;
                }
                .top-productos-categoria-chart .recharts-cartesian-grid-horizontal line,
                .top-productos-categoria-chart .recharts-cartesian-grid-vertical line {
                    stroke: #e0e0e0;
                }
                .top-productos-categoria-chart .recharts-tooltip-wrapper {
                    z-index: 1000;
                }
                .top-productos-categoria-chart .recharts-bar-rectangle:hover {
                    filter: brightness(0.9);
                    cursor: pointer;
                }
                .top-productos-categoria-chart .recharts-layer.recharts-bar-labels {
                    font-size: 11px;
                }
            `}</style>
        </div>
    );
};
