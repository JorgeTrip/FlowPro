'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { exportToExcel } from '../lib/exportUtils';
import { MultiSelectDropdown } from './shared/ControlPanel';

interface VentasPorZonaTableProps {
    ventasPorZona: Record<string, Record<string, { A: number; X: number }>>;
    cantidadesPorZona: Record<string, Record<string, { A: number; X: number }>>;
}

export const VentasPorZonaTable = ({ ventasPorZona, cantidadesPorZona }: VentasPorZonaTableProps) => {
    const [mostrarCantidad, setMostrarCantidad] = useState<boolean>(false);
    const [mostrarTotales, setMostrarTotales] = useState<boolean>(true);
    const [ordenAscendente, setOrdenAscendente] = useState<boolean>(false);
    const [zonasSeleccionadas, setZonasSeleccionadas] = useState<string[]>([]);

    // Nuevos estados para comparativa
    const [modoVista, setModoVista] = useState<'acumulado' | 'comparativo'>('acumulado');
    const [mostrarVariacion, setMostrarVariacion] = useState<boolean>(true);
    const [mesesSeleccionados, setMesesSeleccionados] = useState<string[]>([]);

    const meses = useMemo(() => [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ], []);

    // Obtener todas las zonas disponibles
    const todasLasZonas = useMemo(() => {
        const zonas = new Set<string>();
        Object.entries(ventasPorZona).forEach(([_zona, subzonas]) => {
            Object.keys(subzonas).forEach(subzona => {
                zonas.add(subzona || 'Sin zona');
            });
        });
        return Array.from(zonas);
    }, [ventasPorZona]);

    // Obtener meses con datos
    const mesesConDatos = useMemo(() => {
        const mesesSet = new Set<string>();
        Object.entries(ventasPorZona).forEach(([mes, zonas]) => {
            const hasData = Object.values(zonas).some(r => (r.A || 0) > 0 || (r.X || 0) > 0);
            if (hasData) mesesSet.add(mes);
        });
        Object.entries(cantidadesPorZona).forEach(([mes, zonas]) => {
            const hasData = Object.values(zonas).some(r => (r.A || 0) > 0 || (r.X || 0) > 0);
            if (hasData) mesesSet.add(mes);
        });
        
        const ordenMeses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        return Array.from(mesesSet).sort((a, b) => {
             return ordenMeses.indexOf(a) - ordenMeses.indexOf(b);
        });
    }, [ventasPorZona, cantidadesPorZona]);

    // Inicializar selecciones
    useEffect(() => {
        if (zonasSeleccionadas.length === 0) {
            setZonasSeleccionadas(todasLasZonas);
        }
    }, [todasLasZonas, zonasSeleccionadas.length]);

    useEffect(() => {
        if (mesesSeleccionados.length === 0 && mesesConDatos.length > 0) {
            setMesesSeleccionados(mesesConDatos);
        }
    }, [mesesConDatos, mesesSeleccionados.length]);

    // Procesar y filtrar datos
    const datosProcesados = useMemo(() => {
        if (modoVista === 'acumulado') {
            const mapaAgrupado: Record<string, {
                zona: string;
                importeA: number;
                importeX: number;
                cantidadA: number;
                cantidadX: number;
                total: number;
                totalCantidad: number;
            }> = {};

            mesesSeleccionados.forEach(mes => {
                const subzonas = ventasPorZona[mes];
                if (!subzonas) return;

                Object.entries(subzonas).forEach(([subzona, data]) => {
                    const nombreZona = subzona || 'Sin zona';

                    if (zonasSeleccionadas.includes(nombreZona)) {
                        if (!mapaAgrupado[nombreZona]) {
                            mapaAgrupado[nombreZona] = {
                                zona: nombreZona,
                                importeA: 0,
                                importeX: 0,
                                cantidadA: 0,
                                cantidadX: 0,
                                total: 0,
                                totalCantidad: 0
                            };
                        }

                        const cantidades = cantidadesPorZona[mes]?.[subzona] || { A: 0, X: 0 };

                        mapaAgrupado[nombreZona].importeA += data.A || 0;
                        mapaAgrupado[nombreZona].importeX += data.X || 0;
                        mapaAgrupado[nombreZona].cantidadA += cantidades.A || 0;
                        mapaAgrupado[nombreZona].cantidadX += cantidades.X || 0;
                        mapaAgrupado[nombreZona].total += (data.A || 0) + (data.X || 0);
                        mapaAgrupado[nombreZona].totalCantidad += (cantidades.A || 0) + (cantidades.X || 0);
                    }
                });
            });

            const datos = Object.values(mapaAgrupado);

            datos.sort((a, b) => {
                const valorA = mostrarCantidad ? a.totalCantidad : a.total;
                const valorB = mostrarCantidad ? b.totalCantidad : b.total;
                return ordenAscendente ? valorA - valorB : valorB - valorA;
            });

            return datos;
        } else {
            // Modo Comparativo
            const mapaZonas: Record<string, any> = {};
            
            zonasSeleccionadas.forEach(zona => {
                mapaZonas[zona] = {
                    zona,
                    meses: {},
                    variaciones: {},
                    total: 0
                };
            });
            
            mesesSeleccionados.forEach((mes, index) => {
                zonasSeleccionadas.forEach(zona => {
                    const dataVenta = ventasPorZona[mes]?.[zona] || { A: 0, X: 0 };
                    const dataCant = cantidadesPorZona[mes]?.[zona] || { A: 0, X: 0 };
                    
                    const valImporte = (dataVenta.A || 0) + (dataVenta.X || 0);
                    const valCant = (dataCant.A || 0) + (dataCant.X || 0);
                    
                    const valorActual = mostrarCantidad ? valCant : valImporte;
                    
                    if (mapaZonas[zona]) {
                        mapaZonas[zona].meses[mes] = valorActual;
                        mapaZonas[zona].total += valorActual;
                        
                        // Variación
                        if (index > 0 && mostrarVariacion) {
                            const mesAnterior = mesesSeleccionados[index - 1];
                            const valorAnterior = mapaZonas[zona].meses[mesAnterior] || 0;
                            if (valorAnterior > 0) {
                                mapaZonas[zona].variaciones[mes] = ((valorActual - valorAnterior) / valorAnterior) * 100;
                            }
                        }
                    }
                });
            });
            
            const datos = Object.values(mapaZonas).filter((item: any) => item.total > 0);
            
            datos.sort((a: any, b: any) => {
                return ordenAscendente ? a.total - b.total : b.total - a.total;
            });
            
            return datos;
        }
    }, [ventasPorZona, cantidadesPorZona, zonasSeleccionadas, mesesSeleccionados, mostrarCantidad, ordenAscendente, modoVista, mostrarVariacion]);

    // Calcular totales
    const totales = useMemo(() => {
        if (modoVista === 'acumulado') {
            return (datosProcesados as any[]).reduce((acc, item) => ({
                importeA: acc.importeA + item.importeA,
                importeX: acc.importeX + item.importeX,
                cantidadA: acc.cantidadA + item.cantidadA,
                cantidadX: acc.cantidadX + item.cantidadX,
                total: acc.total + item.total,
                totalCantidad: acc.totalCantidad + item.totalCantidad
            }), {
                importeA: 0, importeX: 0, cantidadA: 0, cantidadX: 0, total: 0, totalCantidad: 0
            });
        } else {
            const totalesMeses: Record<string, number> = {};
            let granTotal = 0;
            
            mesesSeleccionados.forEach(mes => {
                totalesMeses[mes] = (datosProcesados as any[]).reduce((sum, item) => sum + (item.meses[mes] || 0), 0);
                granTotal += totalesMeses[mes];
            });
            
            return { totalesMeses, granTotal };
        }
    }, [datosProcesados, modoVista, mesesSeleccionados]);

    const formatCurrency = (value: number) => {
        return value.toLocaleString('es-AR', {
            style: 'currency',
            currency: 'ARS',
            maximumFractionDigits: 0
        });
    };

    const formatQuantity = (value: number) => {
        return value.toLocaleString('es-AR');
    };

    const handleZonaToggle = (zona: string) => {
        setZonasSeleccionadas(prev =>
            prev.includes(zona)
                ? prev.filter(z => z !== zona)
                : [...prev, zona]
        );
    };

    const seleccionarTodasZonas = () => {
        setZonasSeleccionadas(todasLasZonas);
    };

    const limpiarZonas = () => {
        setZonasSeleccionadas([]);
    };

    const exportarDatos = () => {
        if (modoVista === 'acumulado') {
            const headers = mostrarCantidad
                ? ['Zona', 'Cant. Facturas', 'Cant. Remitos', 'Total Cantidad']
                : ['Zona', 'Imp. Facturas', 'Imp. Remitos', 'Total Importe'];

            const rows = (datosProcesados as any[]).map(item => mostrarCantidad
                ? [item.zona, item.cantidadA, item.cantidadX, item.totalCantidad]
                : [item.zona, item.importeA, item.importeX, item.total]
            );

            if (mostrarTotales) {
                const t = totales as any;
                rows.push(mostrarCantidad
                    ? ['TOTAL', t.cantidadA, t.cantidadX, t.totalCantidad]
                    : ['TOTAL', t.importeA, t.importeX, t.total]
                );
            }

            exportToExcel([headers, ...rows], `ventas-por-zona-${mostrarCantidad ? 'cantidad' : 'importe'}`, 'Ventas Por Zona');
        } else {
            const headers = ['Zona'];
            mesesSeleccionados.forEach((mes, idx) => {
                headers.push(`${mes} (${mostrarCantidad ? 'Cant' : 'Imp'})`);
                if (mostrarVariacion && idx > 0) headers.push('Var %');
            });
            headers.push('Total');
            
            const rows = (datosProcesados as any[]).map(item => {
                const row = [item.zona];
                mesesSeleccionados.forEach((mes, idx) => {
                    row.push(item.meses[mes] || 0);
                    if (mostrarVariacion && idx > 0) {
                        row.push(item.variaciones[mes] !== undefined ? `${item.variaciones[mes].toFixed(1)}%` : '-');
                    }
                });
                row.push(item.total);
                return row;
            });
            
            if (mostrarTotales) {
                const t = totales as any;
                const row = ['TOTAL'];
                mesesSeleccionados.forEach((mes, idx) => {
                    row.push(t.totalesMeses[mes]);
                    if (mostrarVariacion && idx > 0) row.push('-');
                });
                row.push(t.granTotal);
                rows.push(row);
            }
            
            exportToExcel([headers, ...rows], `ventas-por-zona-comparativo`, 'Ventas Por Zona Comparativo');
        }
    };

    return (
        <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
            {/* Header con controles */}
            <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                        Ventas por Zona
                    </h4>

                    <div className="flex flex-wrap items-center gap-3">
                        {/* Selector de Vista */}
                        <select
                            value={modoVista}
                            onChange={(e) => setModoVista(e.target.value as 'acumulado' | 'comparativo')}
                            className="bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2"
                        >
                            <option value="acumulado">Acumulado</option>
                            <option value="comparativo">Comparativo Mes a Mes</option>
                        </select>

                        {/* Filtro de Meses */}
                        <MultiSelectDropdown
                            label="Meses"
                            options={meses}
                            selected={mesesSeleccionados}
                            onChange={setMesesSeleccionados}
                            optionsWithData={mesesConDatos}
                        />

                        {/* Filtro de zonas */}
                        <div className="relative">
                            <button
                                className="bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-32 p-2 text-left truncate"
                                onClick={() => {
                                    const popup = document.getElementById('zonas-popup');
                                    popup?.classList.toggle('hidden');
                                }}
                            >
                                Zonas ({zonasSeleccionadas.length})
                            </button>

                            <div id="zonas-popup" className="hidden absolute top-full left-0 mt-1 w-64 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                                <div className="p-3">
                                    <div className="flex gap-2 mb-3">
                                        <button
                                            onClick={seleccionarTodasZonas}
                                            className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                                        >
                                            Todas
                                        </button>
                                        <button
                                            onClick={limpiarZonas}
                                            className="text-xs bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600"
                                        >
                                            Limpiar
                                        </button>
                                    </div>

                                    {todasLasZonas.map(zona => (
                                        <label key={zona} className="flex items-center mb-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={zonasSeleccionadas.includes(zona)}
                                                onChange={() => handleZonaToggle(zona)}
                                                className="mr-2"
                                            />
                                            <span className="text-sm text-gray-900 dark:text-white">
                                                {zona}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Switch ordenamiento */}
                        <label className="flex items-center cursor-pointer" title="Orden Ascendente/Descendente">
                            <input
                                type="checkbox"
                                checked={ordenAscendente}
                                onChange={(e) => setOrdenAscendente(e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="relative w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                            <span className="ml-2 text-xs font-medium text-gray-900 dark:text-gray-300">
                                {ordenAscendente ? 'Asc' : 'Desc'}
                            </span>
                        </label>

                        {/* Switch cantidad/importe */}
                        <label className="flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={mostrarCantidad}
                                onChange={(e) => setMostrarCantidad(e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="relative w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                            <span className="ml-2 text-xs font-medium text-gray-900 dark:text-gray-300">
                                {mostrarCantidad ? 'Cant' : 'Imp'}
                            </span>
                        </label>

                        {/* Switch mostrar totales */}
                        <label className="flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={mostrarTotales}
                                onChange={(e) => setMostrarTotales(e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="relative w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                            <span className="ml-2 text-xs font-medium text-gray-900 dark:text-gray-300">
                                Totales
                            </span>
                        </label>

                        {/* Switch Variación (Solo Comparativo) */}
                        {modoVista === 'comparativo' && (
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={mostrarVariacion}
                                    onChange={(e) => setMostrarVariacion(e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="relative w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                <span className="ml-2 text-xs font-medium text-gray-900 dark:text-gray-300">
                                    Var %
                                </span>
                            </label>
                        )}

                        {/* Botón exportar */}
                        <button
                            onClick={exportarDatos}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium py-2 px-3 rounded-lg transition-colors"
                        >
                            Exportar
                        </button>
                    </div>
                </div>
            </div>

            {/* Tabla */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 sticky left-0 bg-gray-50 dark:bg-gray-700 z-10">
                                Zona
                            </th>
                            {modoVista === 'acumulado' ? (
                                mostrarCantidad ? (
                                    <>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Cant. Facturas</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Cant. Remitos</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Total Cantidad</th>
                                    </>
                                ) : (
                                    <>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Imp. Facturas</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Imp. Remitos</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Total Importe</th>
                                    </>
                                )
                            ) : (
                                <>
                                    {mesesSeleccionados.map((mes, idx) => (
                                        <React.Fragment key={mes}>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                                {mes}
                                            </th>
                                            {mostrarVariacion && idx > 0 && (
                                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                                    Var %
                                                </th>
                                            )}
                                        </React.Fragment>
                                    ))}
                                    <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-bold">
                                        Total
                                    </th>
                                </>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                        {(datosProcesados as any[]).map((item, index) => (
                            <tr key={item.zona} className={index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'}>
                                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white sticky left-0 bg-inherit">
                                    📍 {item.zona}
                                </td>
                                {modoVista === 'acumulado' ? (
                                    mostrarCantidad ? (
                                        <>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{formatQuantity(item.cantidadA)}</td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{formatQuantity(item.cantidadX)}</td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{formatQuantity(item.totalCantidad)}</td>
                                        </>
                                    ) : (
                                        <>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{formatCurrency(item.importeA)}</td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{formatCurrency(item.importeX)}</td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(item.total)}</td>
                                        </>
                                    )
                                ) : (
                                    <>
                                        {mesesSeleccionados.map((mes, idx) => (
                                            <React.Fragment key={mes}>
                                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                                    {mostrarCantidad ? formatQuantity(item.meses[mes] || 0) : formatCurrency(item.meses[mes] || 0)}
                                                </td>
                                                {mostrarVariacion && idx > 0 && (
                                                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                                                        {item.variaciones[mes] !== undefined ? (
                                                            <span className={item.variaciones[mes] > 0 ? 'text-green-600 dark:text-green-400' : item.variaciones[mes] < 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}>
                                                                {item.variaciones[mes] > 0 ? '+' : ''}{item.variaciones[mes].toFixed(1)}%
                                                            </span>
                                                        ) : (
                                                            <span className="text-gray-400 dark:text-gray-600">-</span>
                                                        )}
                                                    </td>
                                                )}
                                            </React.Fragment>
                                        ))}
                                        <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-gray-900 dark:text-white">
                                            {mostrarCantidad ? formatQuantity(item.total) : formatCurrency(item.total)}
                                        </td>
                                    </>
                                )}
                            </tr>
                        ))}

                        {/* Fila de totales */}
                        {mostrarTotales && (
                            <tr className="bg-blue-50 dark:bg-blue-900/20 border-t-2 border-blue-200 dark:border-blue-700">
                                <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-blue-900 dark:text-blue-300 sticky left-0 bg-blue-50 dark:bg-blue-900/20">
                                    📊 TOTAL
                                </td>
                                {modoVista === 'acumulado' ? (
                                    mostrarCantidad ? (
                                        <>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-blue-900 dark:text-blue-300">{(totales as any).cantidadA ? formatQuantity((totales as any).cantidadA) : 0}</td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-blue-900 dark:text-blue-300">{(totales as any).cantidadX ? formatQuantity((totales as any).cantidadX) : 0}</td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-blue-900 dark:text-blue-300">{(totales as any).totalCantidad ? formatQuantity((totales as any).totalCantidad) : 0}</td>
                                        </>
                                    ) : (
                                        <>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-blue-900 dark:text-blue-300">{(totales as any).importeA ? formatCurrency((totales as any).importeA) : 0}</td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-blue-900 dark:text-blue-300">{(totales as any).importeX ? formatCurrency((totales as any).importeX) : 0}</td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-blue-900 dark:text-blue-300">{(totales as any).total ? formatCurrency((totales as any).total) : 0}</td>
                                        </>
                                    )
                                ) : (
                                    <>
                                        {mesesSeleccionados.map((mes, idx) => (
                                            <React.Fragment key={mes}>
                                                <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-blue-900 dark:text-blue-300">
                                                    {mostrarCantidad ? formatQuantity((totales as any).totalesMeses[mes]) : formatCurrency((totales as any).totalesMeses[mes])}
                                                </td>
                                                {mostrarVariacion && idx > 0 && <td className="px-6 py-4"></td>}
                                            </React.Fragment>
                                        ))}
                                        <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-blue-900 dark:text-blue-300">
                                            {mostrarCantidad ? formatQuantity((totales as any).granTotal) : formatCurrency((totales as any).granTotal)}
                                        </td>
                                    </>
                                )}
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
