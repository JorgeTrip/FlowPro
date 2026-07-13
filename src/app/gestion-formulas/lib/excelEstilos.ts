// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
import * as ExcelJS from 'exceljs';

export const borderFino = {
  top: { style: 'thin' as const, color: { argb: 'FFE0E0E0' } },
  left: { style: 'thin' as const, color: { argb: 'FFE0E0E0' } },
  bottom: { style: 'thin' as const, color: { argb: 'FFE0E0E0' } },
  right: { style: 'thin' as const, color: { argb: 'FFE0E0E0' } }
};

export const rellenoHeader = {
  type: 'pattern' as const,
  pattern: 'solid' as const,
  fgColor: { argb: 'FFCCEEFF' }
};

/**
  * Aplica bordes externos gruesos y bordes finos internos a una hoja de cálculo
  */
export function aplicarBordesExternos(ws: ExcelJS.Worksheet, totalFilas: number, totalCols: number) {
  for (let r = 2; r <= totalFilas; r++) {
    const row = ws.getRow(r);
    for (let c = 1; c <= totalCols; c++) {
      const cell = row.getCell(c);
      cell.border = {
        top: r === 2 ? { style: 'medium' as const, color: { argb: 'FF000000' } } : (cell.border?.top || borderFino.top),
        bottom: r === totalFilas ? { style: 'medium' as const, color: { argb: 'FF000000' } } : (cell.border?.bottom || borderFino.bottom),
        left: c === 1 ? { style: 'medium' as const, color: { argb: 'FF000000' } } : (cell.border?.left || borderFino.left),
        right: c === totalCols ? { style: 'medium' as const, color: { argb: 'FF000000' } } : (cell.border?.right || borderFino.right),
      };
    }
  }
}

/**
  * Aplica formato estándar a las cabeceras de una hoja de cálculo
  */
export function formatearHeaders(ws: ExcelJS.Worksheet, colsCount: number) {
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
