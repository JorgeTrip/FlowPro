// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
import * as ExcelJS from 'exceljs';
import { ResultadoMRP } from './types';
import { borderFino, aplicarBordesExternos, formatearHeaders } from './excelEstilos';

/**
 * Agrega la hoja de "Productos Propios" consolidando MP y PT de forma no redundante.
 * Combina las celdas de la materia prima cuando está asociada a múltiples productos.
 */
export function agregarHojaProductosPropios(wb: ExcelJS.Workbook, propios: ResultadoMRP[]): void {
  const wsP = wb.addWorksheet('Productos Propios');

  wsP.columns = [
    { header: 'CÓDIGO MP', key: 'codigoMP', width: 15 },
    { header: 'DESCRIPCIÓN MP', key: 'descripcionMP', width: 35 },
    { header: 'UM', key: 'unidadMedida', width: 8 },
    { header: 'STOCK MP E.R.', key: 'stockMPEntreRios', width: 18 },
    { header: 'STOCK MP CABA', key: 'stockMPCABA', width: 14 },
    { header: 'CANT. SUGERIDA', key: 'cantidadSugerida', width: 16 },
    { header: 'COMPRAR MP', key: 'comprar', width: 14 },
    { header: 'TRANSFERIR MP', key: 'transferir', width: 14 },
    { header: 'CRITICIDAD', key: 'criticidad', width: 14 },
    { header: 'CÓDIGO', key: 'codigoProducto', width: 12 },
    { header: 'PRODUCTOS EN LOS QUE SE USA', key: 'productosUsados', width: 40 },
    { header: 'LÍNEA DE PRODUCTO', key: 'linea', width: 22 },
    { header: 'PLANTA FABRICACIÓN', key: 'sitioFabricacion', width: 22 },
    { header: 'STOCK PT E.R.', key: 'stockPTEntreRios', width: 12 },
    { header: 'STOCK PT CABA', key: 'stockPTCABA', width: 12 },
    { header: 'PRODUCIR CABA', key: 'cantidadFabricarCABA', width: 18 },
    { header: 'PRODUCIR E.R.', key: 'cantidadFabricarER', width: 18 },
    { header: 'TRANSFERIR PT', key: 'transferirPT', width: 12 },
    { header: 'CANT (ROTACIÓN)', key: 'rotacionProductos', width: 30 },
  ];
  formatearHeaders(wsP, 19);

  let filaActual = 2;
  (propios || []).forEach((r, idx) => {
    const N = Math.max(1, r.productosUsados?.length || 0);
    const colorBg = idx % 2 === 0 ? 'FFF9F9F9' : 'FFFFFFFF';
    const filaInicio = filaActual;

    for (let i = 0; i < N; i++) {
      const pt = r.productosUsados?.[i];
      const esPrimeraFila = i === 0;

      wsP.addRow({
        codigoMP: esPrimeraFila ? r.codigoMP : '',
        descripcionMP: esPrimeraFila ? r.descripcionMP : '',
        unidadMedida: esPrimeraFila ? r.unidadMedida : '',
        stockMPEntreRios: esPrimeraFila ? r.stockMPEntreRios : null,
        stockMPCABA: esPrimeraFila ? r.stockMPCABA : null,
        cantidadSugerida: esPrimeraFila ? r.cantidadSugerida : null,
        comprar: esPrimeraFila ? (r.movimientoSugerido.compra ?? 0) : null,
        transferir: esPrimeraFila ? (r.movimientoSugerido.transferencia ?? 0) : null,
        criticidad: esPrimeraFila ? r.criticidad.toUpperCase() : '',
        codigoProducto: pt?.codigoProducto || '',
        productosUsados: pt?.descripcion || '',
        linea: pt?.linea || '',
        sitioFabricacion: pt?.sitioFabricacion || '',
        stockPTEntreRios: pt?.stockPTEntreRios ?? 0,
        stockPTCABA: pt?.stockPTCABA ?? 0,
        cantidadFabricarCABA: pt?.cantidadFabricarCABA ?? 0,
        cantidadFabricarER: pt?.cantidadFabricarER ?? 0,
        transferirPT: pt?.transferirPT ?? 0,
        rotacionProductos: pt?.rotacion !== undefined ? pt.rotacion : '',
      });

      const row = wsP.getRow(filaActual);
      row.height = 20;

      const alignConfigs = [
        { horizontal: 'center' as const, vertical: 'top' as const },
        { horizontal: 'left' as const, vertical: 'top' as const },
        { horizontal: 'center' as const, vertical: 'top' as const },
        { horizontal: 'right' as const, vertical: 'top' as const },
        { horizontal: 'right' as const, vertical: 'top' as const },
        { horizontal: 'right' as const, vertical: 'top' as const },
        { horizontal: 'right' as const, vertical: 'top' as const },
        { horizontal: 'right' as const, vertical: 'top' as const },
        { horizontal: 'center' as const, vertical: 'top' as const },
        { horizontal: 'center' as const, vertical: 'top' as const },
        { horizontal: 'left' as const, vertical: 'top' as const },
        { horizontal: 'left' as const, vertical: 'top' as const },
        { horizontal: 'center' as const, vertical: 'top' as const },
        { horizontal: 'right' as const, vertical: 'top' as const },
        { horizontal: 'right' as const, vertical: 'top' as const },
        { horizontal: 'right' as const, vertical: 'top' as const },
        { horizontal: 'right' as const, vertical: 'top' as const },
        { horizontal: 'right' as const, vertical: 'top' as const },
        { horizontal: 'right' as const, vertical: 'top' as const }
      ];

      for (let c = 1; c <= 19; c++) {
        const cell = row.getCell(c);
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colorBg } };
        cell.border = borderFino;
        cell.alignment = alignConfigs[c - 1];
        cell.font = { name: 'Segoe UI', size: 9 };
        
        const tieneValor = cell.value !== null && cell.value !== '';
        if (tieneValor && (c === 4 || c === 5 || c === 6 || c === 7 || c === 8 || c === 14 || c === 15 || c === 16 || c === 17 || c === 18 || c === 19)) {
          cell.numFmt = '#,##0.0';
        }
      }
      filaActual++;
    }

    // Combinar las celdas de las columnas correspondientes a la Materia Prima (1 a 9)
    if (N > 1) {
      const filaFin = filaInicio + N - 1;
      for (let c = 1; c <= 9; c++) {
        wsP.mergeCells(filaInicio, c, filaFin, c);
      }
    }
  });

  if (filaActual > 2) {
    aplicarBordesExternos(wsP, filaActual - 1, 19);
  }
}
