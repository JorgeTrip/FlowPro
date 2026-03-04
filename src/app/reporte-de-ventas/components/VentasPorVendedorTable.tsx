'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { ClipboardDocumentIcon, ClipboardDocumentCheckIcon } from '@heroicons/react/24/outline';

interface VentasPorVendedorTableProps {
    ventasPorVendedor: { resultado: Record<string, Record<string, { A: number; X: number }>> };
    cantidadesPorVendedor: { resultado: Record<string, Record<string, { A: number; X: number }>> };
    vendedorDebugLog?: string[];
}

export const VentasPorVendedorTable = ({ ventasPorVendedor, cantidadesPorVendedor, vendedorDebugLog }: VentasPorVendedorTableProps) => {
    const [mostrarCantidad, setMostrarCantidad] = useState<boolean>(false);
    const [mostrarTotales, setMostrarTotales] = useState<boolean>(true);
    const [ordenAscendente, setOrdenAscendente] = useState<boolean>(false);
    const [vendedoresSeleccionados, setVendedoresSeleccionados] = useState<string[]>([]);
    const [mesesSeleccionados, setMesesSeleccionados] = useState<string[]>([]);
    const [modoVista, setModoVista] = useState<'acumulado' | 'comparativo'>('acumulado');
    const [copied, setCopied] = useState(false);
    const [dropdownVendedoresOpen, setDropdownVendedoresOpen] = useState(false);
    const [dropdownMesesOpen, setDropdownMesesOpen] = useState(false);

    // Obtener todos los meses disponibles
    const mesesConDatos = useMemo(() => {
        const meses = new Set<string>();
        Object.keys(ventasPorVendedor.resultado).forEach(mes => meses.add(mes));
        Object.keys(cantidadesPorVendedor.resultado).forEach(mes => meses.add(mes));
        return Array.from(meses);
    }, [ventasPorVendedor, cantidadesPorVendedor]);

    // Obtener todos los vendedores disponibles
    const todosLosVendedores = useMemo(() => {
        const vendedores = new Set<string>();
        Object.entries(ventasPorVendedor.resultado).forEach(([_, subvendedores]) => {
            Object.keys(subvendedores).forEach(subvendedor => {
                vendedores.add(subvendedor || 'Sin vendedor');
            });
        });
        return Array.from(vendedores);
    }, [ventasPorVendedor]);

    // Inicializar selecciones
    useEffect(() => {
        if (vendedoresSeleccionados.length === 0 && todosLosVendedores.length > 0) {
            setVendedoresSeleccionados(todosLosVendedores);
        }
    }, [todosLosVendedores, vendedoresSeleccionados.length]);

    useEffect(() => {
        if (mesesSeleccionados.length === 0 && mesesConDatos.length > 0) {
            setMesesSeleccionados(mesesConDatos);
        }
    }, [mesesConDatos, mesesSeleccionados.length]);

    const handleCopyLog = useCallback(async () => {
        if (!vendedorDebugLog?.length) return;
        try {
            await navigator.clipboard.writeText(vendedorDebugLog.join('\n'));
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            console.error('Error al copiar al portapapeles');
        }
    }, [vendedorDebugLog]);

    const handleVendedorToggle = (vendedor: string) => {
        setVendedoresSeleccionados(prev =>
            prev.includes(vendedor) ? prev.filter(v => v !== vendedor) : [...prev, vendedor]
        );
    };

    const handleMesToggle = (mes: string) => {
        setMesesSeleccionados(prev =>
            prev.includes(mes) ? prev.filter(m => m !== mes) : [...prev, mes]
        );
    };

    // Procesar y filtrar datos
    const datosProcesados = useMemo(() => {
        if (modoVista === 'acumulado') {
            const mapaAgrupado: Record<string, any> = {};

            mesesSeleccionados.forEach(mes => {
                const subvendedores = ventasPorVendedor.resultado[mes] || {};
                Object.entries(subvendedores).forEach(([_subvendedor, data]) => {
                    const nombreVendedor = _subvendedor || 'Sin vendedor';

                    if (vendedoresSeleccionados.includes(nombreVendedor)) {
                        if (!mapaAgrupado[nombreVendedor]) {
                            mapaAgrupado[nombreVendedor] = {
                                vendedor: nombreVendedor,
                                importeA: 0, importeX: 0, cantidadA: 0, cantidadX: 0, total: 0, totalCantidad: 0
                            };
                        }

                        const cantidades = cantidadesPorVendedor.resultado[mes]?.[_subvendedor] || { A: 0, X: 0 };
                        mapaAgrupado[nombreVendedor].importeA += data.A || 0;
                        mapaAgrupado[nombreVendedor].importeX += data.X || 0;
                        mapaAgrupado[nombreVendedor].cantidadA += cantidades.A || 0;
                        mapaAgrupado[nombreVendedor].cantidadX += cantidades.X || 0;
                        mapaAgrupado[nombreVendedor].total += (data.A || 0) + (data.X || 0);
                        mapaAgrupado[nombreVendedor].totalCantidad += (cantidades.A || 0) + (cantidades.X || 0);
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
            const mapaComparativo: Record<string, any> = {};

            vendedoresSeleccionados.forEach(vendedor => {
                mapaComparativo[vendedor] = {
                    vendedor,
                    totalGlobalImporte: 0,
                    totalGlobalCantidad: 0,
                    meses: {}
                };

                mesesSeleccionados.forEach(mes => {
                    const dataImp = ventasPorVendedor.resultado[mes]?.[vendedor] || { A: 0, X: 0 };
                    const dataCant = cantidadesPorVendedor.resultado[mes]?.[vendedor] || { A: 0, X: 0 };

                    const importeTotal = (dataImp.A || 0) + (dataImp.X || 0);
                    const cantidadTotal = (dataCant.A || 0) + (dataCant.X || 0);

                    mapaComparativo[vendedor].meses[mes] = {
                        importeA: dataImp.A || 0,
                        importeX: dataImp.X || 0,
                        cantidadA: dataCant.A || 0,
                        cantidadX: dataCant.X || 0,
                        totalImporte: importeTotal,
                        totalCantidad: cantidadTotal
                    };

                    mapaComparativo[vendedor].totalGlobalImporte += importeTotal;
                    mapaComparativo[vendedor].totalGlobalCantidad += cantidadTotal;
                });
            });

            const datos = Object.values(mapaComparativo).filter(d =>
                mostrarCantidad ? d.totalGlobalCantidad > 0 : d.totalGlobalImporte > 0
            );

            datos.sort((a, b) => {
                const valorA = mostrarCantidad ? a.totalGlobalCantidad : a.totalGlobalImporte;
                const valorB = mostrarCantidad ? b.totalGlobalCantidad : b.totalGlobalImporte;
                return ordenAscendente ? valorA - valorB : valorB - valorA;
            });
            return datos;
        }
    }, [ventasPorVendedor, cantidadesPorVendedor, vendedoresSeleccionados, mesesSeleccionados, mostrarCantidad, ordenAscendente, modoVista]);

    const totalesAcumulados = useMemo(() => {
        if (modoVista !== 'acumulado') return null;
        return datosProcesados.reduce((acc, item) => ({
            importeA: acc.importeA + item.importeA,
            importeX: acc.importeX + item.importeX,
            cantidadA: acc.cantidadA + item.cantidadA,
            cantidadX: acc.cantidadX + item.cantidadX,
            total: acc.total + item.total,
            totalCantidad: acc.totalCantidad + item.totalCantidad
        }), { importeA: 0, importeX: 0, cantidadA: 0, cantidadX: 0, total: 0, totalCantidad: 0 });
    }, [datosProcesados, modoVista]);

    const totalesComparativos = useMemo(() => {
        if (modoVista !== 'comparativo') return null;

        const totales = {
            totalGlobalImporte: 0,
            totalGlobalCantidad: 0,
            meses: {} as Record<string, any>
        };

        mesesSeleccionados.forEach(mes => {
            totales.meses[mes] = { importeA: 0, importeX: 0, cantidadA: 0, cantidadX: 0, totalImporte: 0, totalCantidad: 0 };
        });

        datosProcesados.forEach(item => {
            totales.totalGlobalImporte += item.totalGlobalImporte;
            totales.totalGlobalCantidad += item.totalGlobalCantidad;

            mesesSeleccionados.forEach(mes => {
                if (item.meses[mes]) {
                    totales.meses[mes].importeA += item.meses[mes].importeA;
                    totales.meses[mes].importeX += item.meses[mes].importeX;
                    totales.meses[mes].cantidadA += item.meses[mes].cantidadA;
                    totales.meses[mes].cantidadX += item.meses[mes].cantidadX;
                    totales.meses[mes].totalImporte += item.meses[mes].totalImporte;
                    totales.meses[mes].totalCantidad += item.meses[mes].totalCantidad;
                }
            });
        });

        return totales;
    }, [datosProcesados, modoVista, mesesSeleccionados]);


    const formatCurrency = (value: number) => value.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });
    const formatQuantity = (value: number) => value.toLocaleString('es-AR');

    const exportarDatos = () => {
        let headers: string[] = [];
        let rows: any[] = [];

        if (modoVista === 'acumulado') {
            headers = mostrarCantidad
                ? ['Vendedor', 'Cant. Facturas', 'Cant. Remitos', 'Total Cantidad']
                : ['Vendedor', 'Imp. Facturas', 'Imp. Remitos', 'Total Importe'];

            rows = datosProcesados.map(item => mostrarCantidad
                ? [item.vendedor, item.cantidadA, item.cantidadX, item.totalCantidad]
                : [item.vendedor, item.importeA, item.importeX, item.total]
            );

            if (mostrarTotales && totalesAcumulados) {
                rows.push(mostrarCantidad
                    ? ['TOTAL', totalesAcumulados.cantidadA, totalesAcumulados.cantidadX, totalesAcumulados.totalCantidad]
                    : ['TOTAL', totalesAcumulados.importeA, totalesAcumulados.importeX, totalesAcumulados.total]
                );
            }
        } else {
            // Modo Comparativo Exp
            headers = ['Vendedor'];
            mesesSeleccionados.forEach(mes => {
                headers.push(`${mes} (Facturas)`);
                headers.push(`${mes} (Remitos)`);
                headers.push(`${mes} (Total)`);
            });
            headers.push('TOTAL GLOBAL');

            rows = datosProcesados.map(item => {
                const row: any[] = [item.vendedor];
                mesesSeleccionados.forEach(mes => {
                    const d = item.meses[mes];
                    if (mostrarCantidad) {
                        row.push(d.cantidadA, d.cantidadX, d.totalCantidad);
                    } else {
                        row.push(d.importeA, d.importeX, d.totalImporte);
                    }
                });
                row.push(mostrarCantidad ? item.totalGlobalCantidad : item.totalGlobalImporte);
                return row;
            });

            if (mostrarTotales && totalesComparativos) {
                const totalRow: any[] = ['TOTAL'];
                mesesSeleccionados.forEach(mes => {
                    const d = totalesComparativos.meses[mes];
                    if (mostrarCantidad) {
                        totalRow.push(d.cantidadA, d.cantidadX, d.totalCantidad);
                    } else {
                        totalRow.push(d.importeA, d.importeX, d.totalImporte);
                    }
                });
                totalRow.push(mostrarCantidad ? totalesComparativos.totalGlobalCantidad : totalesComparativos.totalGlobalImporte);
                rows.push(totalRow);
            }
        }

        const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ventas-por-vendedor-${mostrarCantidad ? 'cantidad' : 'importe'}-${modoVista}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
            {/* Header con controles */}
            <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                        Ventas por Vendedor
                    </h4>

                    <div className="flex flex-wrap items-center gap-3">
                        {/* Botón de debug log */}
                        {vendedorDebugLog && vendedorDebugLog.length > 0 && (
                            <button
                                onClick={handleCopyLog}
                                className="inline-flex items-center px-2 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 dark:bg-gray-600 dark:text-gray-400 dark:border-gray-500 dark:hover:bg-gray-500 transition-colors"
                                title="Copiar log de cruce de vendedores al portapapeles"
                            >
                                {copied ? (
                                    <><ClipboardDocumentCheckIcon className="w-3.5 h-3.5 mr-1 text-green-500" /> Copiado</>
                                ) : (
                                    <><ClipboardDocumentIcon className="w-3.5 h-3.5 mr-1" /> Log debug</>
                                )}
                            </button>
                        )}

                        {/* Filtro de Meses */}
                        <div className="relative">
                            <button
                                className="bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-36 p-2 text-left"
                                onClick={() => setDropdownMesesOpen(!dropdownMesesOpen)}
                            >
                                Meses ({mesesSeleccionados.length})
                            </button>

                            {dropdownMesesOpen && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setDropdownMesesOpen(false)}></div>
                                    <div className="absolute top-full left-0 mt-1 w-56 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto">
                                        <div className="p-3">
                                            <div className="flex gap-2 mb-3">
                                                <button onClick={() => setMesesSeleccionados(mesesConDatos)} className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600">Todos</button>
                                                <button onClick={() => setMesesSeleccionados([])} className="text-xs bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600">Ninguno</button>
                                            </div>
                                            {mesesConDatos.map(mes => (
                                                <label key={mes} className="flex items-center mb-2 cursor-pointer">
                                                    <input type="checkbox" checked={mesesSeleccionados.includes(mes)} onChange={() => handleMesToggle(mes)} className="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                                    <span className="text-sm text-gray-900 dark:text-white">{mes}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Filtro de vendedores */}
                        <div className="relative">
                            <button
                                className="bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-36 p-2 text-left"
                                onClick={() => setDropdownVendedoresOpen(!dropdownVendedoresOpen)}
                            >
                                Vendedores ({vendedoresSeleccionados.length})
                            </button>

                            {dropdownVendedoresOpen && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setDropdownVendedoresOpen(false)}></div>
                                    <div className="absolute top-full left-0 lg:right-auto mt-1 w-64 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto">
                                        <div className="p-3">
                                            <div className="flex gap-2 mb-3">
                                                <button onClick={() => setVendedoresSeleccionados(todosLosVendedores)} className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600">Todos</button>
                                                <button onClick={() => setVendedoresSeleccionados([])} className="text-xs bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600">Limpiar</button>
                                            </div>
                                            {todosLosVendedores.map(vendedor => (
                                                <label key={vendedor} className="flex items-center mb-2 cursor-pointer">
                                                    <input type="checkbox" checked={vendedoresSeleccionados.includes(vendedor)} onChange={() => handleVendedorToggle(vendedor)} className="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                                    <span className="text-sm text-gray-900 dark:text-white">{vendedor}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Switch ordenamiento */}
                        <label className="flex items-center cursor-pointer">
                            <input type="checkbox" checked={ordenAscendente} onChange={(e) => setOrdenAscendente(e.target.checked)} className="sr-only peer" />
                            <div className="border border-gray-300 dark:border-gray-500 relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[1px] after:left-[1px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                            <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">{ordenAscendente ? '↑ Asc' : '↓ Desc'}</span>
                        </label>

                        {/* Switch cantidad/importe */}
                        <label className="flex items-center cursor-pointer">
                            <input type="checkbox" checked={mostrarCantidad} onChange={(e) => setMostrarCantidad(e.target.checked)} className="sr-only peer" />
                            <div className="border border-gray-300 dark:border-gray-500 relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[1px] after:left-[1px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                            <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">{mostrarCantidad ? 'Cantidad' : 'Importe'}</span>
                        </label>

                        {/* Switch mostrar totales */}
                        <label className="flex items-center cursor-pointer">
                            <input type="checkbox" checked={mostrarTotales} onChange={(e) => setMostrarTotales(e.target.checked)} className="sr-only peer" />
                            <div className="border border-gray-300 dark:border-gray-500 relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[1px] after:left-[1px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                            <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">Totales</span>
                        </label>

                        {/* Toggle Acumulado/Comparativo */}
                        <select
                            value={modoVista}
                            onChange={(e) => setModoVista(e.target.value as 'acumulado' | 'comparativo')}
                            className="bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2"
                        >
                            <option value="acumulado">Acumulado</option>
                            <option value="comparativo" disabled={mesesSeleccionados.length < 2}>Comparativo</option>
                        </select>

                        {/* Botón exportar */}
                        <button onClick={exportarDatos} className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors">
                            📊 Exportar
                        </button>
                    </div>
                </div>
            </div>

            {/* Tabla */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        {modoVista === 'acumulado' ? (
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                    Vendedor
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                    {mostrarCantidad ? 'Cant. Facturas' : 'Imp. Facturas'}
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                    {mostrarCantidad ? 'Cant. Remitos' : 'Imp. Remitos'}
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                    {mostrarCantidad ? 'Total Cantidad' : 'Total Importe'}
                                </th>
                            </tr>
                        ) : (
                            // Headers para comparativo
                            <tr>
                                <th rowSpan={2} className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700 align-middle">
                                    Vendedor
                                </th>
                                {mesesSeleccionados.map(mes => (
                                    <th key={mes} colSpan={3} className="px-4 py-2 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                                        {mes}
                                    </th>
                                ))}
                                <th rowSpan={2} className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700 align-middle">
                                    TOTAL GLOBAL
                                </th>
                            </tr>
                        )}
                        {modoVista === 'comparativo' && (
                            <tr>
                                {mesesSeleccionados.map(mes => (
                                    <React.Fragment key={`${mes}-sub`}>
                                        <th className="px-4 py-2 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                                            {mostrarCantidad ? 'Fact' : 'Fact'}
                                        </th>
                                        <th className="px-4 py-2 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                                            {mostrarCantidad ? 'Rem' : 'Rem'}
                                        </th>
                                        <th className="px-4 py-2 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                                            Total
                                        </th>
                                    </React.Fragment>
                                ))}
                            </tr>
                        )}
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                        {datosProcesados.map((item, index) => (
                            modoVista === 'acumulado' ? (
                                <tr key={item.vendedor} className={index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'}>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                                        👤 {item.vendedor}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                        {mostrarCantidad ? formatQuantity(item.cantidadA) : formatCurrency(item.importeA)}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                        {mostrarCantidad ? formatQuantity(item.cantidadX) : formatCurrency(item.importeX)}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                                        {mostrarCantidad ? formatQuantity(item.totalCantidad) : formatCurrency(item.total)}
                                    </td>
                                </tr>
                            ) : (
                                <tr key={item.vendedor} className={index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'}>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">
                                        👤 {item.vendedor}
                                    </td>
                                    {mesesSeleccionados.map(mes => {
                                        const mesData = item.meses[mes];
                                        return (
                                            <React.Fragment key={`${item.vendedor}-${mes}`}>
                                                <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-500 dark:text-gray-400">
                                                    {mostrarCantidad ? formatQuantity(mesData.cantidadA) : formatCurrency(mesData.importeA)}
                                                </td>
                                                <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-500 dark:text-gray-400">
                                                    {mostrarCantidad ? formatQuantity(mesData.cantidadX) : formatCurrency(mesData.importeX)}
                                                </td>
                                                <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-medium text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">
                                                    {mostrarCantidad ? formatQuantity(mesData.totalCantidad) : formatCurrency(mesData.totalImporte)}
                                                </td>
                                            </React.Fragment>
                                        );
                                    })}
                                    <td className="whitespace-nowrap px-6 py-4 text-center text-sm font-bold text-blue-700 dark:text-blue-300">
                                        {mostrarCantidad ? formatQuantity(item.totalGlobalCantidad) : formatCurrency(item.totalGlobalImporte)}
                                    </td>
                                </tr>
                            )
                        ))}

                        {/* Fila de totales */}
                        {mostrarTotales && modoVista === 'acumulado' && totalesAcumulados && (
                            <tr className="bg-blue-50 dark:bg-blue-900/20 border-t-2 border-blue-200 dark:border-blue-700">
                                <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-blue-900 dark:text-blue-300">
                                    TOTAL
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-blue-900 dark:text-blue-300">
                                    {mostrarCantidad ? formatQuantity(totalesAcumulados.cantidadA) : formatCurrency(totalesAcumulados.importeA)}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-blue-900 dark:text-blue-300">
                                    {mostrarCantidad ? formatQuantity(totalesAcumulados.cantidadX) : formatCurrency(totalesAcumulados.importeX)}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-blue-900 dark:text-blue-300">
                                    {mostrarCantidad ? formatQuantity(totalesAcumulados.totalCantidad) : formatCurrency(totalesAcumulados.total)}
                                </td>
                            </tr>
                        )}
                        {mostrarTotales && modoVista === 'comparativo' && totalesComparativos && (
                            <tr className="bg-blue-50 dark:bg-blue-900/20 border-t-2 border-blue-200 dark:border-blue-700">
                                <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-blue-900 dark:text-blue-300 border-r border-blue-200 dark:border-blue-700">
                                    TOTAL
                                </td>
                                {mesesSeleccionados.map(mes => {
                                    const mesTotal = totalesComparativos.meses[mes];
                                    return (
                                        <React.Fragment key={`total-${mes}`}>
                                            <td className="whitespace-nowrap px-4 py-4 text-right text-sm font-bold text-blue-900 dark:text-blue-300">
                                                {mostrarCantidad ? formatQuantity(mesTotal.cantidadA) : formatCurrency(mesTotal.importeA)}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-4 text-right text-sm font-bold text-blue-900 dark:text-blue-300">
                                                {mostrarCantidad ? formatQuantity(mesTotal.cantidadX) : formatCurrency(mesTotal.importeX)}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-4 text-right text-sm font-bold text-blue-900 dark:text-blue-300 border-r border-blue-200 dark:border-blue-700">
                                                {mostrarCantidad ? formatQuantity(mesTotal.totalCantidad) : formatCurrency(mesTotal.totalImporte)}
                                            </td>
                                        </React.Fragment>
                                    );
                                })}
                                <td className="whitespace-nowrap px-6 py-4 text-center text-sm font-bold text-blue-900 dark:text-blue-300">
                                    {mostrarCantidad ? formatQuantity(totalesComparativos.totalGlobalCantidad) : formatCurrency(totalesComparativos.totalGlobalImporte)}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

