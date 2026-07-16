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

  const descCompra = `DEMANDA ${mesesCompra} ${mesesCompra === 1 ? 'MES' : 'MESES'} (COMPRA)`;
  const descTransf = `DEMANDA ${mesesTransferencia} ${mesesTransferencia === 1 ? 'MES' : 'MESES'} (TRANSF.)`;

  wsT.columns = [
    { header: 'CÓDIGO PT', key: 'codigoPT' },
    { header: 'DESCRIPCIÓN PT', key: 'descripcionPT' },
    { header: 'STOCK PT E.R.', key: 'stockPTEntreRios' },
    { header: 'STOCK PT CABA', key: 'stockPTCABA' },
    { header: 'ROTACIÓN', key: 'rotacion' },
    { header: descCompra, key: 'comprar' },
    { header: descTransf, key: 'transferir' },
    { header: 'CRITICIDAD', key: 'criticidad' },
  ];
  formatearHeaders(wsT, 8);

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
    const colorBg = idx % 2 === 0 ? 'FFF9F9F9' : 'FFFFFFFF';

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
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colorBg } };
      cell.border = borderFino;
      cell.alignment = alignConfigsT[c - 1];
      cell.font = { name: 'Segoe UI', size: 9 };
      if (c === 3 || c === 4 || c === 5 || c === 6 || c === 7) {
        cell.numFmt = '#,##0.0';
      }
    }
    filaActualT++;
  });

  if (filaActualT > 2) {
    aplicarBordesExternos(wsT, filaActualT - 1, 8);
  }
}
