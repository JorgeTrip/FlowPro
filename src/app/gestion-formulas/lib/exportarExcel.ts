// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { ResultadosMRPFinal } from './types';

const borderFino = {
  top: { style: 'thin' as const, color: { argb: 'FFE0E0E0' } },
  left: { style: 'thin' as const, color: { argb: 'FFE0E0E0' } },
  bottom: { style: 'thin' as const, color: { argb: 'FFE0E0E0' } },
  right: { style: 'thin' as const, color: { argb: 'FFE0E0E0' } }
};

const rellenoHeader = {
  type: 'pattern' as const,
  pattern: 'solid' as const,
  fgColor: { argb: 'FFCCEEFF' }
};

function aplicarBordesExternos(ws: ExcelJS.Worksheet, totalFilas: number, totalCols: number) {
  for (let r = 2; r <= totalFilas; r++) {
    const row = ws.getRow(r);
    for (let c = 1; c <= totalCols; c++) {
      const cell = row.getCell(c);
      cell.border = {
        top: r === 2 ? { style: 'medium' as const, color: { argb: 'FF000000' } } : (cell.border?.top || { style: 'thin' as const, color: { argb: 'FFE0E0E0' } }),
        bottom: r === totalFilas ? { style: 'medium' as const, color: { argb: 'FF000000' } } : (cell.border?.bottom || { style: 'thin' as const, color: { argb: 'FFE0E0E0' } }),
        left: c === 1 ? { style: 'medium' as const, color: { argb: 'FF000000' } } : (cell.border?.left || { style: 'thin' as const, color: { argb: 'FFE0E0E0' } }),
        right: c === totalCols ? { style: 'medium' as const, color: { argb: 'FF000000' } } : (cell.border?.right || { style: 'thin' as const, color: { argb: 'FFE0E0E0' } }),
      };
    }
  }
}

function formatearHeaders(ws: ExcelJS.Worksheet, colsCount: number) {
  const headerRow = ws.getRow(1);
  headerRow.height = 24;
  for (let c = 1; c <= colsCount; c++) {
    const cell = headerRow.getCell(c);
    cell.font = { bold: true, size: 10, name: 'Segoe UI' };
    cell.fill = rellenoHeader;
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.border = borderFino;
  }
}

export async function exportarExcelMRP(resultados: ResultadosMRPFinal): Promise<void> {
  const wb = new ExcelJS.Workbook();
  const wsP = wb.addWorksheet('Productos Propios');

  wsP.columns = [
    { header: 'ÍD', key: 'id', width: 6 },
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
    { header: 'STOCK PT E.R.', key: 'stockPTEntreRios', width: 12 },
    { header: 'STOCK PT CABA', key: 'stockPTCABA', width: 12 },
    { header: 'PRODUCIR CABA', key: 'cantidadFabricarCABA', width: 18 },
    { header: 'PRODUCIR E.R.', key: 'cantidadFabricarER', width: 18 },
    { header: 'TRANSFERIR PT', key: 'transferirPT', width: 12 },
    { header: 'CANT (ROTACIÓN)', key: 'rotacionProductos', width: 30 },
  ];
  formatearHeaders(wsP, 18);

  let filaActual = 2;
  (resultados.propios || []).forEach((r, idx) => {
    const N = Math.max(1, r.productosUsados?.length || 0);
    const colorBg = idx % 2 === 0 ? 'FFF9F9F9' : 'FFFFFFFF';

    for (let i = 0; i < N; i++) {
      const pt = r.productosUsados?.[i];
      wsP.addRow({
        id: idx + 1,
        codigoMP: r.codigoMP,
        descripcionMP: r.descripcionMP,
        unidadMedida: r.unidadMedida,
        stockMPEntreRios: r.stockMPEntreRios,
        stockMPCABA: r.stockMPCABA,
        cantidadSugerida: r.cantidadSugerida,
        comprar: r.movimientoSugerido.compra ?? 0,
        transferir: r.movimientoSugerido.transferencia ?? 0,
        criticidad: r.criticidad.toUpperCase(),
        codigoProducto: pt?.codigoProducto || '',
        productosUsados: pt?.descripcion || '',
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
        { horizontal: 'center' as const, vertical: 'middle' as const },
        { horizontal: 'center' as const, vertical: 'middle' as const },
        { horizontal: 'left' as const, vertical: 'middle' as const },
        { horizontal: 'center' as const, vertical: 'middle' as const },
        { horizontal: 'right' as const, vertical: 'middle' as const },
        { horizontal: 'right' as const, vertical: 'middle' as const },
        { horizontal: 'right' as const, vertical: 'middle' as const },
        { horizontal: 'right' as const, vertical: 'middle' as const },
        { horizontal: 'right' as const, vertical: 'middle' as const },
        { horizontal: 'center' as const, vertical: 'middle' as const },
        { horizontal: 'center' as const, vertical: 'middle' as const },
        { horizontal: 'left' as const, vertical: 'middle' as const },
        { horizontal: 'right' as const, vertical: 'middle' as const },
        { horizontal: 'right' as const, vertical: 'middle' as const },
        { horizontal: 'right' as const, vertical: 'middle' as const },
        { horizontal: 'right' as const, vertical: 'middle' as const },
        { horizontal: 'right' as const, vertical: 'middle' as const },
        { horizontal: 'right' as const, vertical: 'middle' as const }
      ];

      for (let c = 1; c <= 18; c++) {
        const cell = row.getCell(c);
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colorBg } };
        cell.border = borderFino;
        cell.alignment = alignConfigs[c - 1];
        cell.font = { name: 'Segoe UI', size: 9 };
        if (c === 5 || c === 6 || c === 7 || c === 8 || c === 9 || c === 13 || c === 14 || c === 15 || c === 16 || c === 17 || c === 18) {
          cell.numFmt = '#,##0.0';
        }
      }
      filaActual++;
    }

  });

  if (filaActual > 2) {
    aplicarBordesExternos(wsP, filaActual - 1, 18);
  }

  // 2. Hoja de Productos Tercerizados
  if (resultados.tercerizados && resultados.tercerizados.length > 0) {
    const wsT = wb.addWorksheet('Productos Tercerizados');
    wsT.columns = [
      { header: 'CÓDIGO PT', key: 'codigoPT', width: 15 },
      { header: 'DESCRIPCIÓN PT', key: 'descripcionPT', width: 45 },
      { header: 'STOCK PT E.R.', key: 'stockPTEntreRios', width: 18 },
      { header: 'STOCK PT CABA', key: 'stockPTCABA', width: 14 },
      { header: 'ROTACIÓN', key: 'rotacion', width: 14 },
      { header: 'COMPRAR', key: 'comprar', width: 12 },
      { header: 'TRANSFERIR', key: 'transferir', width: 12 },
      { header: 'CRITICIDAD', key: 'criticidad', width: 14 },
    ];
    formatearHeaders(wsT, 8);

    let filaActualT = 2;
    resultados.tercerizados.forEach((r, idx) => {
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

  const buffer = await wb.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), `FlowPro_Requerimientos_MRP_${Date.now()}.xlsx`);
}
