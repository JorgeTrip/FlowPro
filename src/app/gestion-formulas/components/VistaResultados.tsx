// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import { useEffect, useState, useRef, useMemo } from 'react';
import { useGestionFormulasStore } from '@/app/stores/gestionFormulasStore';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { Tooltip, SkeletonTabla, BadgeCriticidad } from './ComponentesAuxiliares';
import DropdownFiltros from './DropdownFiltros';
import { useOrdenarResultados } from '../hooks/useOrdenarResultados';
import { ResultadoMRP } from '../lib/motorMRP';

export default function VistaResultados() {
  const store = useGestionFormulasStore();
  const [mesesProy, setMesesProy] = useState(3);
  const [soloConDatos, setSoloConDatos] = useState(true);
  const [criticidades, setCriticidades] = useState<string[]>(['alta', 'media', 'baja']);
  const [busqueda, setBusqueda] = useState('');

  const scrollSuperiorRef = useRef<HTMLDivElement>(null);
  const scrollInferiorRef = useRef<HTMLDivElement>(null);
  const [anchoScroll, setAnchoScroll] = useState(0);

  const { resultadosOrdenados, solicitarOrden, sortConfig } = useOrdenarResultados(store.resultadosMRP);

  const resultadosFiltrados = useMemo(() => {
    let items = resultadosOrdenados;
    if (soloConDatos) {
      items = items.filter((r) => 
        r.stockTotalDisponible > 0 || r.consumoMensual > 0 ||
        r.demandaBruta > 0 || r.cantidadSugerida > 0 ||
        r.cantidadARecibirTotal > 0
      );
    }
    items = items.filter((r) => criticidades.includes(r.criticidad));

    if (busqueda.trim()) {
      const term = busqueda.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      items = items.filter((r) => {
        const codigo = r.codigoProducto.toLowerCase();
        const desc = r.descripcion.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        return codigo.includes(term) || desc.includes(term);
      });
    }
    return items;
  }, [resultadosOrdenados, soloConDatos, criticidades, busqueda]);

  useEffect(() => {
    store.ejecutarCalculoMRP(mesesProy);
  }, [mesesProy]);

  useEffect(() => {
    if (resultadosFiltrados.length > 0 && scrollInferiorRef.current) {
      setAnchoScroll(scrollInferiorRef.current.scrollWidth);
    }
  }, [resultadosFiltrados, store.cargandoCalculo]);

  useEffect(() => {
    const sup = scrollSuperiorRef.current;
    const inf = scrollInferiorRef.current;
    if (!sup || !inf) return;
    let emisor: 'sup' | 'inf' | null = null;

    const alHacerScrollSuperior = () => {
      if (emisor === 'inf') { emisor = null; return; }
      emisor = 'sup'; inf.scrollLeft = sup.scrollLeft;
    };
    const alHacerScrollInferior = () => {
      if (emisor === 'sup') { emisor = null; return; }
      emisor = 'inf'; sup.scrollLeft = inf.scrollLeft;
    };

    sup.addEventListener('scroll', alHacerScrollSuperior);
    inf.addEventListener('scroll', alHacerScrollInferior);
    return () => {
      sup.removeEventListener('scroll', alHacerScrollSuperior);
      inf.removeEventListener('scroll', alHacerScrollInferior);
    };
  }, [resultadosFiltrados, anchoScroll]);

  const exportarExcel = async () => {
    if (resultadosFiltrados.length === 0) return;
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('MRP Planilla Pedidos');
    ws.columns = [
      { header: 'CÓDIGO', key: 'codigoProducto', width: 15 },
      { header: 'DESCRIPCIÓN', key: 'descripcion', width: 35 },
      { header: 'TIPO', key: 'tipo', width: 8 },
      { header: 'STK MP CABA', key: 'stockCABAMP', width: 14 },
      { header: 'STK MP ER', key: 'stockERMP', width: 14 },
      { header: 'STK PT CABA', key: 'stockCABAPT', width: 14 },
      { header: 'STK PT ER', key: 'stockERPT', width: 14 },
      { header: 'STK TOTAL DISP', key: 'stockTotalDisponible', width: 16 },
      { header: 'PENDIENTE RECEPCIÓN', key: 'pendienteRecepcion', width: 20 },
      { header: 'PUNTO PEDIDO', key: 'puntoPedido', width: 15 },
      { header: 'CONS MENSUAL PROMEDIO', key: 'consumoMensual', width: 22 },
      { header: 'DEMANDA BRUTA', key: 'demandaBruta', width: 18 },
      { header: 'CANT SUGERIDA', key: 'cantidadSugerida', width: 18 },
      { header: 'CRITICIDAD', key: 'criticidad', width: 12 },
    ];
    resultadosFiltrados.forEach((r) => {
      ws.addRow({
        ...r,
        descripcion: r.descripcion + (r.contenido ? ` (${r.contenido})` : ''),
        pendienteRecepcion: r.cantidadARecibirTotal,
      });
    });
    const buffer = await wb.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `FlowPro_Planilla_MRP_${Date.now()}.xlsx`);
  };

  const renderCabecera = (columna: keyof ResultadoMRP, label: string, tooltip?: string, align: string = 'text-left') => {
    const activo = sortConfig?.key === columna;
    return (
      <th
        onClick={() => solicitarOrden(columna)}
        className={`sticky top-0 z-10 bg-gray-50 dark:bg-[#2C2C2E] px-2.5 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-[#2C2C2E]/60 select-none transition-colors border-r border-gray-150 dark:border-gray-800 last:border-r-0 ${align}`}
      >
        <div className={`flex items-center space-x-1 ${align === 'text-right' ? 'justify-end' : 'justify-between'}`}>
          <span className="flex items-center relative group text-[11px]">
            {label}
            {tooltip && <Tooltip texto={tooltip} />}
          </span>
          <span className="text-[9px] text-gray-400 font-normal">
            {activo ? (sortConfig.direction === 'asc' ? '▲' : '▼') : '↕'}
          </span>
        </div>
      </th>
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Filtros y Controles Unificados con Simetría y Etiquetas */}
      <div className="flex flex-col md:flex-row items-end justify-between p-4 rounded-xl bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-gray-800 gap-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          {/* Control 1: Buscador */}
          <div className="flex flex-col w-full sm:w-auto">
            <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Buscar Producto</span>
            <div className="relative">
              <input
                type="text"
                placeholder="Código o descripción..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="pl-8 pr-3 h-9 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#2C2C2E] dark:text-white text-xs placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 w-full sm:w-60 transition-all shadow-sm"
              />
              <span className="absolute left-2.5 top-2.5 text-gray-400 text-xs">🔍</span>
            </div>
          </div>

          {/* Control 2: Meses de Proyección */}
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Proyección</span>
            <select
              value={mesesProy}
              onChange={(e) => setMesesProy(Number(e.target.value))}
              className="h-9 w-28 rounded-lg border-gray-300 dark:border-gray-700 py-1 px-2.5 bg-white dark:bg-[#2C2C2E] dark:text-white text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer shadow-sm"
            >
              {[1, 2, 3, 6, 9, 12].map((m) => (
                <option key={m} value={m}>{m} {m === 1 ? 'Mes' : 'Meses'}</option>
              ))}
            </select>
          </div>

          {/* Control 3: Filtros Avanzados */}
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Visualización</span>
            <DropdownFiltros
              soloConDatos={soloConDatos}
              setSoloConDatos={setSoloConDatos}
              criticidades={criticidades}
              setCriticidades={setCriticidades}
            />
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="flex space-x-2 w-full md:w-auto justify-end">
          <button onClick={() => store.setStep(1)} className="px-4 h-9 rounded-lg border border-gray-300 dark:border-gray-700 text-xs font-bold hover:bg-gray-50 dark:hover:bg-[#2C2C2E]/50 text-gray-700 dark:text-gray-300 transition-all cursor-pointer shadow-sm">
            Re-importar Excel
          </button>
          <button onClick={exportarExcel} disabled={store.cargandoCalculo || resultadosFiltrados.length === 0} className="px-4 h-9 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-800 text-white text-xs font-bold transition-all shadow-md cursor-pointer">
            Exportar Resultados 📥
          </button>
        </div>
      </div>

      {store.cargandoCalculo ? (
        <SkeletonTabla />
      ) : store.resultadosMRP ? (
        <div className="space-y-1">
          {/* Barra de Scroll Superior */}
          <div ref={scrollSuperiorRef} className="overflow-x-auto w-full border border-gray-200 dark:border-gray-800 rounded-t-xl bg-white dark:bg-[#1C1C1E] md:block hidden h-3 overflow-y-hidden">
            <div style={{ width: `${anchoScroll}px`, height: '1px' }} />
          </div>

          {/* Tabla de Resultados (Scroll Inferior + Altura máxima para cabecera fija) */}
          <div ref={scrollInferiorRef} className="overflow-x-auto max-h-[580px] overflow-y-auto rounded-b-xl md:rounded-t-none border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1C1C1E] shadow-sm">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800 text-left text-[11px]">
              <thead className="bg-gray-50 dark:bg-[#2C2C2E] text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider">
                <tr className="divide-x divide-gray-100 dark:divide-gray-800">
                  {renderCabecera('codigoProducto', 'Código')}
                  {renderCabecera('descripcion', 'Descripción')}
                  {renderCabecera('tipo', 'Tipo')}
                  {renderCabecera('stockCABAMP', 'STK MP CABA', 'Insumos a granel en CABA', 'text-right')}
                  {renderCabecera('stockERMP', 'STK MP ER', 'Insumos a granel en Entre Ríos', 'text-right')}
                  {renderCabecera('stockCABAPT', 'STK PT CABA', 'Producto terminado en CABA', 'text-right')}
                  {renderCabecera('stockERPT', 'STK PT ER', 'Producto terminado en Entre Ríos', 'text-right')}
                  {renderCabecera('stockTotalDisponible', 'Stock Total', 'Físico + A Recibir - Comprometido', 'text-right')}
                  {renderCabecera('cantidadARecibirTotal', 'A Recibir', 'Pendiente de entrega de proveedores', 'text-right')}
                  {renderCabecera('consumoMensual', 'Consumo Mes.', 'Consumo promedio histórico', 'text-right')}
                  {renderCabecera('demandaBruta', 'Demanda Bruta', 'Consumo proyectado', 'text-right')}
                  {renderCabecera('cantidadSugerida', 'Sugerida', 'Compra/producción sugerida', 'text-right')}
                  {renderCabecera('criticidad', 'Criticidad', undefined, 'text-center')}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-[#1C1C1E] text-gray-900 dark:text-gray-300">
                {resultadosFiltrados.map((fila, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-[#2C2C2E]/40 transition-colors divide-x divide-gray-100 dark:divide-gray-850 text-xs">
                    <td className="px-2.5 py-2 font-mono font-semibold">{fila.codigoProducto}</td>
                    <td className="px-2.5 py-2 group relative cursor-help">
                      <div className="truncate max-w-[200px] text-ellipsis">
                        {fila.descripcion}
                        {fila.contenido && <span className="text-gray-400 dark:text-gray-500 font-normal ml-1">({fila.contenido})</span>}
                      </div>
                      <Tooltip texto={fila.descripcion + (fila.contenido ? ` (${fila.contenido})` : '')} />
                    </td>
                    <td className="px-2.5 py-2"><span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${fila.tipo === 'PT' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300' : 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300'}`}>{fila.tipo}</span></td>
                    <td className="px-2.5 py-2 text-right font-mono text-gray-700 dark:text-gray-300">{fila.stockCABAMP || '-'}</td>
                    <td className="px-2.5 py-2 text-right font-mono text-gray-700 dark:text-gray-300">{fila.stockERMP || '-'}</td>
                    <td className="px-2.5 py-2 text-right font-mono text-gray-700 dark:text-gray-300">{fila.stockCABAPT || '-'}</td>
                    <td className="px-2.5 py-2 text-right font-mono text-gray-700 dark:text-gray-300">{fila.stockERPT || '-'}</td>
                    <td className="px-2.5 py-2 text-right font-semibold font-mono text-gray-900 dark:text-white">{fila.stockTotalDisponible}</td>
                    <td className="px-2.5 py-2 text-right font-mono text-gray-700 dark:text-gray-300">{fila.cantidadARecibirTotal || '-'}</td>
                    <td className="px-2.5 py-2 text-right font-mono text-gray-700 dark:text-gray-300">{fila.consumoMensual.toFixed(1)}</td>
                    <td className="px-2.5 py-2 text-right font-semibold font-mono text-gray-900 dark:text-white">{fila.demandaBruta.toFixed(1)}</td>
                    <td className={`px-2.5 py-2 text-right font-bold font-mono ${fila.cantidadSugerida > 0 ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'}`}>{fila.cantidadSugerida ? fila.cantidadSugerida.toFixed(1) : '-'}</td>
                    <td className="px-2.5 py-2 text-center"><BadgeCriticidad criticidad={fila.criticidad} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  );
}
