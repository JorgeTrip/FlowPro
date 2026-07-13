// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
import * as ExcelJS from 'exceljs';
import { ResultadoMRP } from './types';
import { borderFino, aplicarBordesExternos, formatearHeaders } from './excelEstilos';

/**
 * Agrega la hoja de "Materias Primas" consolidando los datos y cálculos de cada MP en una única fila.
 */
export function agregarHojaMateriasPrimas(wb: ExcelJS.Workbook, propios: ResultadoMRP[]): void {
  const wsM = wb.addWorksheet('Materias Primas');

  wsM.columns = [
    { header: 'CÓDIGO MP', key: 'codigoMP', width: 15 },
    { header: 'DESCRIPCIÓN MP', key: 'descripcionMP', width: 35 },
    { header: 'UM', key: 'unidadMedida', width: 8 },
    { header: 'STOCK MP E.R.', key: 'stockMPEntreRios', width: 18 },
    { header: 'STOCK MP CABA', key: 'stockMPCABA', width: 14 },
    { header: 'CANT. SUGERIDA', key: 'cantidadSugerida', width: 16 },
    { header: 'COMPRAR MP', key: 'comprar', width: 14 },
    { header: 'TRANSFERIR MP', key: 'transferir', width: 14 },
    { header: 'CRITICIDAD', key: 'criticidad', width: 14 },
  ];
  formatearHeaders(wsM, 9);

  let filaActual = 2;
  (propios || []).forEach((r, idx) => {
    const colorBg = idx % 2 === 0 ? 'FFF9F9F9' : 'FFFFFFFF';

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
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colorBg } };
      cell.border = borderFino;
      cell.alignment = alignConfigs[c - 1];
      cell.font = { name: 'Segoe UI', size: 9 };
      if (c === 4 || c === 5 || c === 6 || c === 7 || c === 8) {
        cell.numFmt = '#,##0.0';
      }
    }
    filaActual++;
  });

  if (filaActual > 2) {
    aplicarBordesExternos(wsM, filaActual - 1, 9);
  }
}
