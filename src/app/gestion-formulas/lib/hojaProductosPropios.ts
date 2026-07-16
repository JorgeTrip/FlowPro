// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
import * as ExcelJS from 'exceljs';
import { ResultadoMRP } from './types';
import { borderFino, aplicarBordesExternos } from './excelEstilos';

/**
 * Agrega la hoja de "Productos Propios" consolidando MP y PT de forma no redundante.
 * Combina las celdas de la materia prima cuando está asociada a múltiples productos.
 */
export function agregarHojaProductosPropios(
  wb: ExcelJS.Workbook,
  propios: ResultadoMRP[],
  mesesTransferencia: number = 2,
  mesesCompra: number = 3
): void {
  const wsP = wb.addWorksheet('Productos Propios');
  wsP.views = [{ state: 'frozen', ySplit: 1 }];

  wsP.columns = [
    { header: 'CÓDIGO MP', key: 'codigoMP' },
    { header: 'DESCRIPCIÓN MP', key: 'descripcionMP' },
    { header: 'UM', key: 'unidadMedida' },
    { header: 'STOCK MP E.R.', key: 'stockMPEntreRios' },
    { header: 'STOCK MP CABA', key: 'stockMPCABA' },
    { header: 'CÓDIGO PT', key: 'codigoProducto' },
    { header: 'PRODUCTOS EN LOS QUE SE USA', key: 'productosUsados' },
    { header: 'LÍNEA DE PRODUCTO', key: 'linea' },
    { header: 'PLANTA FABRICACIÓN', key: 'sitioFabricacion' },
    { header: 'STOCK PT E.R.', key: 'stockPTEntreRios' },
    { header: 'STOCK PT CABA', key: 'stockPTCABA' },
    { header: 'ROT. MENSUAL PT', key: 'rotacionMensual' },
    { header: `ROT. ${mesesTransferencia}M PT (TRANSF.)`, key: 'rotacionTransf' },
    { header: `ROT. ${mesesCompra}M PT (COMPRA)`, key: 'rotacionCompra' },
    { header: 'TRANSF. PT (E.R.→CABA)', key: 'transferirPT' },
    { header: 'TRANSF. MP (E.R.→CABA)', key: 'transferirMP' },
    { header: 'TRANSF. MP (CABA→E.R.)', key: 'transferirMPCabaEr' },
    { header: 'PRODUCIR PT CABA', key: 'cantidadFabricarCABA' },
    { header: 'PRODUCIR PT E.R.', key: 'cantidadFabricarER' },
    { header: 'COMPRA MP', key: 'comprar' },
    { header: 'CANTIDAD NECESARIA MP', key: 'cantidadSugerida' },
    { header: 'CRITICIDAD', key: 'criticidad' },
  ];

  // Formatear los headers con colores específicos trasladados de la app
  const headerRow = wsP.getRow(1);
  headerRow.height = 40;
  for (let c = 1; c <= 22; c++) {
    const cell = headerRow.getCell(c);
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.border = borderFino;

    let fillBg = 'FFF8F9FA'; // Gris default
    let fontColor = 'FF5F6368'; // Gris oscuro

    const esVerde = [1, 2, 3, 4, 5, 10, 11].includes(c);
    const esAmarillo = [15, 16, 17, 18, 19, 20].includes(c);
    const esAzul = c === 21;

    if (esVerde) {
      fillBg = 'FFE6F4EA';
      fontColor = 'FF137333';
    } else if (esAmarillo) {
      fillBg = 'FFFFF4E5';
      fontColor = 'FFB06000';
    } else if (esAzul) {
      fillBg = 'FFE6F0FA';
      fontColor = 'FF1A73E8';
    }

    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: fillBg } };
    cell.font = { bold: true, size: 9.5, name: 'Segoe UI', color: { argb: fontColor } };
  }

  let filaActual = 2;
  (propios || []).forEach((r, idx) => {
    const N = Math.max(1, r.productosUsados?.length || 0);
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
        codigoProducto: pt?.codigoProducto || '',
        productosUsados: pt?.descripcion || '',
        linea: pt?.linea || '',
        sitioFabricacion: pt?.sitioFabricacion || '',
        stockPTEntreRios: pt?.stockPTEntreRios ?? 0,
        stockPTCABA: pt?.stockPTCABA ?? 0,
        rotacionMensual: pt?.rotacionMensual ?? 0,
        rotacionTransf: pt?.rotacionMensual !== undefined ? pt.rotacionMensual * mesesTransferencia : 0,
        rotacionCompra: pt?.rotacionMensual !== undefined ? pt.rotacionMensual * mesesCompra : 0,
        transferirPT: pt?.transferirPT ?? 0,
        transferirMP: esPrimeraFila ? (r.movimientoSugerido.transferencia ?? 0) : null,
        transferirMPCabaEr: esPrimeraFila ? (r.movimientoSugerido.transferenciaCabaEr ?? 0) : null,
        cantidadFabricarCABA: pt?.produccionExistenteCABA ?? 0,
        cantidadFabricarER: pt?.produccionExistenteER ?? 0,
        comprar: esPrimeraFila ? (r.movimientoSugerido.compra ?? 0) : null,
        cantidadSugerida: esPrimeraFila ? r.cantidadSugerida : null,
        criticidad: esPrimeraFila ? r.criticidad.toUpperCase() : '',
      });

      const row = wsP.getRow(filaActual);
      row.height = 20;

      const alignConfigs = [
        { horizontal: 'center' as const, vertical: 'top' as const },
        { horizontal: 'left' as const, vertical: 'top' as const },
        { horizontal: 'center' as const, vertical: 'top' as const },
        { horizontal: 'right' as const, vertical: 'top' as const },
        { horizontal: 'right' as const, vertical: 'top' as const },
        { horizontal: 'center' as const, vertical: 'top' as const },
        { horizontal: 'left' as const, vertical: 'top' as const },
        { horizontal: 'left' as const, vertical: 'top' as const },
        { horizontal: 'center' as const, vertical: 'top' as const },
        { horizontal: 'right' as const, vertical: 'top' as const },
        { horizontal: 'right' as const, vertical: 'top' as const },
        { horizontal: 'right' as const, vertical: 'top' as const },
        { horizontal: 'right' as const, vertical: 'top' as const },
        { horizontal: 'right' as const, vertical: 'top' as const },
        { horizontal: 'right' as const, vertical: 'top' as const },
        { horizontal: 'right' as const, vertical: 'top' as const },
        { horizontal: 'right' as const, vertical: 'top' as const },
        { horizontal: 'right' as const, vertical: 'top' as const },
        { horizontal: 'right' as const, vertical: 'top' as const },
        { horizontal: 'right' as const, vertical: 'top' as const },
        { horizontal: 'right' as const, vertical: 'top' as const },
        { horizontal: 'center' as const, vertical: 'top' as const },
      ];

      for (let c = 1; c <= 22; c++) {
        const cell = row.getCell(c);
        
        let cellBg = idx % 2 === 0 ? 'FFFFFFFF' : 'FFF9F9F9'; // Gris/Blanco normal default
        let cellFontColor = 'FF000000';

        const esVerde = [1, 2, 3, 4, 5, 10, 11].includes(c);
        const esAmarillo = [15, 16, 17, 18, 19, 20].includes(c);
        const esAzul = c === 21;
        const esCriticidad = c === 22;

        if (esVerde) {
          cellBg = idx % 2 === 0 ? 'FFF4FAF6' : 'FFEBF7EE';
          cellFontColor = 'FF137333';
        } else if (esAmarillo) {
          cellBg = idx % 2 === 0 ? 'FFFFFDF9' : 'FFFFF9F0';
          cellFontColor = 'FFB06000';
        } else if (esAzul) {
          cellBg = idx % 2 === 0 ? 'FFF4F9FE' : 'FFEBF3FC';
          cellFontColor = 'FF1A73E8';
        }

        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: cellBg } };
        cell.border = borderFino;
        cell.alignment = alignConfigs[c - 1];
        cell.font = { name: 'Segoe UI', size: 9, color: { argb: cellFontColor } };

        if (esCriticidad) {
          const criticidadVal = (r.criticidad || '').toLowerCase();
          let fillCritColor = 'FFFFFFFF';
          let fontCritColor = 'FF000000';
          if (criticidadVal === 'alta') {
            fillCritColor = 'FFFCE8E6';
            fontCritColor = 'FFC5221F';
          } else if (criticidadVal === 'media') {
            fillCritColor = 'FEF7E0';
            fontCritColor = 'FFB06000';
          } else if (criticidadVal === 'baja') {
            fillCritColor = 'FFE6F4EA';
            fontCritColor = 'FF137333';
          }
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: fillCritColor } };
          cell.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: fontCritColor } };
        }

        const tieneValor = cell.value !== null && cell.value !== '';
        if (tieneValor && [4, 5, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21].includes(c)) {
          cell.numFmt = '#,##0.0';
        }
      }
      filaActual++;
    }

    // Combinar las celdas de las columnas correspondientes a la Materia Prima
    if (N > 1) {
      const filaFin = filaInicio + N - 1;
      [1, 2, 3, 4, 5, 16, 17, 20, 21, 22].forEach((c) => {
        wsP.mergeCells(filaInicio, c, filaFin, c);
      });
    }
  });

  if (filaActual > 2) {
    aplicarBordesExternos(wsP, filaActual - 1, 22);
  }
}
