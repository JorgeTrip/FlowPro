// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
import * as ExcelJS from 'exceljs';
import { ResultadoTercerizadosMRP } from './types';
import { borderFino, aplicarBordesExternos, formatearHeaders } from './excelEstilos';

/**
 * Agrega la hoja de "Productos Tercerizados" si existen registros.
 */
export function agregarHojaTercerizados(
  wb: ExcelJS.Workbook,
  tercerizados: ResultadoTercerizadosMRP[],
  mesesTransferencia: number = 2,
  mesesCompra: number = 3
): void {
  if (!tercerizados || tercerizados.length === 0) {
    return;
  }

  const wsT = wb.addWorksheet('Productos Tercerizados');

  const descCompra = `DEMANDA ${mesesCompra}M\n(COMPRA)`;
  const descTransf = `DEMANDA ${mesesTransferencia}M\n(TRANSF.)`;

  wsT.columns = [
    { header: 'CÓDIGO PT', key: 'codigoPT' },
    { header: 'DESCRIPCIÓN PT', key: 'descripcionPT' },
    { header: 'STOCK PT\nE.R.', key: 'stockPTEntreRios' },
    { header: 'STOCK PT\nCABA', key: 'stockPTCABA' },
    { header: 'ROTACIÓN', key: 'rotacion' },
    { header: descCompra, key: 'comprar' },
    { header: descTransf, key: 'transferir' },
    { header: 'CRITICIDAD', key: 'criticidad' },
  ];
  // Formatear los headers con los colores correspondientes de la app
  const headerRow = wsT.getRow(1);
  headerRow.height = 40;
  for (let c = 1; c <= 8; c++) {
    const cell = headerRow.getCell(c);
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.border = borderFino;

    let fillBg = 'FFF8F9FA'; // Gris default
    let fontColor = 'FF5F6368'; // Gris oscuro

    const esGrisExcel = [1, 2, 5].includes(c);
    const esVerdeER = c === 3;
    const esVioletaCABA = c === 4;
    const esAmarillo = [6, 7].includes(c);

    if (esGrisExcel) {
      fillBg = 'FFF1F3F4';
      fontColor = 'FF5F6368';
    } else if (esVerdeER) {
      fillBg = 'FFE6F4EA';
      fontColor = 'FF137333';
    } else if (esVioletaCABA) {
      fillBg = 'FFF3E8FF';
      fontColor = 'FF6B21A8';
    } else if (esAmarillo) {
      fillBg = 'FFFFF4E5';
      fontColor = 'FFB06000';
    }

    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: fillBg } };
    cell.font = { bold: true, size: 9.5, name: 'Segoe UI', color: { argb: fontColor } };
  }

  let filaActualT = 2;
  tercerizados.forEach((r, idx) => {
    wsT.addRow({
      codigoPT: r.codigoPT,
      descripcionPT: r.descripcionPT,
      stockPTEntreRios: r.stockPTEntreRios,
      stockPTCABA: r.stockPTCABA,
      rotacion: r.rotacion,
      comprar: r.movimientoSugerido.compra ?? 0,
      transferir: r.movimientoSugerido.transferencia ?? 0,
      criticidad: r.criticidad.toUpperCase(),
    });

    const row = wsT.getRow(filaActualT);
    row.height = 20;

    const alignConfigsT = [
      { horizontal: 'center' as const, vertical: 'middle' as const },
      { horizontal: 'left' as const, vertical: 'middle' as const },
      { horizontal: 'right' as const, vertical: 'middle' as const },
      { horizontal: 'right' as const, vertical: 'middle' as const },
      { horizontal: 'right' as const, vertical: 'middle' as const },
      { horizontal: 'right' as const, vertical: 'middle' as const },
      { horizontal: 'right' as const, vertical: 'middle' as const },
      { horizontal: 'center' as const, vertical: 'middle' as const }
    ];

    for (let c = 1; c <= 8; c++) {
      const cell = row.getCell(c);
      
      let cellBg = idx % 2 === 0 ? 'FFFFFFFF' : 'FFF9F9F9'; // Gris/Blanco default
      let cellFontColor = 'FF000000';

      const esGrisExcel = [1, 2, 5].includes(c);
      const esVerdeER = c === 3;
      const esVioletaCABA = c === 4;
      const esAmarillo = [6, 7].includes(c);
      const esCriticidad = c === 8;

      if (esGrisExcel) {
        cellBg = idx % 2 === 0 ? 'FFFFFFFF' : 'FFF9F9F9';
        cellFontColor = 'FF333333';
      } else if (esVerdeER) {
        cellBg = idx % 2 === 0 ? 'FFF4FAF6' : 'FFEBF7EE';
        cellFontColor = 'FF137333';
      } else if (esVioletaCABA) {
        cellBg = idx % 2 === 0 ? 'FFF9F5FF' : 'FFF5EBFF';
        cellFontColor = 'FF6B21A8';
      } else if (esAmarillo) {
        cellBg = idx % 2 === 0 ? 'FFFFFDF9' : 'FFFFF9F0';
        cellFontColor = 'FFB06000';
      }

      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: cellBg } };
      cell.border = borderFino;
      cell.alignment = alignConfigsT[c - 1];
      cell.font = { name: 'Segoe UI', size: 9, color: { argb: cellFontColor } };

      if (c === 3 || c === 4 || c === 5 || c === 6 || c === 7) {
        cell.numFmt = '#,##0.0';
      }

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
    }
    filaActualT++;
  });

  if (filaActualT > 2) {
    aplicarBordesExternos(wsT, filaActualT - 1, 8);
  }
}
