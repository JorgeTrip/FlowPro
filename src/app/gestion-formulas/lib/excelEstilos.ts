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
  headerRow.height = 40;
  for (let c = 1; c <= colsCount; c++) {
    const cell = headerRow.getCell(c);
    cell.font = { bold: true, size: 10, name: 'Segoe UI' };
    cell.fill = rellenoHeader;
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.border = borderFino;
  }
}

/**
  * Extrae de forma robusta la representación en texto del valor de una celda de ExcelJS,
  * resolviendo richText, resultados de fórmulas u objetos complejos para evitar "[object Object]".
  */
function obtenerTextoCelda(val: any): string {
  if (val === undefined || val === null) return '';
  if (typeof val === 'object') {
    if ('result' in val) {
      return obtenerTextoCelda(val.result);
    }
    if ('text' in val) {
      return obtenerTextoCelda(val.text);
    }
    if (Array.isArray(val)) {
      return val.map(v => obtenerTextoCelda(v)).join('');
    }
    if ('richText' in val && Array.isArray(val.richText)) {
      return val.richText.map((v: any) => obtenerTextoCelda(v)).join('');
    }
    return '';
  }
  return String(val);
}

/**
  * Ajusta dinámicamente el ancho de todas las columnas según el contenido de sus celdas de datos,
  * ignorando el largo de la cabecera.
  */
export function autoAjustarColumnas(ws: ExcelJS.Worksheet) {
  const colCount = ws.columnCount;
  const rowCount = ws.rowCount;

  for (let c = 1; c <= colCount; c++) {
    let maxLen = 0;

    for (let r = 2; r <= rowCount; r++) {
      const cell = ws.getRow(r).getCell(c);
      if (cell && cell.value !== undefined && cell.value !== null) {
        const strVal = obtenerTextoCelda(cell.value);
        const len = strVal.length;
        if (len > maxLen) {
          maxLen = len;
        }
      }
    }

    // Ancho mínimo de 8 y máximo de 45, basado estrictamente en los datos (no en la cabecera)
    let calculatedWidth = Math.min(Math.max(maxLen + 4, 8), 45);
    
    // Evitamos el bug de serialización de ExcelJS donde un ancho exacto de 9 no se guarda en el XML final
    if (calculatedWidth === 9) {
      calculatedWidth = 9.05;
    }

    ws.getColumn(c).width = calculatedWidth;
  }
}
