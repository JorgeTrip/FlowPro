'use client';

import React, { useState, useMemo } from 'react';
import { exportToExcel } from '../lib/exportUtils';

interface VentasMensualesTableProps {
    ventasPorMes: Record<string, { A: number; X: number }>;
    cantidadesPorMes: Record<string, { A: number; X: number }>;
}

export const VentasMensualesTable = ({ ventasPorMes, cantidadesPorMes }: VentasMensualesTableProps) => {
    const [filtroMeses, setFiltroMeses] = useState<'todos' | 'conDatos' | 'seleccionados'>('conDatos');
    const [mesesSeleccionados, setMesesSeleccionados] = useState<string[]>([]);
    const [mostrarCantidad, setMostrarCantidad] = useState<boolean>(false);
    const [mostrarTotales, setMostrarTotales] = useState<boolean>(true);
    const [mostrarVariacion, setMostrarVariacion] = useState<boolean>(false);

    const meses = useMemo(() => [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ], []);

    // Filtrar meses con datos
    const mesesConDatos = useMemo(() => {
        return meses.filter(mes => {
            const ventas = ventasPorMes[mes];
            const cantidades = cantidadesPorMes[mes];
            return (ventas?.A || 0) > 0 || (ventas?.X || 0) > 0 ||
                (cantidades?.A || 0) > 0 || (cantidades?.X || 0) > 0;
        });
    }, [ventasPorMes, cantidadesPorMes, meses]);

    // Datos filtrados según la selección
    const datosFiltrados = useMemo(() => {
        let mesesAMostrar: string[] = [];

        switch (filtroMeses) {
            case 'todos':
                mesesAMostrar = meses;
                break;
            case 'conDatos':
                mesesAMostrar = mesesConDatos;
                break;
            case 'seleccionados':
                mesesAMostrar = mesesSeleccionados.length > 0 ? mesesSeleccionados : mesesConDatos;
                break;
        }

        return mesesAMostrar.map((mes, index) => {
            const importeA = ventasPorMes[mes]?.A || 0;
            const importeX = ventasPorMes[mes]?.X || 0;
            const cantidadA = cantidadesPorMes[mes]?.A || 0;
            const cantidadX = cantidadesPorMes[mes]?.X || 0;
            const total = importeA + importeX;
            const totalCantidad = cantidadA + cantidadX;

            // Calcular variaciones
            let varImporteA = 0, varImporteX = 0, varTotal = 0;
            let varCantidadA = 0, varCantidadX = 0, varTotalCantidad = 0;
            let tieneVariacion = false;

            if (index > 0) {
                const mesAnterior = mesesAMostrar[index - 1];
                const importeAAnt = ventasPorMes[mesAnterior]?.A || 0;
                const importeXAnt = ventasPorMes[mesAnterior]?.X || 0;
                const cantidadAAnt = cantidadesPorMes[mesAnterior]?.A || 0;
                const cantidadXAnt = cantidadesPorMes[mesAnterior]?.X || 0;
                const totalAnt = importeAAnt + importeXAnt;
                const totalCantidadAnt = cantidadAAnt + cantidadXAnt;

                if (importeAAnt > 0) varImporteA = ((importeA - importeAAnt) / importeAAnt) * 100;
                if (importeXAnt > 0) varImporteX = ((importeX - importeXAnt) / importeXAnt) * 100;
                if (totalAnt > 0) varTotal = ((total - totalAnt) / totalAnt) * 100;
                if (cantidadAAnt > 0) varCantidadA = ((cantidadA - cantidadAAnt) / cantidadAAnt) * 100;
                if (cantidadXAnt > 0) varCantidadX = ((cantidadX - cantidadXAnt) / cantidadXAnt) * 100;
                if (totalCantidadAnt > 0) varTotalCantidad = ((totalCantidad - totalCantidadAnt) / totalCantidadAnt) * 100;
                tieneVariacion = true;
            }

            return {
                mes,
                importeA,
                importeX,
                cantidadA,
                cantidadX,
                total,
                totalCantidad,
                varImporteA,
                varImporteX,
                varTotal,
                varCantidadA,
                varCantidadX,
                varTotalCantidad,
                tieneVariacion
            };
        });
    }, [filtroMeses, mesesSeleccionados, mesesConDatos, ventasPorMes, cantidadesPorMes, meses]);

    // Calcular totales
    const totales = useMemo(() => {
        return datosFiltrados.reduce((acc, item) => ({
            importeA: acc.importeA + item.importeA,
            importeX: acc.importeX + item.importeX,
            cantidadA: acc.cantidadA + item.cantidadA,
            cantidadX: acc.cantidadX + item.cantidadX,
            total: acc.total + item.total,
            totalCantidad: acc.totalCantidad + item.totalCantidad
        }), {
            importeA: 0,
            importeX: 0,
            cantidadA: 0,
            cantidadX: 0,
            total: 0,
            totalCantidad: 0
        });
    }, [datosFiltrados]);

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

    const _handleMesToggle = (mes: string) => {
        setMesesSeleccionados(prev =>
            prev.includes(mes)
                ? prev.filter(m => m !== mes)
                : [...prev, mes]
        );
    };

    const exportarDatos = () => {
        let headers: string[];
        let rows: (string | number)[][];

        if (mostrarCantidad) {
            headers = mostrarVariacion 
                ? ['Mes', 'Cant. Facturas', 'Var %', 'Cant. Remitos', 'Var %', 'Total Cantidad', 'Var %']
                : ['Mes', 'Cant. Facturas', 'Cant. Remitos', 'Total Cantidad'];
            
            rows = datosFiltrados.map(item => {
                if (mostrarVariacion) {
                    return [
                        item.mes,
                        item.cantidadA,
                        item.tieneVariacion ? `${item.varCantidadA.toFixed(1)}%` : '-',
                        item.cantidadX,
                        item.tieneVariacion ? `${item.varCantidadX.toFixed(1)}%` : '-',
                        item.totalCantidad,
                        item.tieneVariacion ? `${item.varTotalCantidad.toFixed(1)}%` : '-'
                    ];
                } else {
                    return [item.mes, item.cantidadA, item.cantidadX, item.totalCantidad];
                }
            });

            if (mostrarTotales) {
                const totalRow = mostrarVariacion
                    ? ['TOTAL', totales.cantidadA, '-', totales.cantidadX, '-', totales.totalCantidad, '-']
                    : ['TOTAL', totales.cantidadA, totales.cantidadX, totales.totalCantidad];
                rows.push(totalRow);
            }
        } else {
            headers = mostrarVariacion
                ? ['Mes', 'Imp. Facturas', 'Var %', 'Imp. Remitos', 'Var %', 'Total Importe', 'Var %']
                : ['Mes', 'Imp. Facturas', 'Imp. Remitos', 'Total Importe'];
            
            rows = datosFiltrados.map(item => {
                if (mostrarVariacion) {
                    return [
                        item.mes,
                        item.importeA,
                        item.tieneVariacion ? `${item.varImporteA.toFixed(1)}%` : '-',
                        item.importeX,
                        item.tieneVariacion ? `${item.varImporteX.toFixed(1)}%` : '-',
                        item.total,
                        item.tieneVariacion ? `${item.varTotal.toFixed(1)}%` : '-'
                    ];
                } else {
                    return [item.mes, item.importeA, item.importeX, item.total];
                }
            });

            if (mostrarTotales) {
                const totalRow = mostrarVariacion
                    ? ['TOTAL', totales.importeA, '-', totales.importeX, '-', totales.total, '-']
                    : ['TOTAL', totales.importeA, totales.importeX, totales.total];
                rows.push(totalRow);
            }
        }

        exportToExcel([headers, ...rows], `ventas-mensuales-${mostrarCantidad ? 'cantidad' : 'importe'}${mostrarVariacion ? '-con-variacion' : ''}`, 'Ventas Mensuales');
    };

    return (
        <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
            {/* Header con controles */}
            <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                        Ventas Mensuales
                    </h4>

                    <div className="flex flex-wrap items-center gap-3">
                        {/* Filtro de meses */}
                        <select
                            value={filtroMeses}
                            onChange={(e) => setFiltroMeses(e.target.value as 'todos' | 'conDatos' | 'seleccionados')}
                            className="bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-40 p-2"
                        >
                            <option value="todos">Todos los meses</option>
                            <option value="conDatos">Solo con datos</option>
                            <option value="seleccionados">Seleccionados</option>
                        </select>

                        {/* Selector múltiple de meses */}
                        {filtroMeses === 'seleccionados' && (
                            <div className="relative">
                                <select
                                    multiple
                                    value={mesesSeleccionados}
                                    onChange={(e) => {
                                        const selected = Array.from(e.target.selectedOptions, option => option.value);
                                        setMesesSeleccionados(selected);
                                    }}
                                    className="bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-48 p-2"
                                    size={4}
                                >
                                    {mesesConDatos.map(mes => (
                                        <option key={mes} value={mes}>
                                            {mes}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Switch cantidad/importe */}
                        <label className="flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={mostrarCantidad}
                                onChange={(e) => setMostrarCantidad(e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                            <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                                {mostrarCantidad ? 'Cantidad' : 'Importe'}
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
                            <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                            <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                                Totales
                            </span>
                        </label>

                        {/* Switch mostrar variación */}
                        <label className="flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={mostrarVariacion}
                                onChange={(e) => setMostrarVariacion(e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                            <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                                Variación %
                            </span>
                        </label>

                        {/* Botón exportar */}
                        <button
                            onClick={exportarDatos}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors"
                        >
                            📊 Exportar
                        </button>
                    </div>
                </div>
            </div>

            {/* Tabla */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                Mes
                            </th>
                            {mostrarCantidad ? (
                                <>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                        Cant. Facturas
                                    </th>
                                    {mostrarVariacion && (
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                            Var %
                                        </th>
                                    )}
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                        Cant. Remitos
                                    </th>
                                    {mostrarVariacion && (
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                            Var %
                                        </th>
                                    )}
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                        Total Cantidad
                                    </th>
                                    {mostrarVariacion && (
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                            Var %
                                        </th>
                                    )}
                                </>
                            ) : (
                                <>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                        Imp. Facturas
                                    </th>
                                    {mostrarVariacion && (
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                            Var %
                                        </th>
                                    )}
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                        Imp. Remitos
                                    </th>
                                    {mostrarVariacion && (
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                            Var %
                                        </th>
                                    )}
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                        Total Importe
                                    </th>
                                    {mostrarVariacion && (
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                            Var %
                                        </th>
                                    )}
                                </>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                        {datosFiltrados.map((item, index) => (
                            <tr key={item.mes} className={index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'}>
                                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                                    {item.mes}
                                </td>
                                {mostrarCantidad ? (
                                    <>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                            {formatQuantity(item.cantidadA)}
                                        </td>
                                        {mostrarVariacion && (
                                            <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                                                {item.tieneVariacion ? (
                                                    <span className={item.varCantidadA > 0 ? 'text-green-600 dark:text-green-400' : item.varCantidadA < 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}>
                                                        {item.varCantidadA > 0 ? '+' : ''}{item.varCantidadA.toFixed(1)}%
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400 dark:text-gray-600">-</span>
                                                )}
                                            </td>
                                        )}
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                            {formatQuantity(item.cantidadX)}
                                        </td>
                                        {mostrarVariacion && (
                                            <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                                                {item.tieneVariacion ? (
                                                    <span className={item.varCantidadX > 0 ? 'text-green-600 dark:text-green-400' : item.varCantidadX < 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}>
                                                        {item.varCantidadX > 0 ? '+' : ''}{item.varCantidadX.toFixed(1)}%
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400 dark:text-gray-600">-</span>
                                                )}
                                            </td>
                                        )}
                                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                                            {formatQuantity(item.totalCantidad)}
                                        </td>
                                        {mostrarVariacion && (
                                            <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                                                {item.tieneVariacion ? (
                                                    <span className={item.varTotalCantidad > 0 ? 'text-green-600 dark:text-green-400' : item.varTotalCantidad < 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}>
                                                        {item.varTotalCantidad > 0 ? '+' : ''}{item.varTotalCantidad.toFixed(1)}%
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400 dark:text-gray-600">-</span>
                                                )}
                                            </td>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                            {formatCurrency(item.importeA)}
                                        </td>
                                        {mostrarVariacion && (
                                            <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                                                {item.tieneVariacion ? (
                                                    <span className={item.varImporteA > 0 ? 'text-green-600 dark:text-green-400' : item.varImporteA < 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}>
                                                        {item.varImporteA > 0 ? '+' : ''}{item.varImporteA.toFixed(1)}%
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400 dark:text-gray-600">-</span>
                                                )}
                                            </td>
                                        )}
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                            {formatCurrency(item.importeX)}
                                        </td>
                                        {mostrarVariacion && (
                                            <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                                                {item.tieneVariacion ? (
                                                    <span className={item.varImporteX > 0 ? 'text-green-600 dark:text-green-400' : item.varImporteX < 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}>
                                                        {item.varImporteX > 0 ? '+' : ''}{item.varImporteX.toFixed(1)}%
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400 dark:text-gray-600">-</span>
                                                )}
                                            </td>
                                        )}
                                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                                            {formatCurrency(item.total)}
                                        </td>
                                        {mostrarVariacion && (
                                            <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                                                {item.tieneVariacion ? (
                                                    <span className={item.varTotal > 0 ? 'text-green-600 dark:text-green-400' : item.varTotal < 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}>
                                                        {item.varTotal > 0 ? '+' : ''}{item.varTotal.toFixed(1)}%
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400 dark:text-gray-600">-</span>
                                                )}
                                            </td>
                                        )}
                                    </>
                                )}
                            </tr>
                        ))}

                        {/* Fila de totales */}
                        {mostrarTotales && (
                            <tr className="bg-blue-50 dark:bg-blue-900/20 border-t-2 border-blue-200 dark:border-blue-700">
                                <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-blue-900 dark:text-blue-300">
                                    TOTAL
                                </td>
                                {mostrarCantidad ? (
                                    <>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-blue-900 dark:text-blue-300">
                                            {formatQuantity(totales.cantidadA)}
                                        </td>
                                        {mostrarVariacion && <td className="px-6 py-4"></td>}
                                        <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-blue-900 dark:text-blue-300">
                                            {formatQuantity(totales.cantidadX)}
                                        </td>
                                        {mostrarVariacion && <td className="px-6 py-4"></td>}
                                        <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-blue-900 dark:text-blue-300">
                                            {formatQuantity(totales.totalCantidad)}
                                        </td>
                                        {mostrarVariacion && <td className="px-6 py-4"></td>}
                                    </>
                                ) : (
                                    <>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-blue-900 dark:text-blue-300">
                                            {formatCurrency(totales.importeA)}
                                        </td>
                                        {mostrarVariacion && <td className="px-6 py-4"></td>}
                                        <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-blue-900 dark:text-blue-300">
                                            {formatCurrency(totales.importeX)}
                                        </td>
                                        {mostrarVariacion && <td className="px-6 py-4"></td>}
                                        <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-blue-900 dark:text-blue-300">
                                            {formatCurrency(totales.total)}
                                        </td>
                                        {mostrarVariacion && <td className="px-6 py-4"></td>}
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
