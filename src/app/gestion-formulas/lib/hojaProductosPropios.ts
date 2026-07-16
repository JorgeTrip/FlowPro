// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
import * as ExcelJS from 'exceljs';
import { ResultadoMRP } from './types';
import { borderFino, aplicarBordesExternos } from './excelEstilos';

export function agregarHojaProductosPropios(
  wb: ExcelJS.Workbook,
  propios: ResultadoMRP[],
  mesesTransferencia: number = 2,
  mesesCompra: number = 3,
  modoMacro: boolean = false
): void {
  const wsP = wb.addWorksheet('Productos Propios');
  wsP.views = [{ state: 'frozen', ySplit: 1 }];

  const cols = modoMacro ? [
    { header: 'CÓDIGO MP', key: 'codigoMP' },
    { header: 'DESCRIPCIÓN MP', key: 'descripcionMP' },
    { header: 'UM', key: 'unidadMedida' },
    { header: 'CÓDIGO PT', key: 'codigoProducto' },
    { header: 'PRODUCTOS EN LOS QUE SE USA', key: 'productosUsados' },
    { header: 'LÍNEA DE PRODUCTO', key: 'linea' },
    { header: 'STOCK MP\nE.R.', key: 'stockMPEntreRios' },
    { header: 'STOCK PT\nE.R.', key: 'stockPTEntreRios' },
    { header: 'TOTAL PT + MP\nE.R.', key: 'totalEntreRios' },
    { header: 'STOCK MP\nCABA', key: 'stockMPCABA' },
    { header: 'STOCK PT\nCABA', key: 'stockPTCABA' },
    { header: 'TOTAL PT + MP\nCABA', key: 'totalCABA' },
    { header: 'ROT. MENSUAL\nPT', key: 'rotacionMensual' },
    { header: `ROT. ${mesesTransferencia}M PT\n(TRANSF.)`, key: 'rotacionTransf' },
    { header: `ROT. ${mesesCompra}M PT\n(COMPRA)`, key: 'rotacionCompra' },
    { header: 'TRANSF. PT\n(E.R.→CABA)', key: 'transferirPT' },
    { header: 'TRANSF. MP\n(E.R.→CABA)', key: 'transferirMP' },
    { header: 'TRANSF. MP\n(CABA→E.R.)', key: 'transferirMPCabaEr' },
    { header: 'PRODUCIR PT\nCABA', key: 'cantidadFabricarCABA' },
    { header: 'PRODUCIR PT\nE.R.', key: 'cantidadFabricarER' },
    { header: 'COMPRA MP', key: 'comprar' },
    { header: 'CANTIDAD\nNECESARIA MP', key: 'cantidadSugerida' },
    { header: 'CRITICIDAD', key: 'criticidad' },
  ] : [
    { header: 'CÓDIGO MP', key: 'codigoMP' },
    { header: 'DESCRIPCIÓN MP', key: 'descripcionMP' },
    { header: 'UM', key: 'unidadMedida' },
    { header: 'STOCK MP\nE.R.', key: 'stockMPEntreRios' },
    { header: 'STOCK MP\nCABA', key: 'stockMPCABA' },
    { header: 'CÓDIGO PT', key: 'codigoProducto' },
    { header: 'PRODUCTOS EN LOS QUE SE USA', key: 'productosUsados' },
    { header: 'LÍNEA DE PRODUCTO', key: 'linea' },
    { header: 'STOCK PT\nE.R.', key: 'stockPTEntreRios' },
    { header: 'STOCK PT\nCABA', key: 'stockPTCABA' },
    { header: 'ROT. MENSUAL\nPT', key: 'rotacionMensual' },
    { header: `ROT. ${mesesTransferencia}M PT\n(TRANSF.)`, key: 'rotacionTransf' },
    { header: `ROT. ${mesesCompra}M PT\n(COMPRA)`, key: 'rotacionCompra' },
    { header: 'TRANSF. PT\n(E.R.→CABA)', key: 'transferirPT' },
    { header: 'TRANSF. MP\n(E.R.→CABA)', key: 'transferirMP' },
    { header: 'TRANSF. MP\n(CABA→E.R.)', key: 'transferirMPCabaEr' },
    { header: 'PRODUCIR PT\nCABA', key: 'cantidadFabricarCABA' },
    { header: 'PRODUCIR PT\nE.R.', key: 'cantidadFabricarER' },
    { header: 'COMPRA MP', key: 'comprar' },
    { header: 'CANTIDAD\nNECESARIA MP', key: 'cantidadSugerida' },
    { header: 'CRITICIDAD', key: 'criticidad' },
  ];

  wsP.columns = cols;
  const numCols = cols.length;

  const headerRow = wsP.getRow(1);
  headerRow.height = 40;
  for (let c = 1; c <= numCols; c++) {
    const cell = headerRow.getCell(c);
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.border = borderFino;

    let fillBg = 'FFF8F9FA';
    let fontColor = 'FF5F6368';

    const esGris = modoMacro ? [1, 2, 3, 4, 5, 6].includes(c) : [1, 2, 3, 6, 7, 8].includes(c);
    const esVerde = modoMacro ? [7, 8, 9].includes(c) : [4, 9].includes(c);
    const esVioleta = modoMacro ? [10, 11, 12].includes(c) : [5, 10].includes(c);
    const esAmarillo = modoMacro ? [16, 17, 18, 19, 20, 21].includes(c) : [14, 15, 16, 17, 18, 19].includes(c);
    const esAzul = modoMacro ? c === 22 : c === 20;

    if (esGris) {
      fillBg = 'FFF1F3F4';
      fontColor = 'FF5F6368';
    } else if (esVerde) {
      fillBg = 'FFE6F4EA';
      fontColor = 'FF137333';
    } else if (esVioleta) {
      fillBg = 'FFF3E8FF';
      fontColor = 'FF6B21A8';
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

      const rowData = modoMacro ? {
        codigoMP: esPrimeraFila ? r.codigoMP : '',
        descripcionMP: esPrimeraFila ? r.descripcionMP : '',
        unidadMedida: esPrimeraFila ? r.unidadMedida : '',
        codigoProducto: pt?.codigoProducto || '',
        productosUsados: pt?.descripcion || '',
        linea: pt?.linea || '',
        stockMPEntreRios: esPrimeraFila ? r.stockMPEntreRios : null,
        stockPTEntreRios: pt?.stockPTEntreRios ?? 0,
        totalEntreRios: (r.stockMPEntreRios ?? 0) + (pt?.stockPTEntreRios ?? 0),
        stockMPCABA: esPrimeraFila ? r.stockMPCABA : null,
        stockPTCABA: pt?.stockPTCABA ?? 0,
        totalCABA: (r.stockMPCABA ?? 0) + (pt?.stockPTCABA ?? 0),
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
      } : {
        codigoMP: esPrimeraFila ? r.codigoMP : '',
        descripcionMP: esPrimeraFila ? r.descripcionMP : '',
        unidadMedida: esPrimeraFila ? r.unidadMedida : '',
        stockMPEntreRios: esPrimeraFila ? r.stockMPEntreRios : null,
        stockMPCABA: esPrimeraFila ? r.stockMPCABA : null,
        codigoProducto: pt?.codigoProducto || '',
        productosUsados: pt?.descripcion || '',
        linea: pt?.linea || '',
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
      };

      wsP.addRow(rowData);
      const row = wsP.getRow(filaActual);
      row.height = 20;

      for (let c = 1; c <= numCols; c++) {
        const cell = row.getCell(c);
        
        let cellBg = idx % 2 === 0 ? 'FFFFFFFF' : 'FFF9F9F9';
        let cellFontColor = 'FF000000';

        const esGrisCell = modoMacro ? [1, 2, 3, 4, 5, 6].includes(c) : [1, 2, 3, 6, 7, 8].includes(c);
        const esVerdeCell = modoMacro ? [7, 8, 9].includes(c) : [4, 9].includes(c);
        const esVioletaCell = modoMacro ? [10, 11, 12].includes(c) : [5, 10].includes(c);
        const esAmarilloCell = modoMacro ? [16, 17, 18, 19, 20, 21].includes(c) : [14, 15, 16, 17, 18, 19].includes(c);
        const esAzulCell = modoMacro ? c === 22 : c === 20;
        const esCriticidadCell = c === numCols;

        if (esGrisCell) {
          cellBg = idx % 2 === 0 ? 'FFFFFFFF' : 'FFF9F9F9';
          cellFontColor = 'FF333333';
        } else if (esVerdeCell) {
          cellBg = idx % 2 === 0 ? 'FFF4FAF6' : 'FFEBF7EE';
          cellFontColor = 'FF137333';
        } else if (esVioletaCell) {
          cellBg = idx % 2 === 0 ? 'FFF9F5FF' : 'FFF5EBFF';
          cellFontColor = 'FF6B21A8';
        } else if (esAmarilloCell) {
          cellBg = idx % 2 === 0 ? 'FFFFFDF9' : 'FFFFF9F0';
          cellFontColor = 'FFB06000';
        } else if (esAzulCell) {
          cellBg = idx % 2 === 0 ? 'FFF4F9FE' : 'FFEBF3FC';
          cellFontColor = 'FF1A73E8';
        }

        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: cellBg } };
        cell.border = borderFino;
        cell.font = { name: 'Segoe UI', size: 9, color: { argb: cellFontColor } };

        const isCenter = [1, 3, 6, numCols].includes(c) || (modoMacro && c === 4);
        const isLeft = [2, 7].includes(c) || (modoMacro && c === 5);
        cell.alignment = {
          horizontal: isCenter ? 'center' : isLeft ? 'left' : 'right',
          vertical: 'top',
        };

        if (esCriticidadCell) {
          const criticidadVal = (r.criticidad || '').toLowerCase();
          let fillCritColor = 'FFFFFFFF';
          let fontCritColor = 'FF000000';
          if (criticidadVal === 'alta') { fillCritColor = 'FFFCE8E6'; fontCritColor = 'FFC5221F'; }
          else if (criticidadVal === 'media') { fillCritColor = 'FEF7E0'; fontCritColor = 'FFB06000'; }
          else if (criticidadVal === 'baja') { fillCritColor = 'FFE6F4EA'; fontCritColor = 'FF137333'; }
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: fillCritColor } };
          cell.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: fontCritColor } };
        }

        const isNumeric = modoMacro 
          ? [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22].includes(c)
          : [4, 5, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].includes(c);
        if (isNumeric && cell.value !== null && cell.value !== '') {
          cell.numFmt = '#,##0.0';
        }
      }
      filaActual++;
    }

    if (N > 1) {
      const filaFin = filaInicio + N - 1;
      const mergeCols = modoMacro ? [1, 2, 3, 7, 10, 17, 18, 21, 22, 23] : [1, 2, 3, 4, 5, 15, 16, 19, 20, 21];
      mergeCols.forEach((c) => {
        wsP.mergeCells(filaInicio, c, filaFin, c);
      });
    }
  });

  if (filaActual > 2) {
    aplicarBordesExternos(wsP, filaActual - 1, numCols);
  }
}
