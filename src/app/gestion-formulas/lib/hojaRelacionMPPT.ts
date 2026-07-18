// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
import * as ExcelJS from 'exceljs';
import { ResultadoMRP } from './types';
import { borderFino, aplicarBordesExternos } from './excelEstilos';

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
    { header: 'STOCK PT\nE.R.', key: 'stockPTEntreRios' },
    { header: 'STOCK PT\nCABA', key: 'stockPTCABA' },
    { header: 'PRODUCIR PT\nCABA', key: 'cantidadFabricarCABA' },
    { header: 'PRODUCIR PT\nE.R.', key: 'cantidadFabricarER' },
    { header: 'TRANSFERIR PT\n(E.R.→CABA)', key: 'transferirPT' },
    { header: 'CANTIDAD\n(ROTACIÓN)', key: 'rotacionProductos' },
  ];
  // Formatear los headers con los colores correspondientes de la app
  const headerRow = wsR.getRow(1);
  headerRow.height = 40;
  for (let c = 1; c <= 10; c++) {
    const cell = headerRow.getCell(c);
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.border = borderFino;

    let fillBg = 'FFF8F9FA'; // Gris default
    let fontColor = 'FF5F6368'; // Gris oscuro

    const esGrisExcel = [1, 2, 3, 4, 10].includes(c);
    const esVerdeER = c === 5;
    const esVioletaCABA = c === 6;
    const esAmarillo = [7, 8, 9].includes(c);

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

  let filaActual = 2;
  let alternarColor = 0; // Para cambiar color de fondo por cada grupo de materia prima

  (propios || []).forEach((r) => {
    const esPar = alternarColor % 2 === 0;
    const colorBgGris = esPar ? 'FFFFFFFF' : 'FFF9F9F9';
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
        
        let cellBg = colorBgGris;
        let cellFontColor = 'FF000000';

        const esVerdeER = c === 5;
        const esVioletaCABA = c === 6;
        const esAmarillo = [7, 8, 9].includes(c);

        if (esVerdeER) {
          cellBg = esPar ? 'FFF4FAF6' : 'FFEBF7EE';
          cellFontColor = 'FF137333';
        } else if (esVioletaCABA) {
          cellBg = esPar ? 'FFF9F5FF' : 'FFF5EBFF';
          cellFontColor = 'FF6B21A8';
        } else if (esAmarillo) {
          cellBg = esPar ? 'FFFFFDF9' : 'FFFFF9F0';
          cellFontColor = 'FFB06000';
        }

        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: cellBg } };
        cell.border = borderFino;
        cell.font = { name: 'Segoe UI', size: 9, color: { argb: cellFontColor } };
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
          
          let cellBg = colorBgGris;
          let cellFontColor = 'FF000000';

          const esVerdeER = c === 5;
          const esVioletaCABA = c === 6;
          const esAmarillo = [7, 8, 9].includes(c);

          if (esVerdeER) {
            cellBg = esPar ? 'FFF4FAF6' : 'FFEBF7EE';
            cellFontColor = 'FF137333';
          } else if (esVioletaCABA) {
            cellBg = esPar ? 'FFF9F5FF' : 'FFF5EBFF';
            cellFontColor = 'FF6B21A8';
          } else if (esAmarillo) {
            cellBg = esPar ? 'FFFFFDF9' : 'FFFFF9F0';
            cellFontColor = 'FFB06000';
          }

          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: cellBg } };
          cell.border = borderFino;
          cell.alignment = alignConfigs[c - 1];
          cell.font = { name: 'Segoe UI', size: 9, color: { argb: cellFontColor } };
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
