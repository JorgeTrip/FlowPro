// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
import * as ExcelJS from 'exceljs';
import { ResultadoMRP } from './types';
import { borderFino, aplicarBordesExternos, formatearHeaders } from './excelEstilos';

/**
 * Agrega la hoja de "Relación MP - PT" desglosada y plana, ideal para ordenamiento y tablas dinámicas.
 */
export function agregarHojaRelacionMPPT(wb: ExcelJS.Workbook, propios: ResultadoMRP[]): void {
  const wsR = wb.addWorksheet('Relación MP - PT');
  wsR.views = [{ state: 'frozen', ySplit: 1 }];

  wsR.columns = [
    { header: 'CÓDIGO MP', key: 'codigoMP' },
    { header: 'DESCRIPCIÓN MP', key: 'descripcionMP' },
    { header: 'CÓDIGO PT', key: 'codigoProducto' },
    { header: 'PRODUCTO TERMINADO', key: 'productosUsados' },
    { header: 'STOCK PT E.R.', key: 'stockPTEntreRios' },
    { header: 'STOCK PT CABA', key: 'stockPTCABA' },
    { header: 'PRODUCIR PT CABA', key: 'cantidadFabricarCABA' },
    { header: 'PRODUCIR PT E.R.', key: 'cantidadFabricarER' },
    { header: 'TRANSFERIR PT (E.R.→CABA)', key: 'transferirPT' },
    { header: 'CANT (ROTACIÓN)', key: 'rotacionProductos' },
  ];
  formatearHeaders(wsR, 10);

  let filaActual = 2;
  let alternarColor = 0; // Para cambiar color de fondo por cada grupo de materia prima

  (propios || []).forEach((r) => {
    const colorBg = alternarColor % 2 === 0 ? 'FFF9F9F9' : 'FFFFFFFF';
    alternarColor++;

    const desgloses = r.productosUsados || [];
    if (desgloses.length === 0) {
      // Si la MP no tiene productos asociados, al menos mostramos la MP vacía de PT
      wsR.addRow({
        codigoMP: r.codigoMP,
        descripcionMP: r.descripcionMP,
        codigoProducto: '',
        productosUsados: '',
        stockPTEntreRios: null,
        stockPTCABA: null,
        cantidadFabricarCABA: null,
        cantidadFabricarER: null,
        transferirPT: null,
        rotacionProductos: '',
      });

      const row = wsR.getRow(filaActual);
      row.height = 20;

      for (let c = 1; c <= 10; c++) {
        const cell = row.getCell(c);
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colorBg } };
        cell.border = borderFino;
        cell.font = { name: 'Segoe UI', size: 9 };
        if (c === 1 || c === 3) {
          cell.alignment = { horizontal: 'center' as const, vertical: 'middle' as const };
        } else {
          cell.alignment = { horizontal: 'left' as const, vertical: 'middle' as const };
        }
      }
      filaActual++;
    } else {
      desgloses.forEach((pt) => {
        wsR.addRow({
          codigoMP: r.codigoMP,
          descripcionMP: r.descripcionMP,
          codigoProducto: pt.codigoProducto,
          productosUsados: pt.descripcion,
          stockPTEntreRios: pt.stockPTEntreRios,
          stockPTCABA: pt.stockPTCABA,
          cantidadFabricarCABA: pt.produccionExistenteCABA,
          cantidadFabricarER: pt.produccionExistenteER,
          transferirPT: pt.transferirPT,
          rotacionProductos: pt.rotacion !== undefined ? pt.rotacion : '',
        });

        const row = wsR.getRow(filaActual);
        row.height = 20;

        const alignConfigs = [
          { horizontal: 'center' as const, vertical: 'middle' as const },
          { horizontal: 'left' as const, vertical: 'middle' as const },
          { horizontal: 'center' as const, vertical: 'middle' as const },
          { horizontal: 'left' as const, vertical: 'middle' as const },
          { horizontal: 'right' as const, vertical: 'middle' as const },
          { horizontal: 'right' as const, vertical: 'middle' as const },
          { horizontal: 'right' as const, vertical: 'middle' as const },
          { horizontal: 'right' as const, vertical: 'middle' as const },
          { horizontal: 'right' as const, vertical: 'middle' as const },
          { horizontal: 'right' as const, vertical: 'middle' as const }
        ];

        for (let c = 1; c <= 10; c++) {
          const cell = row.getCell(c);
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colorBg } };
          cell.border = borderFino;
          cell.alignment = alignConfigs[c - 1];
          cell.font = { name: 'Segoe UI', size: 9 };
          if (c === 5 || c === 6 || c === 7 || c === 8 || c === 9 || c === 10) {
            cell.numFmt = '#,##0.0';
          }
        }
        filaActual++;
      });
    }
  });

  if (filaActual > 2) {
    aplicarBordesExternos(wsR, filaActual - 1, 10);
  }
}
