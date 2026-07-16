// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
import * as ExcelJS from 'exceljs';
import { ResultadoMRP } from './types';
import { borderFino, aplicarBordesExternos, formatearHeaders } from './excelEstilos';

/**
 * Agrega la hoja de "Materias Primas" consolidando los datos y cálculos de cada MP en una única fila.
 */
export function agregarHojaMateriasPrimas(
  wb: ExcelJS.Workbook,
  propios: ResultadoMRP[],
  mesesTransferencia: number = 2,
  mesesCompra: number = 3
): void {
  const wsM = wb.addWorksheet('Materias Primas');

  const descCompra = `DEMANDA ${mesesCompra}M\n(COMPRA)`;
  const descTransf = `DEMANDA ${mesesTransferencia}M\n(TRANSF.)`;

  wsM.columns = [
    { header: 'CÓDIGO MP', key: 'codigoMP' },
    { header: 'DESCRIPCIÓN MP', key: 'descripcionMP' },
    { header: 'UM', key: 'unidadMedida' },
    { header: 'STOCK MP\nE.R.', key: 'stockMPEntreRios' },
    { header: 'STOCK MP\nCABA', key: 'stockMPCABA' },
    { header: 'CANTIDAD\nSUGERIDA', key: 'cantidadSugerida' },
    { header: descCompra, key: 'comprar' },
    { header: descTransf, key: 'transferir' },
    { header: 'CRITICIDAD', key: 'criticidad' },
  ];
  // Formatear los headers con los colores correspondientes de la app
  const headerRow = wsM.getRow(1);
  headerRow.height = 40;
  for (let c = 1; c <= 9; c++) {
    const cell = headerRow.getCell(c);
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.border = borderFino;

    let fillBg = 'FFF8F9FA'; // Gris default
    let fontColor = 'FF5F6368'; // Gris oscuro

    const esGrisExcel = [1, 2, 3].includes(c);
    const esVerdeER = c === 4;
    const esVioletaCABA = c === 5;
    const esAzul = c === 6;
    const esAmarillo = [7, 8].includes(c);

    if (esGrisExcel) {
      fillBg = 'FFF1F3F4';
      fontColor = 'FF5F6368';
    } else if (esVerdeER) {
      fillBg = 'FFE6F4EA';
      fontColor = 'FF137333';
    } else if (esVioletaCABA) {
      fillBg = 'FFF3E8FF';
      fontColor = 'FF6B21A8';
    } else if (esAzul) {
      fillBg = 'FFE6F0FA';
      fontColor = 'FF1A73E8';
    } else if (esAmarillo) {
      fillBg = 'FFFFF4E5';
      fontColor = 'FFB06000';
    }

    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: fillBg } };
    cell.font = { bold: true, size: 9.5, name: 'Segoe UI', color: { argb: fontColor } };
  }

  let filaActual = 2;
  (propios || []).forEach((r, idx) => {
    wsM.addRow({
      codigoMP: r.codigoMP,
      descripcionMP: r.descripcionMP,
      unidadMedida: r.unidadMedida,
      stockMPEntreRios: r.stockMPEntreRios,
      stockMPCABA: r.stockMPCABA,
      cantidadSugerida: r.cantidadSugerida,
      comprar: r.movimientoSugerido.compra ?? 0,
      transferir: r.movimientoSugerido.transferencia ?? 0,
      criticidad: r.criticidad.toUpperCase(),
    });

    const row = wsM.getRow(filaActual);
    row.height = 20;

    const alignConfigs = [
      { horizontal: 'center' as const, vertical: 'middle' as const },
      { horizontal: 'left' as const, vertical: 'middle' as const },
      { horizontal: 'center' as const, vertical: 'middle' as const },
      { horizontal: 'right' as const, vertical: 'middle' as const },
      { horizontal: 'right' as const, vertical: 'middle' as const },
      { horizontal: 'right' as const, vertical: 'middle' as const },
      { horizontal: 'right' as const, vertical: 'middle' as const },
      { horizontal: 'right' as const, vertical: 'middle' as const },
      { horizontal: 'center' as const, vertical: 'middle' as const }
    ];

    for (let c = 1; c <= 9; c++) {
      const cell = row.getCell(c);
      
      let cellBg = idx % 2 === 0 ? 'FFFFFFFF' : 'FFF9F9F9'; // Gris/Blanco default
      let cellFontColor = 'FF000000';

      const esGrisExcel = [1, 2, 3].includes(c);
      const esVerdeER = c === 4;
      const esVioletaCABA = c === 5;
      const esAzul = c === 6;
      const esAmarillo = [7, 8].includes(c);
      const esCriticidad = c === 9;

      if (esGrisExcel) {
        cellBg = idx % 2 === 0 ? 'FFFFFFFF' : 'FFF9F9F9';
        cellFontColor = 'FF333333';
      } else if (esVerdeER) {
        cellBg = idx % 2 === 0 ? 'FFF4FAF6' : 'FFEBF7EE';
        cellFontColor = 'FF137333';
      } else if (esVioletaCABA) {
        cellBg = idx % 2 === 0 ? 'FFF9F5FF' : 'FFF5EBFF';
        cellFontColor = 'FF6B21A8';
      } else if (esAzul) {
        cellBg = idx % 2 === 0 ? 'FFF4F9FE' : 'FFEBF3FC';
        cellFontColor = 'FF1A73E8';
      } else if (esAmarillo) {
        cellBg = idx % 2 === 0 ? 'FFFFFDF9' : 'FFFFF9F0';
        cellFontColor = 'FFB06000';
      }

      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: cellBg } };
      cell.border = borderFino;
      cell.alignment = alignConfigs[c - 1];
      cell.font = { name: 'Segoe UI', size: 9, color: { argb: cellFontColor } };

      if (c === 4 || c === 5 || c === 6 || c === 7 || c === 8) {
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
    filaActual++;
  });

  if (filaActual > 2) {
    aplicarBordesExternos(wsM, filaActual - 1, 9);
  }
}
